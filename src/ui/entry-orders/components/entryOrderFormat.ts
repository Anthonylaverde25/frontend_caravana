import type { EntryOrderSummary } from '@/features/entry-orders/types';

export { formatDate, formatDateTime, useTransferOrderTableStyles as useEntryOrderTableStyles } from '@/ui/transfer-orders/components/transferOrderFormat';

/** "Juan Pérez · La Porteña". */
export const originOf = (order: EntryOrderSummary): string =>
  [order.provider.name, order.farm.name].filter(Boolean).join(' · ') || '—';

/** "40 Ternero · Ambos (25 M / 15 H)"; what a draft has declared so far, or "Sin declarar". */
export const troopOf = (order: EntryOrderSummary): string => {
  if (order.head_count == null && order.category.name == null && order.sex_composition == null) return 'Sin declarar';

  const sexes =
    order.sex_composition === 'MIXED' && order.male_count != null && order.female_count != null
      ? `Ambos (${order.male_count} M / ${order.female_count} H)`
      : order.sex_composition_label;

  return [[order.head_count, order.category.name].filter((v) => v != null).join(' '), sexes].filter(Boolean).join(' · ');
};

/** "A · Braford Colorado, B · Brangus Negro". */
export const breedsOf = (order: EntryOrderSummary): string =>
  order.breeds.map((b) => `${b.letter} · ${b.label}`).join(', ') || '—';

/** "9/10 meses", or null. */
export const ageOf = (order: EntryOrderSummary): string | null => (order.age_range ? `${order.age_range} meses` : null);

export const yesNo = (value: boolean | null): string => (value == null ? 'Sin declarar' : value ? 'Sí' : 'No');

/**
 * Whether DTE and reception counters say anything about the order. A draft has not bought yet and
 * an order cancelled before its first DTE never expected one: "0 / 20 recibidas" is only noise.
 */
export const tracksReception = (order: Pick<EntryOrderSummary, 'status' | 'dte_count'>): boolean =>
  order.status !== 'DRAFT' && !(order.status === 'CANCELLED' && order.dte_count === 0);

/** A draft that already declares everything confirming the purchase needs. */
export const isTroopComplete = (order: EntryOrderSummary): boolean =>
  order.batch_name != null &&
  order.head_count != null &&
  order.category.id != null &&
  order.sex_composition != null &&
  order.condition != null &&
  order.knows_to_eat != null &&
  order.tick_vaccinated != null &&
  order.estimated_weight != null &&
  order.breeds.length > 0;

/** "1 caravana", "3 caravanas". */
export const caravansOf = (count: number): string => (count === 1 ? '1 caravana' : `${count} caravanas`);

/** The ING-02 document of an order. */
export const sheetUrl = (orderId: number): string => `/work-templates/ING-02?entryOrderId=${orderId}`;

export const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
