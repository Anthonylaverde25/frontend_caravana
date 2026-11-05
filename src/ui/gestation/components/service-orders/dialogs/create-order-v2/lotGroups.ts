import type { Batch } from '@/core/batches/domain/entities/Batch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { EMPTY_LOT, LotFemales } from './lotFemales';
import { SelectedBatchState } from './types';

/** One Cría batch of the sheet, as the grid shows it. */
export interface LotGroup {
	batch: Batch;
	females: LotFemales;
	state: SelectedBatchState | undefined;
	/** What can be picked one by one; a registered order declares who was there, so an excluded female counts. */
	pickable: Caravan[];
	/** The females to list: only of a marked batch, narrowed by the search. */
	rows: Caravan[];
}

interface LotGroupsParams {
	batches: Batch[];
	femalesByBatch: Map<number, LotFemales>;
	selected: Map<number, SelectedBatchState>;
	registering: boolean;
	/** Females that can join a registered order from another batch. */
	registrable: Caravan[];
	term: string;
}

const matches = (female: Caravan, term: string) =>
	female.identification?.toLowerCase().includes(term) ||
	female.category_name?.toLowerCase().includes(term) ||
	female.breed?.toLowerCase().includes(term);

/** The Cría batches that match the search: by name, or by a female of a batch already marked. */
export function buildLotGroups({
	batches,
	femalesByBatch,
	selected,
	registering,
	registrable,
	term
}: LotGroupsParams): LotGroup[] {
	return batches
		.filter((batch) => batch.isCria())
		.map((batch) => {
			const females = femalesByBatch.get(batch.id) ?? EMPTY_LOT;
			const state = selected.get(batch.id);
			const pickable = registering ? females.serviceable : females.apt;
			const fromOtherBatches =
				registering && state
					? registrable.filter((f) => f.batch_id !== batch.id && state.selectedCaravanIds.includes(f.id!))
					: [];
			const listed = !state
				? []
				: state.mode === 'complete'
					? females.serviceable
					: [...pickable, ...fromOtherBatches];
			const named = term === '' || batch.name.toLowerCase().includes(term);

			return {
				batch,
				females,
				state,
				pickable,
				rows: named ? listed : listed.filter((f) => matches(f, term)),
				named
			};
		})
		.filter((group) => group.named || group.rows.length > 0);
}
