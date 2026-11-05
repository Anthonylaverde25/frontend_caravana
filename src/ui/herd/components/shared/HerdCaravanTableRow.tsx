import { Checkbox, Chip, TableCell, TableRow, Typography } from '@mui/material';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import { formatDate, formatKg, gestationLabel, sexLabel } from '../../utils/herdFormat';
import BreedingEligibilityChip from './breeding-eligibility/BreedingEligibilityChip';
import NotApplicable from './NotApplicable';
import HerdCaravanRowActions from './HerdCaravanRowActions';

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
	onDeath?: (caravan: CaravanSummary) => void;
	onSell?: (caravan: CaravanSummary) => void;
	onAbort?: (caravan: CaravanSummary) => void;
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
	onBreeding,
	onDeath,
	onSell,
	onAbort
}: HerdCaravanTableRowProps) {
	const gestation = gestationLabel(caravan.gestation_status);
	// A dead or sold animal is looked at, never operated on.
	const gone = caravan.is_dead || caravan.exit != null;

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
					{caravan.is_tagged ? `#${caravan.identification}` : caravan.label}
				</Typography>
				{caravan.is_dead && caravan.death && (
					<Chip
						size="small"
						label={`Muerto · ${formatDate(caravan.death.date)}${caravan.death.cause ? ` · ${caravan.death.cause}` : ''}`}
						variant="outlined"
						sx={{ ...compactChipSx, mt: 0.25, color: 'text.secondary' }}
					/>
				)}
				{caravan.exit && (
					<Chip
						size="small"
						label={`Vendida · ${formatDate(caravan.exit.date)}${caravan.exit.order_code ? ` · ${caravan.exit.order_code}` : ''}`}
						variant="outlined"
						sx={{ ...compactChipSx, mt: 0.25, color: 'text.secondary' }}
					/>
				)}
				{caravan.service_order_code_on_stay && !gone && (
					<Chip
						size="small"
						label={`En servicio · ${caravan.service_order_code_on_stay}`}
						color="info"
						variant="outlined"
						sx={{ ...compactChipSx, mt: 0.25 }}
					/>
				)}
				{!caravan.is_tagged && !gone && (
					<Chip
						size="small"
						label="Sin caravana"
						color="warning"
						variant="outlined"
						sx={{ ...compactChipSx, mt: 0.25 }}
					/>
				)}
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
					status={
						caravan.reproductive_status ??
						(caravan.is_breeding_eligible !== false ? 'ELIGIBLE' : 'EXCLUDED')
					}
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
				<HerdCaravanRowActions
					caravan={caravan}
					onView={onView}
					onEdit={onEdit}
					onWeigh={onWeigh}
					onBreeding={onBreeding}
					onDeath={onDeath}
					onSell={onSell}
					onAbort={onAbort}
				/>
			</TableCell>
		</TableRow>
	);
}

export default HerdCaravanTableRow;
