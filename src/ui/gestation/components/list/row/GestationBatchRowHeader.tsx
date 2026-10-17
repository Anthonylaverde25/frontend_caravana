import { Box, ButtonBase, Chip, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { formatDate } from '@/ui/herd/utils/herdFormat';
import type { GestationBatchGroup, GestationBatchStats } from '../gestationListUtils';

interface GestationBatchRowHeaderProps {
	group: GestationBatchGroup;
	stats: GestationBatchStats;
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
 * Identity of a gestational batch row: name on top, then
 * "gestating count | CATEGORY | earliest due date" and obstetric status chips.
 */
export function GestationBatchRowHeader({ group, stats, expanded, onToggle }: GestationBatchRowHeaderProps) {
	const categoryOrActivity = group.batch?.activity_name ?? stats.predominantCategory;

	return (
		<ButtonBase
			onClick={onToggle}
			aria-expanded={expanded}
			aria-label={`${expanded ? 'Contraer' : 'Expandir'} ${group.name}`}
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
					color: group.isUnassigned ? 'warning.dark' : expanded ? 'primary.main' : 'text.secondary',
					bgcolor: expanded && !group.isUnassigned ? 'action.selected' : 'transparent'
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
					{group.name}
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
						sx={{
							fontSize: 'inherit',
							fontWeight: 600,
							color: group.isUnassigned ? 'warning.dark' : 'text.secondary'
						}}
					>
						{`${stats.total.toLocaleString('es-AR')} ${stats.total === 1 ? 'vientre gestante' : 'vientres gestantes'}`}
					</Typography>

					{categoryOrActivity && separator}
					{categoryOrActivity && (
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
							{categoryOrActivity}
						</Typography>
					)}

					{separator}
					<Typography
						component="span"
						sx={{
							fontSize: 'inherit',
							fontWeight: 600,
							color: stats.earliestDueDate ? 'text.secondary' : 'warning.dark'
						}}
					>
						{stats.earliestDueDate ? `Próx. FPP: ${formatDate(stats.earliestDueDate)}` : 'SIN FPP'}
					</Typography>

					{stats.imminentCount > 0 && (
						<Chip
							label={`${stats.imminentCount} parto${stats.imminentCount > 1 ? 's' : ''} ≤ 45 d`}
							size="small"
							color="info"
							variant="outlined"
							sx={compactChipSx}
						/>
					)}
					{stats.overdueCount > 0 && (
						<Chip
							label={`${stats.overdueCount} con parto vencido`}
							size="small"
							color="warning"
							variant="outlined"
							sx={compactChipSx}
						/>
					)}
					{stats.highRiskCount > 0 && (
						<Chip
							label={`${stats.highRiskCount} alto riesgo`}
							size="small"
							color="error"
							variant="outlined"
							sx={compactChipSx}
						/>
					)}
				</Stack>
			</Box>
		</ButtonBase>
	);
}

export default GestationBatchRowHeader;
