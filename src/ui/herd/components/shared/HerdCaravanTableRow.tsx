import { Checkbox, Chip, IconButton, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import { formatDate, formatKg, gestationLabel, sexLabel } from '../../utils/herdFormat';
import BreedingEligibilityChip from './breeding-eligibility/BreedingEligibilityChip';
import NotApplicable from './NotApplicable';

const compactChipSx = { height: 20, fontSize: '0.65rem', fontWeight: 700 };

interface HerdCaravanTableRowProps {
	caravan: CaravanSummary;
	rowBg: string;
	cellSx: Record<string, unknown>;
	showBatch: boolean;
	selectable: boolean;
	selected: boolean;
	onToggleSelect?: (caravan: CaravanSummary) => void;
	onView: (caravan: CaravanSummary) => void;
	onEdit?: (caravan: CaravanSummary) => void;
	onWeigh?: (caravan: CaravanSummary) => void;
	onBreeding?: (caravan: CaravanSummary) => void;
}

/** One caravan of the herd table: identity, reproductive state, weight and row actions. */
export function HerdCaravanTableRow({
	caravan,
	rowBg,
	cellSx,
	showBatch,
	selectable,
	selected,
	onToggleSelect,
	onView,
	onEdit,
	onWeigh,
	onBreeding
}: HerdCaravanTableRowProps) {
	const gestation = gestationLabel(caravan.gestation_status);

	return (
		<TableRow
			hover
			selected={selected}
			sx={{ bgcolor: rowBg, transition: 'background-color 0.15s ease' }}
		>
			{selectable && (
				<TableCell
					padding="checkbox"
					sx={cellSx}
				>
					<Checkbox
						size="small"
						checked={selected}
						onChange={() => onToggleSelect?.(caravan)}
					/>
				</TableCell>
			)}
			<TableCell sx={cellSx}>
				<Typography
					variant="body2"
					onClick={() => onView(caravan)}
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
				<Chip
					size="small"
					label={sexLabel(caravan.sex)}
					color={caravan.sex === 'M' ? 'info' : 'secondary'}
					variant="outlined"
					sx={compactChipSx}
				/>
			</TableCell>
			<TableCell sx={cellSx}>
				<Typography
					variant="body2"
					sx={{ fontWeight: 600, fontSize: '0.78rem' }}
				>
					{caravan.category_name ?? '—'}
				</Typography>
			</TableCell>
			<TableCell sx={cellSx}>
				{gestation ? (
					<Chip
						label={gestation}
						size="small"
						color={caravan.gestation_status === 'PREGNANT' ? 'success' : 'default'}
						variant="outlined"
						sx={compactChipSx}
					/>
				) : (
					<NotApplicable />
				)}
			</TableCell>
			<TableCell sx={cellSx}>
				<BreedingEligibilityChip
					status={caravan.reproductive_status ?? (caravan.is_breeding_eligible !== false ? 'ELIGIBLE' : 'EXCLUDED')}
					reasonLabel={caravan.breeding_exclusion_reason_label}
				/>
			</TableCell>
			<TableCell
				align="right"
				sx={{ ...cellSx, textAlign: 'right', fontWeight: 600 }}
			>
				{formatKg(caravan.current_weight)}
			</TableCell>
			{showBatch && <TableCell sx={cellSx}>{caravan.batch_name ?? 'Sin lote'}</TableCell>}
			<TableCell sx={cellSx}>
				{caravan.batch_assigned_at ? (
					<Typography
						variant="caption"
						sx={{ color: 'text.secondary', fontWeight: 500 }}
					>
						{formatDate(caravan.batch_assigned_at)}
					</Typography>
				) : (
					<NotApplicable />
				)}
			</TableCell>
			<TableCell
				align="right"
				sx={{ ...cellSx, borderRight: 0, textAlign: 'right', whiteSpace: 'nowrap' }}
			>
				<Tooltip title="Ver detalle">
					<IconButton
						size="small"
						onClick={() => onView(caravan)}
						sx={{ height: 28, width: 28 }}
					>
						<FuseSvgIcon size={18}>heroicons-outline:eye</FuseSvgIcon>
					</IconButton>
				</Tooltip>
				{onEdit && (
					<Tooltip title="Editar">
						<IconButton
							size="small"
							onClick={() => onEdit(caravan)}
							sx={{ height: 28, width: 28 }}
						>
							<FuseSvgIcon size={18}>heroicons-outline:pencil-square</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				)}
				{onWeigh && (
					<Tooltip title="Pesar">
						<IconButton
							size="small"
							color="success"
							onClick={() => onWeigh(caravan)}
							sx={{ height: 28, width: 28 }}
						>
							<FuseSvgIcon size={18}>heroicons-outline:scale</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				)}
				{onBreeding && caravan.reproductive_status !== 'NOT_APPLICABLE' && (
					<Tooltip title="Aptitud reproductiva">
						<IconButton
							size="small"
							color="secondary"
							onClick={() => onBreeding(caravan)}
							sx={{ height: 28, width: 28 }}
						>
							<FuseSvgIcon size={18}>heroicons-outline:heart</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				)}
			</TableCell>
		</TableRow>
	);
}

export default HerdCaravanTableRow;
