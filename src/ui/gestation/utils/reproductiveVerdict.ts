import type { FemaleReproductiveVerdict, NotDiagnosedReason } from '@/features/gestation/hooks/useServiceOrders';

export type ChipColor = 'success' | 'error' | 'default' | 'warning' | 'info';

export const STAGE_LABELS: Record<'head' | 'body' | 'tail', string> = {
  head: 'Cabeza',
  body: 'Cuerpo',
  tail: 'Cola',
};

export const NOT_DIAGNOSED_REASON_LABELS: Record<NotDiagnosedReason, string> = {
  NOT_GATHERED: 'No bajó a manga',
  NOT_FOUND: 'No se encontró',
  OTHER: 'Otro motivo',
};

/** Stage label, or null when the producer did not declare it ("Preñada" alone is valid). */
export function stageLabel(stage?: string | null): string | null {
  return stage && stage in STAGE_LABELS ? STAGE_LABELS[stage as keyof typeof STAGE_LABELS] : null;
}

/** Stage implied by the months of a scan (same thresholds as the backend). */
export function stageFromMonths(months: number): 'head' | 'body' | 'tail' {
  if (months <= 1) return 'tail';
  if (months <= 2) return 'body';
  return 'head';
}

interface VerdictInput {
  reproductive_status: FemaleReproductiveVerdict;
  gestation_stage?: string | null;
  not_diagnosed_reason?: NotDiagnosedReason | null;
  is_provisional_empty?: boolean;
}

/**
 * Label and color of the current verdict of a female. Pregnant without stage reads "Preñada";
 * an empty scanned while still with the bulls is provisional.
 */
export function verdictChip(female: VerdictInput): { label: string; color: ChipColor } {
  switch (female.reproductive_status) {
    case 'PREGNANT': {
      const stage = stageLabel(female.gestation_stage);
      return { label: stage ? `Preñada (${stage})` : 'Preñada', color: 'success' };
    }
    case 'EMPTY':
      return female.is_provisional_empty
        ? { label: 'Vacía provisoria · sigue con toros', color: 'warning' }
        : { label: 'Vacía', color: 'error' };
    case 'NOT_DIAGNOSED':
      return {
        label: female.not_diagnosed_reason
          ? `Sin diagnóstico · ${NOT_DIAGNOSED_REASON_LABELS[female.not_diagnosed_reason]}`
          : 'Sin diagnóstico',
        color: 'default',
      };
    case 'EXITED':
      return { label: 'Salió (muerte / venta)', color: 'default' };
    default:
      return { label: 'Pendiente de tacto', color: 'info' };
  }
}

export const VERDICT_SHORT_LABELS: Record<FemaleReproductiveVerdict, string> = {
  UNCHECKED: 'Sin tactar',
  PREGNANT: 'Preñada',
  EMPTY: 'Vacía',
  NOT_DIAGNOSED: 'Sin diagnóstico',
  EXITED: 'Salió',
};

/** dd/mm/yyyy for a Y-m-d date. */
export function formatDay(date?: string | null): string {
  if (!date) return '—';
  const [y, m, d] = date.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
