import React, { createContext, useContext, useMemo, useState } from 'react';
import type { TransferOrderCategoryMode } from '@/features/transfer-orders/types';

/**
 * The destination of one animal on an order: its batch, and the management system of that
 * batch.
 *
 * Both travel because both get printed. The management letter is not a property of the
 * animal — it is what the batch named beside it declares, which is why it rides along with
 * the name instead of in a column of its own.
 */
export interface Cact01OrderAssignment {
  lote: string;
  /** 'C' = corral, 'P' = pastura, '' = the batch does not declare it. */
  manejo: 'C' | 'P' | '';
}

export type Cact01PrintMode = 'blank' | 'from_batch';

/**
 * One destination for everybody (the header names it) or one per animal (a printed
 * column). The schema is the same either way: the row cell wins, the header is the
 * default. Only the printed sheet changes.
 */
export type Cact01DestinationMode = 'single' | 'per_row';

export interface Cact01PrintHeader {
  actividad_origen: string;
  /**
   * The destination activity, as an id and as the name that gets printed.
   *
   * One per sheet, however many pages it runs to. It is what makes the handwritten batch
   * cell verifiable: whatever gets written at the chute has to be a batch of THIS activity,
   * existing or to be created.
   */
  actividad_destino_id: number | null;
  actividad_destino: string;
  lote_origen: string;
  lote_destino: string;
  fecha_movimiento: string;
  /** 'CORRAL' | 'PASTURA' | '' — what the single destination batch declares. */
  sistema_manejo: string;
  responsable: string;
  /** Code of the transfer order the sheet prints, TR-YYYYMMDD-NNNN. Blank on a sheet without one. */
  orden_transferencia: string;
  /**
   * The order is still a draft: the sheet is a preview, and its order box says so instead of
   * printing a code that commits nothing yet.
   */
  orden_es_borrador: boolean;
}

export interface Cact01PrintAnimal {
  caravanId: number;
  identification: string;
  sex: string | null;
  /** The current C/S, greyed: it identifies the animal and is never corrected on this sheet. */
  category: string | null;
  /**
   * The new C/S a DECLARED order gives this animal, printed in the C/S nueva column. Null prints
   * a dash: that animal keeps its category.
   */
  categoryNew?: string | null;
  teeth: string | null;
  currentWeight: number | null;
  /**
   * Destination assigned from the transfer screen. Null means it was deliberately left for
   * the chute, and the cell prints blank so somebody can write it there.
   */
  destino?: string | null;
  /**
   * Management system of THAT destination batch: 'C', 'P' or blank.
   *
   * It says nothing about the animal. It is printed beside the batch name because the batch
   * is what declares it, and it goes out blank whenever the batch does — including when the
   * batch itself is still to be decided at the chute.
   */
  manejo?: string | null;
}

const EMPTY_HEADER: Cact01PrintHeader = {
  actividad_origen: '',
  actividad_destino_id: null,
  actividad_destino: '',
  lote_origen: '',
  lote_destino: '',
  fecha_movimiento: '',
  sistema_manejo: '',
  responsable: '',
  orden_transferencia: '',
  orden_es_borrador: false,
};

interface Cact01PrintContextValue {
  mode: Cact01PrintMode;
  setMode: (mode: Cact01PrintMode) => void;
  destinationMode: Cact01DestinationMode;
  setDestinationMode: (mode: Cact01DestinationMode) => void;
  blankPages: number;
  setBlankPages: (pages: number) => void;
  sourceBatchId: number | null;
  setSourceBatchId: (batchId: number | null) => void;
  /** Animals of the source batch the operator unticked; kept so closing the drawer keeps them. */
  excludedCaravanIds: Set<number>;
  setExcludedCaravanIds: (ids: Set<number>) => void;
  animals: Cact01PrintAnimal[];
  setAnimals: (animals: Cact01PrintAnimal[]) => void;
  /**
   * The work order left by the transfer screen, once it has been read.
   *
   * It lives here and not inside the config drawer because the printable sheet needs it
   * whether or not anybody opened that drawer — which is exactly how the sheet used to
   * come out blank after a selection had already been made.
   */
  orderCaravanIds: number[] | null;
  orderAssignments: Record<number, Cact01OrderAssignment> | null;
  applyOrderSelection: (
    caravanIds: number[],
    assignments: Record<number, Cact01OrderAssignment> | null
  ) => void;
  /**
   * The transfer order being printed, by id. It is what `printed_at` gets stamped on when the
   * sheet actually goes out.
   */
  transferOrderId: number | null;
  setTransferOrderId: (id: number | null) => void;
  /**
   * Whether the order says the category changes. Null without an order: a sheet printed without
   * one is decided entirely at the chute, so it prints the C/S nueva column blank.
   */
  categoryMode: TransferOrderCategoryMode | null;
  /** The target C/S of each animal of a DECLARED order, by caravan id. */
  orderCategoryTargets: Record<number, string> | null;
  applyOrderCategories: (mode: TransferOrderCategoryMode | null, targets: Record<number, string> | null) => void;
  /**
   * Why this order's sheet can be looked at but not printed: a draft (not issued yet) or a closed
   * order (executed, closed incomplete or cancelled). Null when it can go out on paper.
   */
  orderLockReason: string | null;
  setOrderLockReason: (reason: string | null) => void;
  /**
   * The animals printed straight from the order's roll, instead of from who is in the source
   * batch today. Used for closed orders, whose animals already left the batch: without it their
   * sheet would come out empty.
   */
  rollAnimals: Cact01PrintAnimal[] | null;
  setRollAnimals: (animals: Cact01PrintAnimal[] | null) => void;
  header: Cact01PrintHeader;
  setHeaderField: <K extends keyof Cact01PrintHeader>(field: K, value: Cact01PrintHeader[K]) => void;
  reset: () => void;
}

