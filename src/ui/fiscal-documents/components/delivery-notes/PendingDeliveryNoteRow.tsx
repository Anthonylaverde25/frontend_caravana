import { Checkbox, TableCell, TableRow } from '@mui/material';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { SheetGridTagCell } from 'src/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { PendingDeliveryNote } from '@/core/fiscal/domain/entities/DeliveryNote';
import { formatDate, formatMoney } from '@/core/stock/domain/rules/quantityFormat';

interface PendingDeliveryNoteRowProps {
	note: PendingDeliveryNote;
	index: number;
	selected: boolean;
	onToggle: () => void;
	onOpen: () => void;
}

/** One delivery note waiting for its invoice: how old it is and what of it has no cost yet. */
export default function PendingDeliveryNoteRow({
	note,
	index,
	selected,
	onToggle,
	onOpen
}: PendingDeliveryNoteRowProps) {
	const { indexSx, textCellSx, zebraBg, selectedBg } = useGridCellStyles();
	const consumed = note.linesWithIssues > 0;

	return (
		<TableRow
			hover
			onClick={onOpen}
			sx={{ cursor: 'pointer', bgcolor: selected ? selectedBg : index % 2 === 1 ? zebraBg : undefined }}
		>
			<TableCell
				sx={indexSx}
				onClick={(e) => e.stopPropagation()}
			>
				<Checkbox
					size="small"
					checked={selected}
					onChange={onToggle}
				/>
			</TableCell>
			<SheetGridTagCell
				tag={note.label.replace(/^\D+/, '')}
				caption={note.label.replace(/\s[\d-]+$/, '')}
			/>
			<TableCell sx={textCellSx}>{formatDate(note.issuedAt)}</TableCell>
			<TableCell
				sx={{
					...textCellSx,
					fontWeight: note.ageDays > 15 ? 700 : undefined,
					color: note.ageDays > 15 ? 'warning.dark' : undefined
				}}
				align="right"
			>
				{note.ageDays}
			</TableCell>
			<TableCell sx={textCellSx}>{note.isValued ? 'Sí' : 'No'}</TableCell>
			<TableCell
				sx={textCellSx}
				align="right"
			>
				{note.linesCount}
			</TableCell>
			<TableCell
				sx={{ ...textCellSx, color: note.isValued ? undefined : 'text.secondary' }}
				align="right"
			>
				{note.isValued ? formatMoney(note.linesAmount) : 'Sin precio'}
			</TableCell>
			<TableCell sx={{ ...textCellSx, color: consumed ? 'warning.dark' : 'text.secondary' }}>
				{note.isValued
					? '—'
					: consumed
						? `${note.linesWithIssues} renglón(es) con consumo sin costo`
						: 'Todo en el almacén'}
			</TableCell>
			<SheetGridStatusCell
				warning={
					consumed
						? 'Ya se consumió mercadería de este remito: su costo queda pendiente hasta la factura.'
						: undefined
				}
			/>
		</TableRow>
	);
}
