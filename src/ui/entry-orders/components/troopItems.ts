import type { EntryOrder, EntryOrderSummary } from '@/features/entry-orders/types';
import type { TroopSummaryItem } from './EntryTroopSummaryCard';
import { ageOf, breedsOf, formatDate, troopOf, yesNo } from './entryOrderFormat';

/** "1 Novillito 3/6 · 2 Torito 0/4": head received of each category, on the detail of an order of several. */
const receivedByCategoryOf = (order: EntryOrderSummary | EntryOrder): TroopSummaryItem[] => {
  const received = 'received_by_category' in order ? order.received_by_category : undefined;

  if (!received || order.status === 'DRAFT') return [];

  return [
    {
      label: 'Recibidas por categoría',
      value: order.categories
        .map((c) => `${c.position} ${c.name} ${received.find((r) => r.position === c.position)?.received_count ?? 0}/${c.head_count ?? '—'}`)
        .join(' · ')
    }
  ];
};

/** The troop of a saved order as summary items: what the purchase declared. */
export const troopItemsOf = (order: EntryOrderSummary | EntryOrder): TroopSummaryItem[] => [
  { label: 'Proveedor', value: order.provider.name },
  { label: 'Establecimiento', value: `${order.farm.name ?? '—'}${order.farm.renspa ? ` · ${order.farm.renspa}` : ''}` },
  { label: 'Subasta', value: order.auction_number ?? 'No' },
  { label: 'Lote', value: order.batch_name ?? 'Sin nombre todavía' },
  { label: 'Tropa', value: troopOf(order) },
  ...receivedByCategoryOf(order),
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
