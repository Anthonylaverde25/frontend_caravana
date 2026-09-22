import { ActivityBatch } from '@/core/activities/domain/entities/Activity';

/**
 * Whether the management system of this batch is a fact somebody declared, as opposed
 * to a question nobody has been asked yet.
 *
 * This used to need the activity code. While `is_confined` was a non-nullable boolean
 * defaulting to `false`, and the form only demanded the declaration in Recría, a
 * `false` outside Recría said nothing: it was the column default, not an answer. The
 * activity had to stand in for a state the column could not hold.
 *
 * The management system is now asked for in every productive activity and the column
 * is nullable, so it says it itself. The activity parameter is gone on purpose: an
 * argument nobody reads is worse than a compiler error at every call site.
 *
 * Showing "a campo" for a batch whose management nobody declared would be the system
 * asserting a fact only the producer knows.
 */
export function declaresManagementSystem(
  batch: Pick<ActivityBatch, 'isConfined'>
): boolean {
  return batch.isConfined != null;
}

/**
 * Screen label for the three states. Kept next to the predicate so a new caller cannot
 * reintroduce the `isConfined ? 'Corral' : 'Extensivo'` ternary that silently reads an
 * undeclared batch as a pasture one.
 */
export function managementSystemLabel(
  batch: Pick<ActivityBatch, 'isConfined'>,
  undeclared = '—'
): string {
  if (batch.isConfined == null) return undeclared;

  return batch.isConfined ? 'Corral' : 'Extensivo';
}
