import type { EntryOrderSummary } from '@/features/entry-orders/types';
import type { TroopSummaryItem } from './EntryTroopSummaryCard';
import { ageOf, breedsOf, formatDate, troopOf, yesNo } from './entryOrderFormat';

/** The troop of a saved order as summary items: what the purchase declared. */
export const troopItemsOf = (order: EntryOrderSummary): TroopSummaryItem[] => [
  { label: 'Proveedor', value: order.provider.name },
  { label: 'Establecimiento', value: `${order.farm.name ?? '—'}${order.farm.renspa ? ` · ${order.farm.renspa}` : ''}` },
  { label: 'Subasta', value: order.auction_number ?? 'No' },
  { label: 'Lote', value: order.batch_name ?? 'Sin nombre todavía' },
  { label: 'Tropa', value: troopOf(order) },
  { label: 'Razas', value: breedsOf(order) },
  { label: 'Estado', value: order.condition_label ?? 'Sin declarar' },
  { label: 'Edad', value: ageOf(order) ?? 'Sin declarar' },
  {
    label: 'Peso',
    value:
      order.estimated_weight == null
        ? 'Sin declarar'
        : `${order.estimated_weight} kg${order.min_weight != null || order.max_weight != null ? ` (${order.min_weight ?? '—'}–${order.max_weight ?? '—'})` : ''}`
  },
  { label: 'Desbaste', value: order.shrink_percent != null ? `${order.shrink_percent} %` : 'Sin declarar' },
  { label: 'Sabe comer', value: yesNo(order.knows_to_eat) },
  { label: 'Garrapata (vacunado)', value: yesNo(order.tick_vaccinated) },
  { label: 'Fecha de compra', value: formatDate(order.purchase_date) }
];
