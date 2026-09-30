import type { BirthOrderSummary } from '@/features/birth-orders/types';
import { GESTATION_STAGE_LABELS } from '@/features/birth-orders/types';

export { formatDate, formatDateTime, useTransferOrderTableStyles as useBirthOrderTableStyles } from '@/ui/transfer-orders/components/transferOrderFormat';

/** The batches the females come from, in one line. */
export const sourcesOf = (order: BirthOrderSummary): string =>
  order.source_batches.length === 0
    ? 'Sin lote'
    : order.source_batches.map((b) => `${b.name ?? `Lote ${b.id}`} (${b.head_count})`).join(', ');

/** The calving window, in one line. */
export const periodOf = (order: Pick<BirthOrderSummary, 'period_start' | 'period_end'>): string => {
  const format = (iso: string | null) => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : null);
  const start = format(order.period_start);
  const end = format(order.period_end);

  if (start && end) return start === end ? start : `${start} → ${end}`;

  return start ? `Desde ${start}` : end ? `Hasta ${end}` : 'Sin período';
};

/** Where the season stands: calvings and losses so far. */
export const outcomesOf = (order: BirthOrderSummary): string => {
  const parts = [`${order.born_head_count} parto(s)`];

  if (order.stillborn_head_count > 0) parts.push(`${order.stillborn_head_count} nac. muerto(s)`);
  if (order.abortion_head_count > 0) parts.push(`${order.abortion_head_count} aborto(s)`);

  return parts.join(' · ');
};

export const stageLabel = (stage: string | null | undefined): string => (stage ? (GESTATION_STAGE_LABELS[stage] ?? stage) : '—');

/** Days to the due date: negative when it already passed. */
export const daysToDue = (due: string | null | undefined): number | null => {
  if (!due) return null;

  const today = new Date(new Date().toISOString().slice(0, 10)).getTime();

  return Math.round((new Date(due.slice(0, 10)).getTime() - today) / 86400000);
};

export const dueLabel = (due: string | null | undefined): string => {
  const days = daysToDue(due);

  if (days == null) return 'Sin FPP';

  const date = (due as string).slice(0, 10).split('-').reverse().join('/');

  return days === 0 ? `${date} · hoy` : days > 0 ? `${date} · en ${days} d` : `${date} · hace ${-days} d`;
};

/** The PAR-01 sheet of an order, printable or only to look at depending on its state. */
export const sheetUrl = (orderId: number): string => `/work-templates/PAR-01?birthOrderId=${orderId}`;
