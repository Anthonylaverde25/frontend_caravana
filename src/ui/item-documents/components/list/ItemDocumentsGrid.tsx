import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { SheetGridTagCell } from 'src/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { ItemDocument } from '@/core/stock/domain/entities/ItemDocument';
import { formatDate, formatMoney } from '@/core/stock/domain/rules/quantityFormat';

interface ItemDocumentsGridProps {
	documents: ItemDocument[];
	loading: boolean;
	emptyMessage: string;
	onOpen: (document: ItemDocument) => void;
}

/** Where an operation came from: its provider document, its batch, or what it reverses. */
const origin = (d: ItemDocument): string => {
	if (d.fiscalDocument) return d.fiscalDocument.label;
	if (d.reverses) return `Anula el movimiento N.º ${d.reverses.number}`;
	if (d.batch) return `${d.batch.name}${d.headsTreated ? ` · ${d.headsTreated} cab.` : ''}`;
	return d.type === 'CONSUMPTION' ? 'Uso general' : '—';
};

/** Stock operations in load order, newest first; a row opens the operation. */
export default function ItemDocumentsGrid({ documents, loading, emptyMessage, onOpen }: ItemDocumentsGridProps) {
	const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();

	return (
		<SheetGrid minWidth={900} maxHeight={{ xs: 520, lg: 'calc(100vh - 330px)' }}>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={{ ...headSx, width: 150 }}>Movimiento</TableCell>
					<TableCell sx={{ ...headSx, width: 110 }}>Fecha</TableCell>
					<TableCell sx={headSx}>Origen</TableCell>
					<TableCell sx={{ ...headSx, width: 260 }}>Ítems</TableCell>
					<TableCell sx={{ ...headSx, width: 140 }} align="right">Costo</TableCell>
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{loading && <SheetGridEmptyRow colSpan={7}>Cargando movimientos…</SheetGridEmptyRow>}
				{!loading && documents.length === 0 && <SheetGridEmptyRow colSpan={7}>{emptyMessage}</SheetGridEmptyRow>}
				{documents.map((d, index) => (
					<TableRow key={d.id} hover onClick={() => onOpen(d)} sx={{ cursor: 'pointer', bgcolor: index % 2 === 1 ? zebraBg : undefined }}>
						<TableCell sx={indexSx}>{index + 1}</TableCell>
						<SheetGridTagCell tag={`N.º ${d.number}`} caption={d.typeLabel} />
						<TableCell sx={textCellSx}>{formatDate(d.occurredAt)}</TableCell>
						<TableCell sx={{ ...textCellSx, fontWeight: 600 }}>{origin(d)}</TableCell>
						<TableCell sx={{ ...textCellSx, color: 'text.secondary' }}>{d.lines.map((l) => l.item.name).join(', ')}</TableCell>
						<TableCell sx={{ ...textCellSx, fontWeight: 700 }} align="right">{formatMoney(d.totalCost)}</TableCell>
						<SheetGridStatusCell info={d.reversedBy ? `Anulado por el movimiento N.º ${d.reversedBy.number}` : undefined}>
							<FuseSvgIcon size={16} color="action">heroicons-outline:chevron-right</FuseSvgIcon>
						</SheetGridStatusCell>
					</TableRow>
				))}
			</TableBody>
		</SheetGrid>
	);
}
