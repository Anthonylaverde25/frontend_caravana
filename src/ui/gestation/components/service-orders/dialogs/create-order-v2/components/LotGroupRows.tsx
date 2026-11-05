import React from 'react';
import { Stack, TableCell, TableRow, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import SheetGridGroupRow from '@/components/sheet-grid/SheetGridGroupRow';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import ExcludedFemalesNotice from '@/ui/batches/components/dialogs/start-service/ExcludedFemalesNotice';
import PendingTactoNotice from '@/ui/batches/components/dialogs/start-service/PendingTactoNotice';
import type { PendingTactoFemale } from '@/features/gestation/hooks/useServiceOrderIssuance';
import PasteCaravansField from '@/ui/transfer-orders/components/register/PasteCaravansField';
import { LotGroup } from '../lotGroups';
import { OrderSelection } from '../useCreateOrderV2Wizard';
import LotFemaleRow, { PlannedSemenCells } from './LotFemaleRow';

interface LotGroupRowsProps {
	group: LotGroup;
	columns: number;
	open: boolean;
	searching: boolean;
	registering: boolean;
	picksOnly: boolean;
	selection: OrderSelection;
	registrable: Caravan[];
	owingTacto: ReadonlyMap<number, PendingTactoFemale>;
	semen?: PlannedSemenCells;
	onMark: () => void;
	onToggleFolded: () => void;
	onSetApart: (batch: Batch, ids: number[]) => void;
}

/** One batch of the grid: its heading, what it should know and, once marked, its females. */
export const LotGroupRows: React.FC<LotGroupRowsProps> = ({
	group,
	columns,
	open,
	searching,
	registering,
	picksOnly,
	selection,
	registrable,
	owingTacto,
	semen,
	onMark,
	onToggleFolded,
	onSetApart
}) => {
	const { cellSx } = useGridCellStyles();
	const { batch, females, state, pickable, rows } = group;
	const isSelected = state !== undefined;
	const isComplete = state?.mode === 'complete';
	const picked = state?.selectedCaravanIds ?? [];
	const pickableIds = pickable.map((f) => f.id!);
	const allPicked = pickableIds.every((id) => picked.includes(id));
	const showsNotice =
		isSelected && (registering || females.excluded.length > 0 || females.pendingTacto.length > 0);

	/** A batch without females is not on the order: dropping the last one drops the batch. */
	const toggleFemale = (id: number) => {
		if (picked.length === 1 && picked[0] === id) {
			selection.toggleBatch(batch.id, batch.name, [], 'partial');
		} else {
			selection.toggleCaravanInBatch(batch.id, id);
		}
	};

	const counts = [
		isSelected && !isComplete && `${picked.length} de ${pickable.length} marcados`,
		`${females.serviceable.length} vacíos`,
		females.pregnant.length > 0 && `${females.pregnant.length} preñadas (afuera)`
	]
		.filter(Boolean)
		.join(' · ');

	return (
		<>
			<SheetGridGroupRow
				colSpan={columns}
				name={batch.name}
				caption={counts}
				check={{
					checked: isSelected && (isComplete || allPicked),
					indeterminate: isSelected && !isComplete && !allPicked,
					onChange: (on) => {
						if (!isSelected) onMark();
						else if (on) selection.setCaravansInBatch(batch.id, [...new Set([...picked, ...pickableIds])]);
						else selection.toggleBatch(batch.id, batch.name, [], state.mode);
					}
				}}
				fold={{ open: isSelected && open, disabled: !isSelected || searching, onToggle: onToggleFolded }}
				trailing={
					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
					>
						{!registering && batch.hasUnclosedServiceOrder() && (
							<Typography
								variant="caption"
								sx={{ color: 'warning.dark', fontWeight: 600, whiteSpace: 'nowrap' }}
							>
								Orden {batch.unclosed_service_order?.code} sin cerrar: sólo para planificar
							</Typography>
						)}
						{isSelected && !picksOnly && (
							<ToggleButtonGroup
								size="small"
								exclusive
								value={state.mode}
								onChange={(_, value) => value && selection.setBatchMode(batch.id, value)}
								sx={{
									height: 28,
									bgcolor: 'background.paper',
									'& .MuiToggleButton-root': {
										textTransform: 'none',
										fontWeight: 600,
										fontSize: '0.75rem',
										px: 1.25,
										py: 0
									}
								}}
							>
								<ToggleButton value="complete">Completo ({females.serviceable.length})</ToggleButton>
								<ToggleButton value="partial">Parcial ({picked.length})</ToggleButton>
							</ToggleButtonGroup>
						)}
					</Stack>
				}
			/>

			{showsNotice && open && (
				<TableRow>
					<TableCell
						colSpan={columns}
						sx={{ ...cellSx, borderRight: 0, p: 1 }}
					>
						<Stack spacing={1}>
							{!registering && (
								<ExcludedFemalesNotice
									excludedFemales={females.excluded}
									isControlledService={picksOnly || !isComplete}
									onSetApart={(ids) => onSetApart(batch, ids)}
								/>
							)}
							{!registering && (
								<PendingTactoNotice
									females={females.pendingTacto}
									owingTacto={owingTacto}
									picksIndividually={picksOnly || !isComplete}
									onSetApart={(ids) => onSetApart(batch, ids)}
								/>
							)}
							{registering && (
								<PasteCaravansField
									caravans={registrable.map((f) => ({ id: f.id!, identification: f.identification }))}
									selectedIds={picked}
									onSelectionChange={(ids) => selection.setCaravansInBatch(batch.id, ids)}
									label="Agregar vientres que hoy están en otro lote"
									notFoundLabel="No se pueden agregar (no existen o tienen una preñez vigente)"
								/>
							)}
						</Stack>
					</TableCell>
				</TableRow>
			)}

			{isSelected &&
				open &&
				rows.map((female) => (
					<LotFemaleRow
						key={female.id}
						female={female}
						batchId={batch.id}
						chosen={isComplete || picked.includes(female.id!)}
						locked={isComplete}
						registering={registering}
						semen={semen}
						onToggle={() => toggleFemale(female.id!)}
					/>
				))}
		</>
	);
};

export default LotGroupRows;
