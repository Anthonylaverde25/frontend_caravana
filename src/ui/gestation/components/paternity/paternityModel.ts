import type { PaternityConfirmation } from '@/features/paternity/hooks/useConfirmPaternities';
import type { PendingPaternity, SireIdentificationMethod } from '@/features/paternity/hooks/usePendingPaternities';

export const METHOD_LABELS: Record<SireIdentificationMethod, string> = {
  operational: 'Servicio controlado',
  phenotype: 'Fenotipo',
  lab_genetic: 'ADN',
};

/** What the user states for a calf. Without a sire the row is not sent. */
export interface PaternityValue {
  father_id: number | null;
  method: SireIdentificationMethod | null;
  notes: string;
}

export type PaternityState = Record<number, PaternityValue>;

export const EMPTY_PATERNITY: PaternityValue = { father_id: null, method: null, notes: '' };

export const valueOf = (state: PaternityState, calfId: number): PaternityValue => state[calfId] ?? EMPTY_PATERNITY;

/** Why a row cannot be sent, or null. Validated on click, never live. */
export function paternityProblem(value: PaternityValue): string | null {
  if (value.father_id !== null && value.method === null) return 'Elegí el método';
  if (value.father_id === null && value.method !== null) return 'Elegí el padre';
  return null;
}

/** The rows with a sire chosen, in the order the backend reports its errors. */
export function toConfirmations(state: PaternityState): PaternityConfirmation[] {
  return Object.entries(state)
    .filter(([, value]) => value.father_id !== null && value.method !== null)
    .map(([calfId, value]) => ({
      calf_id: Number(calfId),
      father_id: value.father_id as number,
      method: value.method as SireIdentificationMethod,
      notes: value.notes.trim() || null,
    }));
}

/** The tag of a calf, or who its mother is when it has none yet. */
export const calfTag = (calf: PendingPaternity): string => calf.calf_identification ?? `Cría de ${calf.mother_identification ?? '—'}`;

export interface PaternityGroup {
  key: string;
  name: string;
  caption: string;
  calves: PendingPaternity[];
}

/** One group per service order; calves without one go last. */
export function groupByOrder(calves: PendingPaternity[]): PaternityGroup[] {
  const groups = new Map<string, PaternityGroup>();
  calves.forEach((calf) => {
    const key = calf.service_order_id ? String(calf.service_order_id) : 'none';
    const group = groups.get(key) ?? {
      key,
      name: calf.service_order_code ? `${calf.service_order_code} · ${calf.batch_name ?? 'Sin lote'}` : 'Sin orden de servicio',
      caption: '',
      calves: [],
    };
    group.calves.push(calf);
    groups.set(key, group);
  });

  return [...groups.values()]
    .sort((a, b) => (a.key === 'none' ? 1 : b.key === 'none' ? -1 : a.name.localeCompare(b.name)))
    .map((group) => ({ ...group, caption: `${group.calves.length} cría(s)` }));
}
