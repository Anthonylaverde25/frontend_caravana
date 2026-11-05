import React from 'react';
import { Checkbox, MenuItem, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import SheetGridStatusCell from '@/components/sheet-grid/SheetGridStatusCell';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { SemenOption } from '@/features/semen/hooks/useSemenOptions';

/** The "Semen previsto" cell of an AI order. */
export interface PlannedSemenCells {
	options: SemenOption[];
	valueOf: (femaleId: number) => number | null;
	onChange: (femaleId: number, itemId: number | null) => void;
}

interface LotFemaleRowProps {
	female: Caravan;
	/** The batch of the order: a female from another one says where she is today. */
	batchId: number;
	chosen: boolean;
	/** The whole batch is on the order: she cannot be dropped one by one. */
	locked: boolean;
	registering: boolean;
	semen?: PlannedSemenCells;
	onToggle: () => void;
}

/** One female of a marked batch: a click anywhere on the row picks her or drops her. */
export const LotFemaleRow: React.FC<LotFemaleRowProps> = ({
	female,
	batchId,
	chosen,
	locked,
	registering,
	semen,
	onToggle
}) => {
	const { cellSx, inputSx, indexSx, textCellSx, zebraBg, selectedBg } = useGridCellStyles();
	const elsewhere = female.batch_id !== batchId;
	// Choosing the semen must not drop the female: the row toggles on click.
	const keepRow = (e: React.MouseEvent) => chosen && e.stopPropagation();

	const warning = female.is_breeding_eligible
		? undefined
		: locked
			? 'El ganadero la excluyó de reproducción: queda con los toros y se registra como expuesta.'
			: 'El ganadero la excluyó de reproducción.';

	return (
		<TableRow
			hover={!locked}
			onClick={locked ? undefined : onToggle}
			sx={{
				cursor: locked ? 'default' : 'pointer',
				'&:nth-of-type(even)': { bgcolor: zebraBg },
				...(chosen && !locked && { bgcolor: `${selectedBg} !important` })
			}}
		>
			<TableCell
				align="center"
				sx={{ ...indexSx, width: 44 }}
			>
				<Checkbox
					size="small"
					checked={chosen}
					disabled={locked}
					tabIndex={-1}
					disableRipple
				/>
			</TableCell>
			<SheetGridTagCell
				tag={female.identification}
				caption={registering && elsewhere ? `Hoy en ${female.batch_name ?? 'otro lote'}` : undefined}
			/>
			<TableCell sx={textCellSx}>{female.category_name ?? '—'}</TableCell>
			<TableCell sx={textCellSx}>{female.breed ?? '—'}</TableCell>
			{semen && (
				<TableCell
					sx={{ ...cellSx, ...inputSx }}
					onClick={keepRow}
				>
					<TextField
						select
						size="small"
						fullWidth
						disabled={!chosen}
						value={chosen ? (semen.valueOf(female.id!) ?? '') : ''}
						onChange={(e) =>
							semen.onChange(female.id!, e.target.value === '' ? null : Number(e.target.value))
						}
						SelectProps={{ displayEmpty: true }}
						inputProps={{ 'aria-label': `Semen previsto de ${female.identification}` }}
					>
						<MenuItem value="">
							<Typography
								variant="body2"
								color="text.secondary"
							>
								{chosen ? 'Se decide en la manga' : ''}
							</Typography>
						</MenuItem>
						{semen.options.map((option) => (
							<MenuItem
								key={option.itemId}
								value={option.itemId}
							>
								{option.label}
							</MenuItem>
						))}
					</TextField>
				</TableCell>
			)}
			<SheetGridStatusCell warning={warning} />
		</TableRow>
	);
};

export default LotFemaleRow;
