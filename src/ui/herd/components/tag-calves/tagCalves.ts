import type { TagCalvesPayload } from '@/core/caravans/domain/entities/UntaggedCalf';

/** What the user typed per calf: its new tag, by calf id. */
export type TagCalvesValues = Record<number, string>;

/** The server's objections by calf id, from keys like "items.3.identification". */
export type TagCalvesErrors = Record<number, string[]>;

export const today = (): string => new Date().toISOString().slice(0, 10);

/** Only the rows with a tag go: the rest keep waiting, so a load may be partial. */
export function buildTagCalvesPayload(values: TagCalvesValues, taggedAt: string): TagCalvesPayload {
	return {
		tagged_at: taggedAt,
		items: Object.entries(values)
			.map(([id, tag]) => ({ caravan_id: Number(id), identification: tag.trim() }))
			.filter((item) => item.identification !== '')
	};
}

/**
 * Spreads a 422 over the rows. Keys name the index of the item in the payload that was sent, so
 * they are mapped back to the calf of that item; the rest go to the general list.
 */
export function mapTagCalvesErrors(
	errors: Record<string, string[]> | undefined,
	sent: TagCalvesPayload
): { byCalf: TagCalvesErrors; general: string[] } {
	const byCalf: TagCalvesErrors = {};
	const general: string[] = [];

	Object.entries(errors ?? {}).forEach(([key, messages]) => {
		const match = key.match(/^items\.(\d+)\./);
		const calfId = match ? sent.items[Number(match[1])]?.caravan_id : undefined;

		if (calfId == null) {
			general.push(...messages);
			return;
		}

		byCalf[calfId] = [...(byCalf[calfId] ?? []), ...messages];
	});

	return { byCalf, general };
}
