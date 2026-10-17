import { Box, ButtonBase, Chip, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { formatKg } from '../../../utils/herdFormat';

interface HerdBatchRowHeaderProps {
	batch: Batch;
	expanded: boolean;
	onToggle: () => void;
}

const compactChipSx = { height: 20, fontSize: '0.68rem', fontWeight: 600 } as const;

const separator = (
	<Typography
		component="span"
		aria-hidden="true"
		sx={{ color: 'divider', fontWeight: 700, fontSize: '0.75rem' }}
	>
		|
	</Typography>
);

/**
 * Identity of a batch: name on top, then "head | ACTIVITY | kg/head" and its few states.
 * The whole block toggles the row.
 */
export function HerdBatchRowHeader({ batch, expanded, onToggle }: HerdBatchRowHeaderProps) {
	const pending = batch.pending_identification_count;
	const inTransit = batch.incoming_entry_orders.reduce(
		(total, order) => total + (order.single_destination ? order.in_transit_count : 0),
		0
	);

	return (
		<ButtonBase
			onClick={onToggle}
			aria-expanded={expanded}
			aria-label={`${expanded ? 'Contraer' : 'Expandir'} ${batch.name}`}
			sx={{
				flex: 1,
				minWidth: 0,
				justifyContent: 'flex-start',
				textAlign: 'left',
				gap: 1.5,
				py: 1.5,
				pl: 1,
				borderRadius: '8px'
			}}
		>
			<Box
				sx={{
					width: 40,
					height: 40,
					flexShrink: 0,
					display: 'grid',
					placeItems: 'center',
					borderRadius: '8px',
					color: expanded ? 'primary.main' : 'text.secondary',
					bgcolor: expanded ? 'action.selected' : 'transparent'
				}}
			>
				<FuseSvgIcon
					size={18}
					sx={{ transition: 'transform 0.2s ease', transform: expanded ? 'rotate(90deg)' : 'none' }}
				>
					heroicons-outline:chevron-right
				</FuseSvgIcon>
			</Box>

			<Box sx={{ minWidth: 0 }}>
				<Typography
					noWrap
					sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}
				>
					{batch.name}
				</Typography>
				<Stack
					direction="row"
					spacing={1}
					alignItems="center"
					flexWrap="wrap"
					useFlexGap
					sx={{ mt: 0.5, fontSize: '0.75rem', lineHeight: '18px' }}
				>
					<Typography
						component="span"
						sx={{ fontSize: 'inherit', fontWeight: 600, color: 'text.secondary' }}
					>
						{`${batch.head_count.toLocaleString('es-AR')} cab.`}
					</Typography>
					{batch.activity_name && separator}
					{batch.activity_name && (
						<Typography
							component="span"
							sx={{
								fontSize: 'inherit',
								fontWeight: 700,
								color: 'primary.main',
								textTransform: 'uppercase',
								letterSpacing: '0.04em'
							}}
						>
							{batch.activity_name}
						</Typography>
					)}
					{separator}
					<Typography
						component="span"
						sx={{
							fontSize: 'inherit',
							fontWeight: 600,
							color: batch.current_weight ? 'text.secondary' : 'warning.dark'
						}}
					>
						{batch.current_weight ? `${formatKg(batch.current_weight)}/cab` : 'SIN PESO'}
					</Typography>

					{batch.head_count === 0 && (
						<Chip
							label="Vacío"
							size="small"
							sx={compactChipSx}
						/>
					)}
					{pending > 0 && (
						<Chip
							label={`${pending} por identificar`}
							size="small"
							color="warning"
							variant="outlined"
							sx={compactChipSx}
						/>
					)}
					{inTransit > 0 && (
						<Chip
							label={`+${inTransit} en tránsito`}
							size="small"
							color="info"
							variant="outlined"
							sx={compactChipSx}
						/>
					)}
					{!batch.is_active && (
						<Chip
							label="Inactivo"
							size="small"
							sx={compactChipSx}
						/>
					)}
				</Stack>
			</Box>
		</ButtonBase>
	);
}

export default HerdBatchRowHeader;
