/**
 * Where an animal stands for breeding: its category may not breed at all (a calf, a steer), or it
 * breeds and the owner left it in or excluded it. Mirrors App\Core\Enums\ReproductiveStatus.
 */
export type ReproductiveStatus = 'NOT_APPLICABLE' | 'ELIGIBLE' | 'EXCLUDED';

interface CategoryLike {
	/** The catalog's word on the category; null when the caravan has none. */
	is_reproductive_category?: boolean | null;
}

/**
 * Whether the animal's category breeds: a calf at foot never enters a service, nor a steer as a
 * bull. A caravan without category is treated as reproductive, as the backend does.
 */
export const isBreedingCandidate = (caravan: CategoryLike): boolean => caravan.is_reproductive_category !== false;
