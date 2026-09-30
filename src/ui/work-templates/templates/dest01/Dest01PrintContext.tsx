import React, { createContext, useContext, useMemo, useState } from 'react';
import type { WeaningOrderCategoryMode } from '@/features/weaning-orders/types';

/**
 * A blank sheet filled entirely at the chute, or the sheet of a weaning order. There is no third
 * way: a sheet printed with calves on it is an order to fulfil, and it carries its code.
 */
export type Dest01PrintMode = 'blank' | 'from_order';

/** One weaning batch for every calf (header), or a batch per calf (a column). */
export type Dest01DestinationMode = 'single' | 'per_animal';

export interface Dest01PrintHeader {
  /** DS-YYYYMMDD-NNNN, blank on a sheet printed without an order or for a draft. */
  orden_destete: string;
  orden_es_borrador: boolean;
  lote_destete: string;
  /** CORRAL | PASTURA | '' — the box of the header, for the single weaning batch. */
  sistema_manejo: string;
  fecha_destete: string;
  /** The printed word: TRADICIONAL | ANTICIPADO | PRECOZ | ''. */
  tipo_destete: string;
  lote_origen: string;
  responsable: string;
}

export interface Dest01PrintCalf {
  calfId: number;
  calfIdentification: string;
  motherIdentification: string;
  calfSex: string | null;
  /** Printed greyed: only to find the calf. */
  currentCategory: string | null;
  /** Printed by a DECLARED order; blank otherwise. */
  targetCategory: string | null;
  /** Per-animal orders: the batch of this calf, blank when it is decided at the chute. */
  destinationLabel: string | null;
  /** Per-animal orders: C, P or blank. */
  management: 'C' | 'P' | '';
}

/** Which C/S column the sheet prints: none (the category does not change), declared, or blank. */
export type Dest01CategoryColumn = 'none' | 'declared' | 'at_chute';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/** Same default name the weaning batch dialog proposes. */
export const suggestedWeaningBatchName = (date = new Date()): string =>
  `Destete ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

const EMPTY_HEADER: Dest01PrintHeader = {
  orden_destete: '',
  orden_es_borrador: false,
  lote_destete: '',
  sistema_manejo: '',
  fecha_destete: '',
  tipo_destete: '',
  lote_origen: '',
  responsable: '',
};

interface Dest01PrintContextValue {
  mode: Dest01PrintMode;
  setMode: (mode: Dest01PrintMode) => void;
  blankPages: number;
  setBlankPages: (pages: number) => void;
  destinationMode: Dest01DestinationMode;
  setDestinationMode: (mode: Dest01DestinationMode) => void;
  /** The order the sheet prints, by id: what `printed_at` is stamped on. */
  weaningOrderId: number | null;
  setWeaningOrderId: (id: number | null) => void;
  categoryMode: WeaningOrderCategoryMode | null;
  setCategoryMode: (mode: WeaningOrderCategoryMode | null) => void;
  /** Why this order's sheet can be looked at but not printed: a draft, or a closed order. */
  orderLockReason: string | null;
  setOrderLockReason: (reason: string | null) => void;
  calves: Dest01PrintCalf[];
  setCalves: (calves: Dest01PrintCalf[]) => void;
  header: Dest01PrintHeader;
  setHeaderField: <K extends keyof Dest01PrintHeader>(field: K, value: Dest01PrintHeader[K]) => void;
  reset: () => void;
}

const Dest01PrintContext = createContext<Dest01PrintContextValue | null>(null);

/**
 * Shares the DEST-01 print setup between the config drawer and the printable sheet. Nothing here is
 * persisted: the order lives in the database and arrives by id.
 */
export const Dest01PrintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Dest01PrintMode>('blank');
  const [blankPages, setBlankPages] = useState(1);
  const [destinationMode, setDestinationMode] = useState<Dest01DestinationMode>('single');
  const [weaningOrderId, setWeaningOrderId] = useState<number | null>(null);
  const [categoryMode, setCategoryMode] = useState<WeaningOrderCategoryMode | null>(null);
  const [orderLockReason, setOrderLockReason] = useState<string | null>(null);
  const [calves, setCalves] = useState<Dest01PrintCalf[]>([]);
  const [header, setHeader] = useState<Dest01PrintHeader>(EMPTY_HEADER);

  const value = useMemo<Dest01PrintContextValue>(
    () => ({
      mode,
      setMode,
      blankPages,
      setBlankPages: (pages) => setBlankPages(Math.min(20, Math.max(1, Math.round(pages) || 1))),
      destinationMode,
      setDestinationMode,
      weaningOrderId,
      setWeaningOrderId,
      categoryMode,
      setCategoryMode,
      orderLockReason,
      setOrderLockReason,
      calves,
      setCalves,
      header,
      setHeaderField: (field, fieldValue) => setHeader((prev) => ({ ...prev, [field]: fieldValue })),
      reset: () => {
        setMode('blank');
        setBlankPages(1);
        setDestinationMode('single');
        setWeaningOrderId(null);
        setCategoryMode(null);
        setOrderLockReason(null);
        setCalves([]);
        setHeader(EMPTY_HEADER);
      },
    }),
    [mode, blankPages, destinationMode, weaningOrderId, categoryMode, orderLockReason, calves, header]
  );

  return <Dest01PrintContext.Provider value={value}>{children}</Dest01PrintContext.Provider>;
};

export const useDest01Print = (): Dest01PrintContextValue => {
  const context = useContext(Dest01PrintContext);
  if (!context) {
    throw new Error('useDest01Print must be used within Dest01PrintProvider');
  }
  return context;
};

/**
 * The C/S nueva column of the sheet: printed by a declared order, blank when it is decided at the
 * chute — which a sheet without an order always is — and left out when the order says it does not
 * change.
 */
export const categoryColumnOf = (mode: Dest01PrintMode, categoryMode: WeaningOrderCategoryMode | null): Dest01CategoryColumn =>
  mode === 'blank' || categoryMode === null ? 'at_chute' : categoryMode === 'DECLARED' ? 'declared' : categoryMode === 'KEEP' ? 'none' : 'at_chute';
