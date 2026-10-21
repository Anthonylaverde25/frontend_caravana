import type { RegisterDeathPayload } from '@/core/caravans/domain/entities/Death';

/** An animal of the load: its id and how it is named ("#4521", "Cría de 4521 ♀"). */
export interface DyingAnimal {
	id: number;
	label: string;
}

export interface RegisterDeathForm {
	deathDate: string;
	causeId: number | '';
	observations: string;
	deathBatchId: number | '';
}

export const today = (): string => new Date().toISOString().slice(0, 10);

export const emptyDeathForm = (): RegisterDeathForm => ({
	deathDate: today(),
	causeId: '',
	observations: '',
	deathBatchId: ''
});

/** What still blocks sending the load, said in plain words before the server checks each animal. */
export function deathFormProblem(form: RegisterDeathForm, needsBatch: boolean): string | null {
	if (!form.deathDate) return 'Indicá la fecha de la muerte.';

	if (form.deathDate > today()) return 'La fecha de la muerte no puede ser futura.';

	if (form.causeId === '') return 'Elegí la causa de la muerte.';

	if (needsBatch && form.deathBatchId === '') return 'Elegí a qué Lote de Muertes va.';

	return null;
}

export function buildDeathPayload(animals: DyingAnimal[], form: RegisterDeathForm): RegisterDeathPayload {
	return {
		caravan_ids: animals.map((a) => a.id),
		death_date: form.deathDate,
		death_cause_id: Number(form.causeId),
		observations: form.observations.trim() || null,
		death_batch_id: form.deathBatchId === '' ? null : Number(form.deathBatchId)
	};
}

/**
 * Spreads a 422 over the animals. Keys name the position of the animal in the payload sent
 * ("caravan_ids.2"); the rest are general.
 */
export function mapDeathErrors(
	errors: Record<string, string[]> | undefined,
	sent: RegisterDeathPayload
): { byAnimal: Record<number, string[]>; general: string[] } {
	const byAnimal: Record<number, string[]> = {};
	const general: string[] = [];

	Object.entries(errors ?? {}).forEach(([key, messages]) => {
		const match = key.match(/^caravan_ids\.(\d+)$/);
		const id = match ? sent.caravan_ids[Number(match[1])] : undefined;

		if (id == null) {
			general.push(...messages);
			return;
		}

		byAnimal[id] = [...(byAnimal[id] ?? []), ...messages];
	});

	return { byAnimal, general };
}
