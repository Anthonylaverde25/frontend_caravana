import React from 'react';
import { Box, Checkbox, Typography } from '@mui/material';

export interface BatchOption {
	id: number;
	name: string;
	activity: string;
	/** The animals of the batch that can leave. */
	ids: number[];
	/** How many of them are already in the load. */
	loaded: number;
}

interface BatchPickerListProps {
	options: BatchOption[];
	onToggle: (batch: BatchOption) => void;
}

const groupByActivity = (options: BatchOption[]): [string, BatchOption[]][] => {
	const groups = new Map<string, BatchOption[]>();
	options.forEach((option) => groups.set(option.activity, [...(groups.get(option.activity) ?? []), option]));

	return [...groups.entries()];
};

/**
 * The batches with animals that can leave, grouped by activity. Each one says where it stands: whole
 * in the load, part of it ("4 de 10"), or how many it would add.
 */
export const BatchPickerList: React.FC<BatchPickerListProps> = ({ options, onToggle }) => {
	if (options.length === 0) {
		return (
			<Typography sx={{ px: 2, py: 3, fontSize: '0.8rem', color: 'text.secondary', textAlign: 'center' }}>
				Ningún lote coincide
			</Typography>
		);
	}

	return (
		<>
			{groupByActivity(options).map(([activity, batches], index) => (
				<Box
					key={activity}
					sx={{ borderTop: index > 0 ? 1 : 0, borderColor: 'divider' }}
				>
					<Typography
						sx={{
							px: 1.75,
							pt: 1.25,
							pb: 0.5,
							fontSize: '0.68rem',
							fontWeight: 800,
							letterSpacing: '0.06em',
							textTransform: 'uppercase',
							color: 'text.secondary'
						}}
					>
						{activity}
					</Typography>
					{batches.map((batch) => {
						const whole = batch.loaded === batch.ids.length;
						const part = batch.loaded > 0 && !whole;

						return (
							<Box
								key={batch.id}
								component="label"
								sx={{
									px: 1.75,
									py: 0.75,
									display: 'flex',
									alignItems: 'center',
									gap: 1.25,
									cursor: 'pointer',
									bgcolor: whole ? 'action.selected' : undefined,
									'&:hover': { bgcolor: 'action.hover' }
								}}
							>
								<Checkbox
									size="small"
									checked={whole}
									indeterminate={part}
									onChange={() => onToggle(batch)}
									sx={{ p: 0 }}
								/>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography
										noWrap
										sx={{ fontSize: '0.84rem', fontWeight: 600 }}
									>
										{batch.name}
									</Typography>
									<Typography
										variant="caption"
										color="text.secondary"
									>
										{batch.ids.length} disponibles
									</Typography>
								</Box>
								<Typography
									sx={{
										fontSize: '0.74rem',
										fontWeight: 600,
										whiteSpace: 'nowrap',
										color: whole ? 'primary.main' : part ? 'info.dark' : 'text.secondary'
									}}
								>
									{whole
										? 'En la orden'
										: part
											? `${batch.loaded} de ${batch.ids.length}`
											: `+${batch.ids.length}`}
								</Typography>
							</Box>
						);
					})}
				</Box>
			))}
		</>
	);
};

export default BatchPickerList;
