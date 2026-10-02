import type { EntryOrderSummary } from '@/features/entry-orders/types';

export { formatDate, formatDateTime, useTransferOrderTableStyles as useEntryOrderTableStyles } from '@/ui/transfer-orders/components/transferOrderFormat';

/** "Juan Pérez · La Porteña". */
export const originOf = (order: EntryOrderSummary): string =>
  [order.provider.name, order.farm.name].filter(Boolean).join(' · ') || '—';

/** "40 Ternero · Ambos (25 M / 15 H)". */
export const troopOf = (order: EntryOrderSummary): string => {
  const sexes =
    order.sex_composition === 'MIXED' && order.male_count != null && order.female_count != null
      ? `Ambos (${order.male_count} M / ${order.female_count} H)`
      : order.sex_composition_label;

  return `${order.head_count} ${order.category.name ?? ''} · ${sexes}`.trim();
};

/** "A · Braford Colorado, B · Brangus Negro". */
export const breedsOf = (order: EntryOrderSummary): string =>
  order.breeds.map((b) => `${b.letter} · ${b.label}`).join(', ') || '—';

/** "9/10 meses", or null. */
export const ageOf = (order: EntryOrderSummary): string | null => (order.age_range ? `${order.age_range} meses` : null);

export const yesNo = (value: boolean): string => (value ? 'Sí' : 'No');

/** The ING-02 document of an order. */
export const sheetUrl = (orderId: number): string => `/work-templates/ING-02?entryOrderId=${orderId}`;

export const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
