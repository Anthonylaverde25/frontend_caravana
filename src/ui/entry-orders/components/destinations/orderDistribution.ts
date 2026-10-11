import type { EntryOrderSummary } from '@/features/entry-orders/types';
import type { DestinationRule, DistributionLine } from '@/ui/batches/components/external/destination/coverage';

/** The category lines of a saved order, as the distribution needs them. */
export const linesOfOrder = (order: EntryOrderSummary): DistributionLine[] =>
  order.categories.map((c) => ({
    position: c.position,
    categoryName: c.name ?? `Categoría ${c.position}`,
    categorySex: c.sex,
    headCount: c.head_count
  }));

export const rulesOfOrder = (order: EntryOrderSummary): DestinationRule[] =>
  order.destinations.map((d) => ({
    category_position: d.category_position,
    sex_scope: d.sex_scope,
    destination_batch_id: d.batch.id
  }));

/** The names of the batches the order already sends animals to: one may be closed since. */
export const batchNamesOfOrder = (order: EntryOrderSummary): Record<number, string> =>
  Object.fromEntries(order.destinations.filter((d) => d.batch.name).map((d) => [d.batch.id, d.batch.name as string]));
