import React from 'react';
import { MenuItem, TableBody, TableCell, TableHead, TableRow, TextField, IconButton, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridEmptyRow from '@/components/sheet-grid/SheetGridEmptyRow';
import SheetGridStatusCell from '@/components/sheet-grid/SheetGridStatusCell';
import SheetGridTagCell from '@/components/sheet-grid/SheetGridTagCell';
import { BullStayRow, OrderSheetErrors } from '../types';

interface BullStaysGridProps {
	rows: BullStayRow[];
	/** The batches a bull can come from or go to. */
	batches: Batch[];
	batchId: number;
	lotIndex: number;
	errors: OrderSheetErrors;
	warningOf: (row: BullStayRow) => string | undefined;
	onChange: (maleId: number, change: Partial<BullStayRow>) => void;
	onRemove: (maleId: number) => void;
}

/** One row per bull: where it came from, when it entered and left the batch, and where it went. */
export const BullStaysGrid: React.FC<BullStaysGridProps> = ({
	rows,
	batches,
	batchId,
	lotIndex,
	errors,
	warningOf,
	onChange,
	onRemove
}) => {
	const { cellSx, inputSx, headSx, indexSx, zebraBg } = useGridCellStyles();

	const batchSelect = (
		row: BullStayRow,
		rowIndex: number,
		field: 'originBatchId' | 'destinationBatchId',
		apiField: string
	) => {
		const error = errors[`lots.${lotIndex}.bulls.${rowIndex}.${apiField}`]?.[0];
		// A bull cannot "go" to the batch it served: that means the service did not end.
		const options = field === 'destinationBatchId' ? batches.filter((batch) => batch.id !== batchId) : batches;

		return (
			<TableCell sx={cellSx}>
				<TextField
					select
					fullWidth
					variant="outlined"
					value={row[field]}
					error={Boolean(error)}
					onChange={(e) => onChange(row.maleId, { [field]: Number(e.target.value) })}
					SelectProps={{ displayEmpty: true }}
					sx={inputSx}
				>
					<MenuItem value="">
						<em>Elegir lote</em>
					</MenuItem>
					{options.map((batch) => (
						<MenuItem
							key={batch.id}
							value={batch.id}
						>
							{batch.name}
						</MenuItem>
					))}
				</TextField>
			</TableCell>
		);
	};

	const dateCell = (row: BullStayRow, rowIndex: number, field: 'joinedAt' | 'retiredAt', apiField: string) => (
		<TableCell sx={cellSx}>
			<TextField
				type="date"
				fullWidth
				variant="outlined"
				value={row[field]}
				error={Boolean(errors[`lots.${lotIndex}.bulls.${rowIndex}.${apiField}`])}
				onChange={(e) => onChange(row.maleId, { [field]: e.target.value })}
				sx={inputSx}
			/>
		</TableCell>
	);

	return (
		<SheetGrid minWidth={900}>
			<TableHead>
				<TableRow>
					<TableCell sx={{ ...headSx, width: 44, textAlign: 'center' }}>#</TableCell>
					<TableCell sx={{ ...headSx, width: 170 }}>Toro</TableCell>
					<TableCell sx={headSx}>Viene de</TableCell>
					<TableCell sx={{ ...headSx, width: 150 }}>Entró</TableCell>
					<TableCell sx={{ ...headSx, width: 150 }}>Salió</TableCell>
					<TableCell sx={headSx}>Fue a</TableCell>
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{rows.length === 0 && (
					<SheetGridEmptyRow colSpan={7}>Agregá los toros que estuvieron en este lote.</SheetGridEmptyRow>
				)}
				{rows.map((row, index) => {
					const maleError = errors[`lots.${lotIndex}.bulls.${index}.male_caravan_id`]?.[0];
					const rowError =
						maleError ??
						['origin_batch_id', 'joined_at', 'retired_at', 'destination_batch_id']
							.map((field) => errors[`lots.${lotIndex}.bulls.${index}.${field}`]?.[0])
							.find(Boolean);

					return (
						<TableRow
							key={row.maleId}
							sx={{ bgcolor: index % 2 === 1 ? zebraBg : 'transparent' }}
						>
							<TableCell sx={indexSx}>{index + 1}</TableCell>
							<SheetGridTagCell
								tag={row.tag}
								error={Boolean(maleError)}
							/>
							{batchSelect(row, index, 'originBatchId', 'origin_batch_id')}
							{dateCell(row, index, 'joinedAt', 'joined_at')}
							{dateCell(row, index, 'retiredAt', 'retired_at')}
							{batchSelect(row, index, 'destinationBatchId', 'destination_batch_id')}
							<SheetGridStatusCell
								error={rowError}
								warning={warningOf(row)}
								keepChildren
							>
								<Tooltip title="Quitar fila">
									<IconButton
										size="small"
										onClick={() => onRemove(row.maleId)}
										aria-label="Quitar fila"
									>
										<FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
									</IconButton>
								</Tooltip>
							</SheetGridStatusCell>
						</TableRow>
					);
				})}
			</TableBody>
		</SheetGrid>
	);
};

export default BullStaysGrid;
