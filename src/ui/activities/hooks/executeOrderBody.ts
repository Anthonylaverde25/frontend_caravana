import type { ExecuteTransferOrderBody } from '@/features/transfer-orders/hooks/useTransferOrderMutations';
import type { TransferOrder } from '@/features/transfer-orders/types';
import type { TransferableCaravan } from '../components/transfer/transferMath';
import type { CategoryTarget } from './useTransferCategoryPlan';

const samePair = (a: CategoryTarget | null | undefined, b: CategoryTarget | null | undefined): boolean =>
  (a ?? null) === null
    ? (b ?? null) === null
    : (b ?? null) !== null && a!.categoryId === b!.categoryId && (a!.subcategoryId ?? null) === (b!.subcategoryId ?? null);

/**
 * What "Ejecutar orden" sends for the C/S of each pending animal.
 *
 * - "No cambia": nothing. The order said so, and its sheet has no column for it either.
 * - Declared: only what differs from the order. Emptying a declared C/S means "keeps its
 *   category", which the server can only hear as the current pair: an animal sent with nothing
 *   falls back to what the order declared.
 * - At the chute: whatever was chosen; empty is no change.
 */
export function executeOrderAnimals(
  order: TransferOrder,
  targets: Record<number, CategoryTarget | null>,
  caravans: TransferableCaravan[]
): NonNullable<ExecuteTransferOrderBody['animals']> {
  if (order.category_mode === 'KEEP') return [];

  const byId = new Map(caravans.map((c) => [c.id, c]));
  const animals: NonNullable<ExecuteTransferOrderBody['animals']> = [];

  order.animals
    .filter((line) => line.status === 'PENDING')
    .forEach((line) => {
      const chosen = targets[line.caravan_id] ?? null;
      const declared =
        line.target_category_id != null
          ? { categoryId: line.target_category_id, subcategoryId: line.target_subcategory_id }
          : null;

      if (order.category_mode === 'DECLARED' && samePair(chosen, declared)) return;

      if (chosen) {
        animals.push({ caravan_id: line.caravan_id, category_id: chosen.categoryId, subcategory_id: chosen.subcategoryId });
        return;
      }

      const current = byId.get(line.caravan_id);

      if (order.category_mode === 'DECLARED' && current?.category_id != null) {
        animals.push({
          caravan_id: line.caravan_id,
          category_id: current.category_id,
          subcategory_id: current.subcategory_id ?? null
        });
      }
    });

  return animals;
}
