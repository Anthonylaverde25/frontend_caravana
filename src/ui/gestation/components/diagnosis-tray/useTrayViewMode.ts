import { useState } from 'react';

export type TrayViewMode = 'cards' | 'table';

const STORAGE_KEY = 'gestation.tacto.viewMode';

function readStoredMode(): TrayViewMode {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'table' ? 'table' : 'cards';
  } catch {
    return 'cards';
  }
}

/** Cards or table for the diagnosis tray; remembered per browser, cards when storage is unavailable. */
export function useTrayViewMode() {
  const [mode, setMode] = useState<TrayViewMode>(readStoredMode);

  const change = (next: TrayViewMode) => {
    setMode(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not remembered: the choice still applies to this visit.
    }
  };

  return [mode, change] as const;
}
