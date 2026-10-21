/**
 * A calf born here that still waits for its tag, as GET /batches/{id}/untagged-calves lists it.
 * Read model in the API shape.
 */
export interface UntaggedCalf {
	id: number;
	/** "Cría de 4521 ♀": the calf is told apart by its mother until it gets its tag. */
	label: string;
	sex: 'M' | 'H';
	birth_date: string;
	birth_weight: number | null;
	mother_id: number;
	mother_identification: string;
}

/** POST /caravans/tag: the tags put on the calves, all on the same day. */
export interface TagCalvesPayload {
	tagged_at: string;
	items: { caravan_id: number; identification: string }[];
}
