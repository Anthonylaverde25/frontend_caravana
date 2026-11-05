import React from 'react';
import { Checkbox, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { isSelectable, resolveSireAdmission } from '@/core/caravans/domain/rules/resolveSireAdmission';
import type { BullHealthEvaluation } from '@/core/pre-service/domain/BullHealthEvaluation';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridEmptyRow from '@/components/sheet-grid/SheetGridEmptyRow';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import SireAdmissionChip from '@/ui/batches/components/dialogs/start-service/SireAdmissionChip';

interface LotBullsGridProps {
	males: Caravan[];
	healthById: Map<number, BullHealthEvaluation>;
	selectedIds: number[];
	allApt: boolean;
	someApt: boolean;
	onToggle: (id: number) => void;
	onToggleAllApt: () => void;
	/** Re-enables a bull the owner excluded. */
	onEnable: (male: Caravan) => void;
}

/** The bulls that can join a batch; one the owner or the vet ruled out stays visible, greyed. */
export const LotBullsGrid: React.FC<LotBullsGridProps> = ({
	males,
	healthById,
	selectedIds,
	allApt,
	someApt,
	onToggle,
	onToggleAllApt,
	onEnable
}) => {
	const { cellSx, headSx, indexSx, textCellSx, zebraBg, selectedBg } = useGridCellStyles();

	return (
		<SheetGrid
			minWidth={860}
			maxHeight={{ xs: 440, lg: 380 }}
		>
			<TableHead>
				<TableRow>
					<TableCell
						align="center"
						sx={{ ...headSx, width: 44, px: 0 }}
					>
						<Checkbox
							size="small"
							checked={allApt}
							indeterminate={someApt}
							onChange={onToggleAllApt}
						/>
					</TableCell>
					<TableCell sx={{ ...headSx, minWidth: 150 }}>Caravana</TableCell>
					<TableCell sx={{ ...headSx, width: 130 }}>Raza</TableCell>
					<TableCell sx={{ ...headSx, width: 170 }}>Lote actual</TableCell>
					<TableCell sx={{ ...headSx, width: 90 }}>Dentición</TableCell>
					<TableCell sx={{ ...headSx, width: 90 }}>Peso (kg)</TableCell>
					<TableCell sx={{ ...headSx, width: 100 }}>C. escrotal</TableCell>
					<TableCell sx={{ ...headSx, width: 200 }}>Aptitud</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{males.length === 0 && (
					<SheetGridEmptyRow colSpan={8}>No se encontraron toros con el filtro actual.</SheetGridEmptyRow>
				)}
				{males.map((male) => {
					const health = healthById.get(male.id!);
					const admission = resolveSireAdmission(male, health);
					const selectable = isSelectable(admission);
					const chosen = selectedIds.includes(male.id!);

					return (
						<TableRow
							key={male.id}
							hover={selectable}
							onClick={selectable ? () => onToggle(male.id!) : undefined}
							sx={{
								cursor: selectable ? 'pointer' : 'not-allowed',
								opacity: selectable ? 1 : 0.6,
								'&:nth-of-type(even)': { bgcolor: zebraBg },
								...(chosen && { bgcolor: `${selectedBg} !important` })
							}}
						>
							<TableCell
								align="center"
								sx={{ ...indexSx, width: 44 }}
							>
								<Checkbox
									size="small"
									checked={chosen}
									disabled={!selectable}
									tabIndex={-1}
									disableRipple
								/>
							</TableCell>
							<SheetGridTagCell tag={male.identification} />
							<TableCell sx={textCellSx}>{male.breed || '—'}</TableCell>
							<TableCell sx={textCellSx}>{male.batch_name ?? 'Torada general'}</TableCell>
							<TableCell sx={textCellSx}>{male.teeth ? `${male.teeth} D` : '—'}</TableCell>
							<TableCell sx={textCellSx}>{male.current_weight ?? '—'}</TableCell>
							<TableCell sx={textCellSx}>
								{health?.scrotal_circumference_cm ? `${health.scrotal_circumference_cm} cm` : '—'}
							</TableCell>
							<TableCell sx={{ ...cellSx, px: 1, borderRight: 0 }}>
								<SireAdmissionChip
									admission={admission}
									onEnable={() => onEnable(male)}
								/>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</SheetGrid>
	);
};

export default LotBullsGrid;
