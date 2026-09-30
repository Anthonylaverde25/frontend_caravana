import type { WeaningOrderSummary } from '@/features/weaning-orders/types';

export { formatDate, formatDateTime, useTransferOrderTableStyles as useWeaningOrderTableStyles } from '@/ui/transfer-orders/components/transferOrderFormat';

/** Where the calves go, in one line: the one batch, or the batches and how many are left for the chute. */
export const destinationsOf = (order: WeaningOrderSummary): string => {
  if (order.destination_mode === 'single') return order.destinations[0]?.label ?? '—';

  const named = order.destinations.map((d) => d.label).join(', ');
  const chute = order.unassigned_head_count > 0 ? `${order.unassigned_head_count} en la manga` : '';

  return [named, chute].filter(Boolean).join(' · ') || 'Se decide en la manga';
};

/** The breeding batches the calves come from, in one line. */
export const sourcesOf = (order: WeaningOrderSummary): string =>
  order.source_batches.length === 0
    ? 'Sin lote'
    : order.source_batches.map((b) => `${b.name ?? `Lote ${b.id}`} (${b.head_count})`).join(', ');

export const managementLabel = (value: boolean | null): string =>
  value === true ? 'Corral' : value === false ? 'Pastura' : 'Sin declarar';

/** The DEST-01 sheet of an order, printable or only to look at depending on its state. */
export const sheetUrl = (orderId: number): string => `/work-templates/DEST-01?weaningOrderId=${orderId}`;
