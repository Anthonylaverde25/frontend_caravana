/**
 * How an animal is named on screen. A calf born here may wait days for its tag: meanwhile the
 * backend sends `identification: null` and a `label` like "Cría de 4521 ♀".
 */
export interface Labelled {
	identification?: string | null;
	label?: string | null;
}

/** The tag, or the label of a calf still waiting for it. */
export function animalLabel(animal: Labelled): string {
	return animal.identification || animal.label || '—';
}

/** Whether the animal has its tag: the flows that work by tag (transfer, weaning) need it. */
export function isTagged(animal: Labelled): boolean {
	return Boolean(animal.identification);
}

/** Text a search box matches against: the tag, or "Cría de 4521" for an untagged calf. */
export function searchableTag(animal: Labelled): string {
	return animalLabel(animal).toLowerCase();
}

/** Sort by tag (numeric-aware), untagged calves last. */
export function compareByTag(a: Labelled, b: Labelled): number {
	if (!a.identification || !b.identification) {
		return Number(!a.identification) - Number(!b.identification) || animalLabel(a).localeCompare(animalLabel(b));
	}

	return a.identification.localeCompare(b.identification, undefined, { numeric: true });
}
