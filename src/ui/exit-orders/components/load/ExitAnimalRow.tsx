import React from 'react';
import { Checkbox, TableCell, TableRow, TextField, Tooltip, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { CalfAtFoot, CalfAtFootDecision } from '@/features/exit-orders/types';
import { formatKg, formatMoney } from '../exitOrderFormat';
import type { PricedLine } from './exitPricing';
import { EXIT_GRID_COLUMNS, ExitLoadMode, ExitRow, rowError } from './exitRows';
import CalfChip from './CalfChip';

interface ExitAnimalRowProps {
	mode: ExitLoadMode;
	row: ExitRow;
	index: number;
	priced: PricedLine | undefined;
	/** The kg come from the truck's total: the cell shows the share, read-only. */
	weightFromLoad: boolean;
	calves: CalfAtFoot[] | undefined;
	decision: CalfAtFootDecision | undefined;
	errors: Record<string, string> | undefined;
	onChange: (patch: Partial<ExitRow>) => void;
	onDecision: (decision: CalfAtFootDecision) => void;
}

/**
 * One animal of the load: which one, where it leaves from, its kg and what it is worth. The amount
 * is computed from how the load was charged, never typed here. A server objection is written under
 * the row, not hidden in a tooltip.
 */
export const ExitAnimalRow: React.FC<ExitAnimalRowProps> = ({
	mode,
	row,
	index,
	priced,
	weightFromLoad,
	calves,
	decision,
	errors,
	onChange,
	onDecision
}) => {
	const { cellSx, inputSx, indexSx, textCellSx, zebraBg, errorRing, theme } = useGridCellStyles();
	const notLeaving = !row.leaves;
	const error = rowError(errors);
	const bg = index % 2 === 1 ? zebraBg : undefined;
	const weightRing = errors?.weight_kg
		? { '& .MuiInputBase-root': { ...inputSx['& .MuiInputBase-root'], ...errorRing } }
		: {};

	return (
		<>
			<TableRow sx={{ bgcolor: bg, '& > td:not(:first-of-type)': { opacity: row.leaves ? 1 : 0.55 } }}>
				<TableCell sx={indexSx}>
					<Checkbox
						size="small"
						checked={row.leaves}
						onChange={(e) => onChange({ leaves: e.target.checked })}
						inputProps={{ 'aria-label': `${mode === 'execute' ? 'Subió' : 'Sale'} ${row.label}` }}
					/>
				</TableCell>
				<SheetGridTagCell
					tag={row.label}
					caption={
						notLeaving
							? `${row.categoryName ?? ''} · ${mode === 'execute' ? 'no subió' : 'no sale'}`
							: [row.categoryName, row.isPregnant ? 'preñada' : null].filter(Boolean).join(' · ') ||
								undefined
					}
					error={!!errors?.caravan_id || !!errors?.calf_decision}
					adornment={
						calves && calves.length > 0 ? (
							<CalfChip
								calves={calves}
								decision={decision}
								onChange={onDecision}
								disabled={notLeaving}
								error={!!errors?.calf_decision}
							/>
						) : undefined
					}
				/>
				<TableCell sx={{ ...textCellSx, fontSize: '0.78rem', color: notLeaving ? 'text.disabled' : undefined }}>
					{row.batchName ?? '—'}
					<Typography
						component="span"
						variant="caption"
						color="text.secondary"
					>
						{row.activityName ? ` · ${row.activityName}` : ''}
					</Typography>
				</TableCell>
				<TableCell sx={cellSx}>
					{weightFromLoad && !notLeaving ? (
						<Tooltip title="Parte de los kg totales del camión, repartida por el último peso. No se guarda como pesada del animal.">
							<Typography
								sx={{
									...textCellSx,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'flex-end',
									color: 'text.secondary',
									fontStyle: 'italic'
								}}
							>
								{priced?.weightKg != null ? `≈ ${formatKg(priced.weightKg)}` : '—'}
							</Typography>
						</Tooltip>
					) : (
						<TextField
							fullWidth
							variant="outlined"
							inputMode="decimal"
							disabled={mode === 'issue' || notLeaving}
							value={row.weight}
							placeholder={
								row.lastWeight != null && mode !== 'issue' ? `últ. ${row.lastWeight}` : undefined
							}
							onChange={(e) => onChange({ weight: e.target.value })}
							inputProps={{ 'aria-label': `Peso de ${row.label}` }}
							sx={{ ...inputSx, ...weightRing, '& input': { textAlign: 'right', padding: '8px 10px' } }}
						/>
					)}
				</TableCell>
				<TableCell
					sx={{
						...textCellSx,
						textAlign: 'right',
						whiteSpace: 'nowrap',
						fontWeight: 600,
						bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f6f7f8',
						color: priced?.amount != null ? 'text.primary' : 'text.disabled'
					}}
				>
					{mode === 'issue' ? '—' : formatMoney(priced?.amount ?? null)}
				</TableCell>
				<TableCell sx={{ ...cellSx, borderRight: 0, width: 48 }} />
			</TableRow>
			{error && (
				<TableRow>
					<TableCell
						colSpan={EXIT_GRID_COLUMNS}
						sx={{
							...cellSx,
							borderRight: 0,
							px: 1.5,
							py: 0.75,
							bgcolor: alpha(theme.palette.error.main, 0.06),
							color: 'error.main',
							fontSize: '0.78rem',
							fontWeight: 600
						}}
					>
						<FuseSvgIcon
							size={14}
							sx={{ verticalAlign: 'text-bottom', mr: 0.75 }}
						>
							heroicons-outline:exclamation-circle
						</FuseSvgIcon>
						{row.label}: {error}
					</TableCell>
				</TableRow>
			)}
		</>
	);
};

export default ExitAnimalRow;
