import React, { createContext, useContext, useMemo, useState } from 'react';

/**
 * A blank sheet filled entirely at the round, or the sheet of a birth order. A sheet printed with
 * females on it is an order to fulfil, and it carries its code.
 */
export type Par01PrintMode = 'blank' | 'from_order';

export interface Par01PrintHeader {
  /** PA-YYYYMMDD-NNNN, blank on a sheet printed without an order or for a draft. */
  orden_paricion: string;
  orden_es_borrador: boolean;
  lote: string;
  periodo: string;
  responsable: string;
}

/**
 * One pregnant female the sheet prints: only her tag. Her due date orders the rows but is not
 * printed; the sire and the teeth are never printed either.
 */
export interface Par01PrintFemale {
  motherId: number;
  motherIdentification: string;
}

const EMPTY_HEADER: Par01PrintHeader = { orden_paricion: '', orden_es_borrador: false, lote: '', periodo: '', responsable: '' };

interface Par01PrintContextValue {
  mode: Par01PrintMode;
  setMode: (mode: Par01PrintMode) => void;
  blankPages: number;
  setBlankPages: (pages: number) => void;
  /** The order the sheet prints, by id: what `printed_at` is stamped on. */
  birthOrderId: number | null;
  setBirthOrderId: (id: number | null) => void;
  /** Why this order's sheet can be looked at but not printed: a draft, or a closed order. */
  orderLockReason: string | null;
  setOrderLockReason: (reason: string | null) => void;
  females: Par01PrintFemale[];
  setFemales: (females: Par01PrintFemale[]) => void;
  header: Par01PrintHeader;
  setHeaderField: <K extends keyof Par01PrintHeader>(field: K, value: Par01PrintHeader[K]) => void;
  reset: () => void;
}

const Par01PrintContext = createContext<Par01PrintContextValue | null>(null);

/**
 * Shares the PAR-01 print setup between the config drawer and the printable sheet. Nothing here is
 * persisted: the order lives in the database and arrives by id.
 */
export const Par01PrintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Par01PrintMode>('blank');
  const [blankPages, setBlankPages] = useState(1);
  const [birthOrderId, setBirthOrderId] = useState<number | null>(null);
  const [orderLockReason, setOrderLockReason] = useState<string | null>(null);
  const [females, setFemales] = useState<Par01PrintFemale[]>([]);
  const [header, setHeader] = useState<Par01PrintHeader>(EMPTY_HEADER);

  const value = useMemo<Par01PrintContextValue>(
    () => ({
      mode,
      setMode,
      blankPages,
      setBlankPages: (pages) => setBlankPages(Math.min(20, Math.max(1, Math.round(pages) || 1))),
      birthOrderId,
      setBirthOrderId,
      orderLockReason,
      setOrderLockReason,
      females,
      setFemales,
      header,
      setHeaderField: (field, fieldValue) => setHeader((prev) => ({ ...prev, [field]: fieldValue })),
      reset: () => {
        setMode('blank');
        setBlankPages(1);
        setBirthOrderId(null);
        setOrderLockReason(null);
        setFemales([]);
        setHeader(EMPTY_HEADER);
      }
    }),
    [mode, blankPages, birthOrderId, orderLockReason, females, header]
  );

  return <Par01PrintContext.Provider value={value}>{children}</Par01PrintContext.Provider>;
};

export const usePar01Print = (): Par01PrintContextValue => {
  const context = useContext(Par01PrintContext);

  if (!context) {
    throw new Error('usePar01Print must be used within Par01PrintProvider');
  }

  return context;
};
