import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';

export type Ing02Mode = 'blank' | 'from_order';

interface Ing02PrintContextValue {
  mode: Ing02Mode;
  setMode: (mode: Ing02Mode) => void;
  entryOrderId: number | null;
  setEntryOrderId: (id: number | null) => void;
}

const Ing02PrintContext = createContext<Ing02PrintContextValue | null>(null);

/**
 * What the ING-02 sheet prints: blank, to fill in by hand at the auction and scan later, or the
 * document of an order (`?entryOrderId=` on arrival, or the one chosen in the config drawer).
 */
export const Ing02PrintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const requested = Number(searchParams.get('entryOrderId')) || null;
  const [mode, setMode] = useState<Ing02Mode>(requested ? 'from_order' : 'blank');
  const [entryOrderId, setEntryOrderId] = useState<number | null>(requested);
  const didApplyUrl = useRef(false);

  useEffect(() => {
    if (didApplyUrl.current || !requested) return;

    didApplyUrl.current = true;
    setEntryOrderId(requested);
    setMode('from_order');
  }, [requested]);

  const value = useMemo(() => ({ mode, setMode, entryOrderId, setEntryOrderId }), [mode, entryOrderId]);

  return <Ing02PrintContext.Provider value={value}>{children}</Ing02PrintContext.Provider>;
};

export const useIng02Print = (): Ing02PrintContextValue => {
  const context = useContext(Ing02PrintContext);

  if (!context) throw new Error('useIng02Print must be used inside Ing02PrintProvider');

  return context;
};
