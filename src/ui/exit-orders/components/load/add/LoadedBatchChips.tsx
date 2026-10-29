import React from 'react';
import { Chip, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { BatchOption } from './BatchPickerList';

interface LoadedBatchChipsProps {
	batches: BatchOption[];
	onRemove?: (batch: BatchOption) => void;
}

/** The batches already in the load, each with its heads and an × that takes it out. */
export const LoadedBatchChips: React.FC<LoadedBatchChipsProps> = ({ batches, onRemove }) => {
	if (batches.length === 0) return null;

	return (
		<Stack
			direction="row"
			alignItems="center"
			sx={{ flexWrap: 'wrap', gap: 1 }}
		>
			<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
				Lotes en la orden:
			</Typography>
			{batches.map((batch) => (
				<Chip
					key={batch.id}
					variant="outlined"
					label={
						<>
							{batch.name}{' '}
							<Typography
								component="span"
								sx={{ fontSize: 'inherit', color: 'text.secondary', fontWeight: 500 }}
							>
								{batch.loaded < batch.ids.length
									? `${batch.loaded} de ${batch.ids.length}`
									: batch.loaded}
							</Typography>
						</>
					}
					onDelete={onRemove ? () => onRemove(batch) : undefined}
					deleteIcon={
						<FuseSvgIcon
							size={14}
							aria-label={`Quitar lote ${batch.name}`}
						>
							heroicons-outline:x-mark
						</FuseSvgIcon>
					}
					sx={{
						height: 32,
						borderRadius: '999px',
						borderColor: 'divider',
						fontWeight: 600,
						fontSize: '0.8rem',
						'& .MuiChip-deleteIcon': {
							width: 22,
							height: 22,
							p: '4px',
							borderRadius: '50%',
							bgcolor: 'action.hover',
							color: 'text.primary',
							'&:hover': { bgcolor: 'action.selected', color: 'text.primary' }
						}
					}}
				/>
			))}
		</Stack>
	);
};

export default LoadedBatchChips;
