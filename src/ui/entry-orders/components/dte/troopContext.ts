import type { EntryOrder } from '@/features/entry-orders/types';
import type { DteTroopContext } from './useDteDraft';

/** What the DTE grid needs from an order already saved. */
export const troopContextOf = (order: EntryOrder): DteTroopContext => ({
  isMixed: order.sex_composition === 'MIXED',
  maleCount: order.male_count,
  femaleCount: order.female_count,
  enteredMale: order.entered_male_count ?? 0,
  enteredFemale: order.entered_female_count ?? 0,
  pending: order.pending_count,
  headCount: order.head_count,
  breeds: order.breeds.map((b) => ({ position: b.position, letter: b.letter, label: b.label })),
  minWeight: order.min_weight,
  maxWeight: order.max_weight
});
