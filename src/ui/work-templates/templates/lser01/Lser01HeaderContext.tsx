import React, { createContext, useContext, useMemo, useState } from 'react';

export interface Lser01PrintHeader {
  lote: string;
  toro_caravana: string;
  planned_start_date: string;
  planned_end_date: string;
  responsable: string;
}

const EMPTY_HEADER: Lser01PrintHeader = {
  lote: '',
  toro_caravana: '',
  planned_start_date: '',
  planned_end_date: '',
  responsable: '',
};

interface Lser01HeaderContextValue {
  header: Lser01PrintHeader;
  setHeaderField: <K extends keyof Lser01PrintHeader>(field: K, value: Lser01PrintHeader[K]) => void;
  resetHeader: () => void;
}

const Lser01HeaderContext = createContext<Lser01HeaderContextValue | null>(null);

/** Shares the pre-filled LSER-01 header between the config drawer and the printable sheet. */
export const Lser01HeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [header, setHeader] = useState<Lser01PrintHeader>(EMPTY_HEADER);

  const value = useMemo<Lser01HeaderContextValue>(
    () => ({
      header,
      setHeaderField: (field, fieldValue) => setHeader((prev) => ({ ...prev, [field]: fieldValue })),
      resetHeader: () => setHeader(EMPTY_HEADER),
    }),
    [header]
  );

  return <Lser01HeaderContext.Provider value={value}>{children}</Lser01HeaderContext.Provider>;
};

export const useLser01Header = (): Lser01HeaderContextValue => {
  const context = useContext(Lser01HeaderContext);
  if (!context) {
    throw new Error('useLser01Header must be used within Lser01HeaderProvider');
  }
  return context;
};
