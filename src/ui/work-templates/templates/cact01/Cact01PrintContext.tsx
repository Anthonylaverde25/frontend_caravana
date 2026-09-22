import React, { createContext, useContext, useMemo, useState } from 'react';

export type Cact01PrintMode = 'blank' | 'from_batch';

/**
 * One destination for everybody (the header names it) or one per animal (a printed
 * column). The schema is the same either way: the row cell wins, the header is the
 * default. Only the printed sheet changes.
 */
export type Cact01DestinationMode = 'single' | 'per_row';

export interface Cact01PrintHeader {
  actividad_origen: string;
  actividad_destino: string;
  lote_origen: string;
  lote_destino: string;
  fecha_movimiento: string;
  /** 'CORRAL' | 'PASTURA' | '' — proposal for the destination batches that get created. */
  sistema_manejo: string;
  responsable: string;
}

export interface Cact01PrintAnimal {
  caravanId: number;
  identification: string;
  sex: string | null;
  category: string | null;
  teeth: string | null;
  currentWeight: number | null;
}

const EMPTY_HEADER: Cact01PrintHeader = {
  actividad_origen: '',
  actividad_destino: '',
  lote_origen: '',
  lote_destino: '',
  fecha_movimiento: '',
  sistema_manejo: '',
  responsable: '',
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
  header: Cact01PrintHeader;
  setHeaderField: <K extends keyof Cact01PrintHeader>(field: K, value: Cact01PrintHeader[K]) => void;
  reset: () => void;
}

const Cact01PrintContext = createContext<Cact01PrintContextValue | null>(null);

/**
 * Shares the CACT-01 print setup between the config drawer and the printable sheet.
 * Nothing here is persisted: building the sheet from the program only pre-loads paper.
 */
export const Cact01PrintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Cact01PrintMode>('blank');
  const [destinationMode, setDestinationMode] = useState<Cact01DestinationMode>('single');
  const [blankPages, setBlankPages] = useState(1);
  const [sourceBatchId, setSourceBatchId] = useState<number | null>(null);
  const [excludedCaravanIds, setExcludedCaravanIds] = useState<Set<number>>(new Set());
  const [animals, setAnimals] = useState<Cact01PrintAnimal[]>([]);
  const [header, setHeader] = useState<Cact01PrintHeader>(EMPTY_HEADER);

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
      header,
      setHeaderField: (field, fieldValue) => setHeader((prev) => ({ ...prev, [field]: fieldValue })),
      reset: () => {
        setMode('blank');
        setDestinationMode('single');
        setBlankPages(1);
        setSourceBatchId(null);
        setExcludedCaravanIds(new Set());
        setAnimals([]);
        setHeader(EMPTY_HEADER);
      },
    }),
    [mode, destinationMode, blankPages, sourceBatchId, excludedCaravanIds, animals, header]
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
