import React, { createContext, useContext, useMemo, useState } from 'react';

export type Dest01PrintMode = 'blank' | 'from_batch';

export interface Dest01PrintHeader {
  lote_destete: string;
  fecha_destete: string;
  tipo_destete: string;
  lote_origen: string;
  responsable: string;
}

export interface Dest01PrintCalf {
  calfId: number;
  calfIdentification: string;
  motherIdentification: string;
  calfSex: string | null;
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/** Same default name the weaning batch dialog proposes. */
export const suggestedWeaningBatchName = (date = new Date()): string =>
  `Destete ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

const EMPTY_HEADER: Dest01PrintHeader = {
  lote_destete: '',
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
  sourceBatchId: number | null;
  setSourceBatchId: (batchId: number | null) => void;
  /** Calves of the source batch the operator unticked; kept here so closing the drawer keeps them. */
  excludedCalfIds: Set<number>;
  setExcludedCalfIds: (ids: Set<number>) => void;
  /** Calves to print pre-loaded (only in `from_batch` mode). */
  calves: Dest01PrintCalf[];
  setCalves: (calves: Dest01PrintCalf[]) => void;
  header: Dest01PrintHeader;
  setHeaderField: <K extends keyof Dest01PrintHeader>(field: K, value: Dest01PrintHeader[K]) => void;
  reset: () => void;
}

const Dest01PrintContext = createContext<Dest01PrintContextValue | null>(null);

/**
 * Shares the DEST-01 print setup between the config drawer and the printable sheet. Nothing here
 * is persisted: "armar desde el programa" only pre-loads the printed sheet.
 */
export const Dest01PrintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Dest01PrintMode>('blank');
  const [blankPages, setBlankPages] = useState(1);
  const [sourceBatchId, setSourceBatchId] = useState<number | null>(null);
  const [excludedCalfIds, setExcludedCalfIds] = useState<Set<number>>(new Set());
  const [calves, setCalves] = useState<Dest01PrintCalf[]>([]);
  const [header, setHeader] = useState<Dest01PrintHeader>(EMPTY_HEADER);

  const value = useMemo<Dest01PrintContextValue>(
    () => ({
      mode,
      setMode,
      blankPages,
      setBlankPages: (pages) => setBlankPages(Math.min(20, Math.max(1, Math.round(pages) || 1))),
      sourceBatchId,
      setSourceBatchId,
      excludedCalfIds,
      setExcludedCalfIds,
      calves,
      setCalves,
      header,
      setHeaderField: (field, fieldValue) => setHeader((prev) => ({ ...prev, [field]: fieldValue })),
      reset: () => {
        setMode('blank');
        setBlankPages(1);
        setSourceBatchId(null);
        setExcludedCalfIds(new Set());
        setCalves([]);
        setHeader(EMPTY_HEADER);
      },
    }),
    [mode, blankPages, sourceBatchId, excludedCalfIds, calves, header]
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
