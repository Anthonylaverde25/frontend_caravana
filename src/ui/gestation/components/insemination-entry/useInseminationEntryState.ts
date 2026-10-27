import { useEffect, useMemo, useState } from 'react';
import type { SemenOption } from '@/features/semen/hooks/useSemenOptions';
import { todayIso } from '../../utils/reproductiveVerdict';
import { defaultLot, draftFor, type InseminationDefaults, type InseminationDraft, type InseminationFemale } from './inseminationEntryModel';

/**
 * State of the insemination sheet: a draft per female, the defaults of the load (date, tank, straws)
 * that fill every row not typed by hand, the marked rows and the cell errors of the last attempt.
 */
export function useInseminationEntryState(females: InseminationFemale[], byId: Map<number, SemenOption>, defaultTankId: number | null) {
  const [defaults, setDefaultsState] = useState<InseminationDefaults>({ date: todayIso(), warehouseId: null, straws: 1, lots: {} });
  const [drafts, setDrafts] = useState<Record<number, InseminationDraft>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  /** Inseminated females opened again to add another insemination (DB10). */
  const [adding, setAdding] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});

  useEffect(() => {
    if (defaultTankId && defaults.warehouseId === null) setDefaultsState((prev) => ({ ...prev, warehouseId: defaultTankId }));
  }, [defaultTankId, defaults.warehouseId]);

  // Rows not typed by hand follow the defaults and the planned semen: derived, never stored.
  const effective = useMemo(() => {
    const out: Record<number, InseminationDraft> = {};
    females.forEach((female) => {
      const typed = drafts[female.id];
      out[female.id] = typed?.touched ? typed : draftFor(female, defaults, byId);
    });
    return out;
  }, [females, drafts, defaults, byId]);

  const update = (id: number, patch: Partial<InseminationDraft>) => {
    setDrafts((prev) => {
      const current = prev[id]?.touched ? prev[id] : effective[id];
      const merged = { ...current, ...patch, touched: true };
      // A new semen or tank picks its lot again.
      if (patch.itemId !== undefined || patch.warehouseId !== undefined) {
        merged.lot = defaultLot(merged.itemId ? byId.get(merged.itemId) : undefined, merged.warehouseId);
      }
      return { ...prev, [id]: merged };
    });
    setSelected((prev) => new Set(prev).add(id));
    setErrors((prev) => ({ ...prev, [id]: {} }));
  };

  const selectMany = (ids: number[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const editable = useMemo(() => new Set(females.filter((f) => f.live.length === 0 || adding.has(f.id)).map((f) => f.id)), [females, adding]);

  return {
    defaults,
    // A new tank drops the lots chosen for the previous one.
    setDefaults: (patch: Partial<InseminationDefaults>) =>
      setDefaultsState((prev) => ({ ...prev, ...patch, ...(patch.warehouseId !== undefined && patch.warehouseId !== prev.warehouseId ? { lots: {} } : {}) })),
    drafts: effective,
    update,
    selected,
    toggleSelected: (id: number) => selectMany([id], !selected.has(id)),
    selectMany,
    editable,
    addAnother: (id: number) => {
      setAdding((prev) => new Set(prev).add(id));
      selectMany([id], true);
    },
    errors,
    setErrors,
    reset: () => {
      setSelected(new Set());
      setAdding(new Set());
      setErrors({});
      setDrafts({});
    },
  };
}

export type InseminationEntryController = ReturnType<typeof useInseminationEntryState>;
