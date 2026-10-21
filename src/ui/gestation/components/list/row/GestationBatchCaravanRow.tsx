import { Chip, IconButton, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Caravan } from '@/core/caravans/domain/entities/Caravan';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import NotApplicable from '@/ui/herd/components/shared/NotApplicable';
import { formatDate } from '@/ui/herd/utils/herdFormat';
import ReproductiveAlertsCell from '../../monitoring/ReproductiveAlertsCell';
import { getDaysLeft, getRiskDetails, getStageLabel, toCaravanSummary } from '../gestationListUtils';

const compactChipSx = { height: 20, fontSize: '0.65rem', fontWeight: 700 } as const;

interface GestationBatchCaravanRowProps {
	caravan: Caravan;
	rowBg: string;
	cellSx: Record<string, unknown>;
	onView: (caravan: CaravanSummary) => void;
	onEdit: (caravan: CaravanSummary) => void;
	onWeigh: (caravan: CaravanSummary) => void;
}

/**
 * Single gestating female row inside a batch's expanded table.
 * Mirrors HerdCaravanTableRow.
 */
export function GestationBatchCaravanRow({
	caravan,
	rowBg,
	cellSx,
	onView,
	onEdit,
	onWeigh
}: GestationBatchCaravanRowProps) {
	const summary = toCaravanSummary(caravan);
	const stage = caravan.active_gestation?.gestation_stage ?? null;
	const stageLabel = getStageLabel(stage);
	const dueDate = caravan.active_gestation?.estimated_due_date ?? null;
	const daysLeft = getDaysLeft(dueDate);
	const categoryLabel = caravan.category_name ?? caravan.category ?? null;
	const riskInfo = getRiskDetails(categoryLabel, daysLeft);

	return (
		<TableRow
			hover
			sx={{ bgcolor: rowBg, transition: 'background-color 0.15s ease' }}
		>
			<TableCell sx={cellSx}>
				<Typography
					variant="body2"
					onClick={() => onView(summary)}
					sx={{
						fontWeight: 800,
						fontFamily: 'monospace',
						cursor: 'pointer',
						color: 'primary.main',
						'&:hover': { textDecoration: 'underline' }
					}}
				>
					#{caravan.identification}
				</Typography>
			</TableCell>
			<TableCell sx={cellSx}>
				<Typography
					variant="body2"
					sx={{ fontWeight: 600, fontSize: '0.78rem' }}
				>
					{categoryLabel ?? '—'}
				</Typography>
			</TableCell>
			<TableCell
				align="center"
				sx={cellSx}
			>
				{stageLabel ? (
					<Chip
						label={stageLabel}
						size="small"
						sx={{
							...compactChipSx,
							bgcolor:
								stage === 'head'
									? 'rgba(16, 185, 129, 0.1)'
									: stage === 'body'
										? 'rgba(245, 158, 11, 0.1)'
										: 'rgba(239, 68, 68, 0.1)',
							color: stage === 'head' ? '#10b981' : stage === 'body' ? '#f59e0b' : '#ef4444',
							border: 1,
							borderColor:
								stage === 'head'
									? 'rgba(16, 185, 129, 0.25)'
									: stage === 'body'
										? 'rgba(245, 158, 11, 0.25)'
										: 'rgba(239, 68, 68, 0.25)'
						}}
					/>
				) : (
					<NotApplicable />
				)}
			</TableCell>
			<TableCell
				align="center"
				sx={cellSx}
			>
				{dueDate ? (
					<Typography
						variant="body2"
						sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.78rem' }}
					>
						{formatDate(dueDate)}
					</Typography>
				) : (
					<NotApplicable />
				)}
			</TableCell>
			<TableCell
				align="right"
				sx={{ ...cellSx, textAlign: 'right' }}
			>
				{daysLeft !== null ? (
					<Typography
						variant="body2"
						sx={{
							fontWeight: 700,
							fontSize: '0.78rem',
							color: daysLeft <= 30 ? 'warning.dark' : 'text.primary'
						}}
					>
						{`${daysLeft} d`}
					</Typography>
				) : (
					<NotApplicable />
				)}
			</TableCell>
			<TableCell sx={cellSx}>
				<ReproductiveAlertsCell caravan={caravan} />
			</TableCell>
			<TableCell sx={cellSx}>
				<Chip
					label={riskInfo.label}
					size="small"
					variant="outlined"
					color={
						riskInfo.risk === 'High' ? 'error' : riskInfo.risk === 'Medium' ? 'warning' : 'success'
					}
					sx={compactChipSx}
				/>
			</TableCell>
			<TableCell
				align="right"
				sx={{ ...cellSx, borderRight: 0, textAlign: 'right', whiteSpace: 'nowrap' }}
			>
				<Tooltip title="Editar">
					<IconButton
						size="small"
						onClick={() => onEdit(summary)}
						sx={{ height: 28, width: 28 }}
					>
						<FuseSvgIcon size={18}>heroicons-outline:pencil-square</FuseSvgIcon>
					</IconButton>
				</Tooltip>
				<Tooltip title="Pesar">
					<IconButton
						size="small"
						color="success"
						onClick={() => onWeigh(summary)}
						sx={{ height: 28, width: 28 }}
					>
						<FuseSvgIcon size={18}>heroicons-outline:scale</FuseSvgIcon>
					</IconButton>
				</Tooltip>
			</TableCell>
		</TableRow>
	);
}

export default GestationBatchCaravanRow;