const Cact01PrintContext = createContext<Cact01PrintContextValue | null>(null);

/**
 * Shares the CACT-01 print setup between the config drawer and the printable sheet.
 *
 * Nothing here is persisted: the order itself lives in the database and arrives by id, so
 * reloading the view — or opening its URL on another computer — prints the same sheet.
 */
export const Cact01PrintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Cact01PrintMode>('blank');
  const [destinationMode, setDestinationMode] = useState<Cact01DestinationMode>('single');
  const [blankPages, setBlankPages] = useState(1);
  const [sourceBatchId, setSourceBatchId] = useState<number | null>(null);
  const [excludedCaravanIds, setExcludedCaravanIds] = useState<Set<number>>(new Set());
  const [animals, setAnimals] = useState<Cact01PrintAnimal[]>([]);
  const [orderCaravanIds, setOrderCaravanIds] = useState<number[] | null>(null);
  const [orderAssignments, setOrderAssignments] = useState<Record<number, Cact01OrderAssignment> | null>(
    null
  );
  const [header, setHeader] = useState<Cact01PrintHeader>(EMPTY_HEADER);
  const [transferOrderId, setTransferOrderId] = useState<number | null>(null);
  const [orderLockReason, setOrderLockReason] = useState<string | null>(null);
  const [rollAnimals, setRollAnimals] = useState<Cact01PrintAnimal[] | null>(null);
  const [categoryMode, setCategoryMode] = useState<TransferOrderCategoryMode | null>(null);
  const [orderCategoryTargets, setOrderCategoryTargets] = useState<Record<number, string> | null>(null);

  const value = useMemo<Cact01PrintContextValue>(
    () => ({
      mode,
      setMode,
      destinationMode,
      setDestinationMode,
      blankPages,
      setBlankPages: (pages) => setBlankPages(Math.min(20, Math.max(1, Math.round(pages) || 1))),
      sourceBatchId,
      setSourceBatchId,
      excludedCaravanIds,
      setExcludedCaravanIds,
      animals,
      setAnimals,
      orderCaravanIds,
      orderAssignments,
      applyOrderSelection: (caravanIds, assignments) => {
        setOrderCaravanIds(caravanIds);
        setOrderAssignments(assignments);
      },
      transferOrderId,
      setTransferOrderId,
      categoryMode,
      orderCategoryTargets,
      applyOrderCategories: (nextMode, targets) => {
        setCategoryMode(nextMode);
        setOrderCategoryTargets(targets);
      },
      orderLockReason,
      setOrderLockReason,
      rollAnimals,
      setRollAnimals,
      header,
      setHeaderField: (field, fieldValue) => setHeader((prev) => ({ ...prev, [field]: fieldValue })),
      reset: () => {
        setMode('blank');
        setDestinationMode('single');
        setBlankPages(1);
        setSourceBatchId(null);
        setExcludedCaravanIds(new Set());
        setAnimals([]);
        setOrderCaravanIds(null);
        setOrderAssignments(null);
        setHeader(EMPTY_HEADER);
        setTransferOrderId(null);
        setOrderLockReason(null);
        setRollAnimals(null);
        setCategoryMode(null);
        setOrderCategoryTargets(null);
      },
    }),
    [
      mode,
      destinationMode,
      blankPages,
      sourceBatchId,
      excludedCaravanIds,
      animals,
      header,
      orderCaravanIds,
      orderAssignments,
      transferOrderId,
      orderLockReason,
      rollAnimals,
      categoryMode,
      orderCategoryTargets,
    ]
  );

  return <Cact01PrintContext.Provider value={value}>{children}</Cact01PrintContext.Provider>;
};

export const useCact01Print = (): Cact01PrintContextValue => {
  const context = useContext(Cact01PrintContext);

  if (!context) {
    throw new Error('useCact01Print must be used within Cact01PrintProvider');
  }

  return context;
};
