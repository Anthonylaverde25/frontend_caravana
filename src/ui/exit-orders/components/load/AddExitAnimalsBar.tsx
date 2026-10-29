import React, { useMemo } from 'react';
import { Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import type { ExitCandidate } from '../../hooks/useExitCandidates';
import CaravanAddField from './add/CaravanAddField';
import BatchPickerButton from './add/BatchPickerButton';
import PasteListButton from './add/PasteListButton';
import LoadedBatchChips from './add/LoadedBatchChips';
import type { BatchOption } from './add/BatchPickerList';

interface AddExitAnimalsBarProps {
	candidates: ExitCandidate[];
	batches: { id: number; name: string; count: number }[];
	selectedIds: number[];
	onAdd: (ids: number[]) => void;
	onRemove?: (ids: number[]) => void;
}

/**
 * How animals get into a load, one control per way: a loose caravan in the field, whole batches in
 * their picker, a long list pasted. Below, the batches already in the load.
 */
export const AddExitAnimalsBar: React.FC<AddExitAnimalsBarProps> = ({
	candidates,
	batches,
	selectedIds,
	onAdd,
	onRemove
}) => {
	const { enqueueSnackbar } = useSnackbar();
	const selected = useMemo(() => new Set(selectedIds), [selectedIds]);

	const options: BatchOption[] = useMemo(
		() =>
			batches.map((batch) => {
				const members = candidates.filter((candidate) => candidate.batchId === batch.id);
				const ids = members.map((candidate) => candidate.caravan.id);

				return {
					id: batch.id,
					name: batch.name,
					activity: members[0]?.row.activityName ?? 'Sin actividad',
					ids,
					loaded: ids.filter((id) => selected.has(id)).length
				};
			}),
		[batches, candidates, selected]
	);

	// A batch whole in the load comes out with a tick; otherwise the tick completes it.
	const toggleBatch = (batch: BatchOption) =>
		batch.loaded === batch.ids.length && onRemove ? onRemove(batch.ids) : onAdd(batch.ids);

	const addCaravan = (id: number) => {
		onAdd([id]);
		const label = candidates.find((candidate) => candidate.caravan.id === id)?.row.label;
		enqueueSnackbar(`Caravana ${label ?? ''} agregada`, { variant: 'success', autoHideDuration: 2000 });
	};

	return (
		<Stack spacing={1.25}>
			<Stack
				direction="row"
				sx={{ flexWrap: 'wrap', gap: 1 }}
			>
				<CaravanAddField
					candidates={candidates}
					selectedIds={selected}
					onAdd={addCaravan}
				/>
				<BatchPickerButton
					options={options}
					onToggle={toggleBatch}
				/>
				<PasteListButton
					caravans={candidates.map((candidate) => ({
						id: candidate.caravan.id,
						identification: candidate.row.label
					}))}
					onAdd={onAdd}
				/>
			</Stack>
			<LoadedBatchChips
				batches={options.filter((option) => option.loaded > 0)}
				onRemove={onRemove ? (batch) => onRemove(batch.ids) : undefined}
			/>
		</Stack>
	);
};

export default AddExitAnimalsBar;
