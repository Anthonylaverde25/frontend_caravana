import { TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { FiscalDocumentLine } from '@/core/fiscal/domain/entities/FiscalDocument';
import { formatMoney, formatQuantity, formatUnitCost } from '@/core/stock/domain/rules/quantityFormat';

/** Where the line went: a batch, the warehouse, or, for an unpriced delivery note, what waits for the invoice. */
const destination = (line: FiscalDocumentLine): string => {
	const lot = line.unvaluedLot;

	if (lot) {
		const unit = line.item.unitSymbol;

		if (lot.status === 'VALUED')
			return `Valorizado por la factura a ${formatUnitCost(lot.valuedUnitCost)}${unit ? ` / ${unit}` : ''}`;

		if (lot.status === 'VOIDED') return 'Anulado';

		return `Sin valorizar: ${formatQuantity(lot.remainingQuantity, unit)} de ${formatQuantity(lot.quantity, unit)} · ${formatQuantity(lot.consumedQuantity, unit)} consumidas`;
	}

	if (line.deliveryNoteLabel) return 'Entró al almacén con el remito';

	if (line.batch) return `${line.batch.name} · ${line.headsTreated} cab.`;

	return line.item.trackStock ? 'Al almacén' : 'Gasto directo';
};

/** The lines of a registered document: as on paper, converted, with their taxes and cost. */
export default function FiscalDocumentLinesGrid({ lines }: { lines: FiscalDocumentLine[] }) {
	const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();
	const pending = { color: 'text.disabled', fontStyle: 'italic' } as const;
	const taxText = (line: FiscalDocumentLine) =>
		line.taxes
			.map((t) => `${t.rateName ? `${t.name} ${t.rateName}` : t.name} ${formatMoney(t.amount)}`)
			.join(' · ') || '—';

	return (
		<SheetGrid
			minWidth={1180}
			maxHeight={{ xs: 520, lg: 'calc(100vh - 380px)' }}
		>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={headSx}>Ítem</TableCell>
					<TableCell sx={{ ...headSx, width: 230 }}>En el papel</TableCell>
					<TableCell
						sx={{ ...headSx, width: 120 }}
						align="right"
					>
						Cantidad
					</TableCell>
					<TableCell
						sx={{ ...headSx, width: 120 }}
						align="right"
					>
						Importe
					</TableCell>
					<TableCell sx={{ ...headSx, width: 230 }}>Impuestos</TableCell>
					<TableCell
						sx={{ ...headSx, width: 120 }}
						align="right"
					>
						Costo
					</TableCell>
					<TableCell
						sx={{ ...headSx, width: 120 }}
						align="right"
					>
						Costo u.
					</TableCell>
					<TableCell sx={{ ...headSx, width: 260 }}>Destino</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{lines.map((line, index) => (
					<TableRow
						key={line.id}
						sx={{ bgcolor: index % 2 === 1 ? zebraBg : undefined }}
					>
						<TableCell sx={indexSx}>{line.position}</TableCell>
						<TableCell sx={{ ...textCellSx, fontWeight: 600 }}>{line.item.name}</TableCell>
						<TableCell sx={textCellSx}>
							{formatQuantity(line.inputQuantity)} {line.inputLabel}{' '}
							{line.unitPrice === null ? '· sin precio' : `a ${formatMoney(line.unitPrice)}`}
							{line.deliveryNoteLabel && (
								<Typography
									component="div"
									variant="caption"
									color="text.secondary"
								>
									Del {line.deliveryNoteLabel}
								</Typography>
							)}
						</TableCell>
						<TableCell
							sx={textCellSx}
							align="right"
						>
							{formatQuantity(line.quantity, line.item.unitSymbol)}
						</TableCell>
						<TableCell
							sx={{ ...textCellSx, ...(line.lineAmount === null ? pending : {}) }}
							align="right"
						>
							{line.lineAmount === null ? 'Sin precio' : formatMoney(line.lineAmount)}
						</TableCell>
						<TableCell sx={{ ...textCellSx, fontSize: '0.78rem' }}>{taxText(line)}</TableCell>
						<TableCell
							sx={{ ...textCellSx, fontWeight: 700, ...(line.costAmount === null ? pending : {}) }}
							align="right"
						>
							{line.costAmount === null ? 'De la factura' : formatMoney(line.costAmount)}
						</TableCell>
						<TableCell
							sx={{ ...textCellSx, ...(line.unitCost === null ? pending : {}) }}
							align="right"
						>
							{line.unitCost === null
								? '—'
								: `${formatUnitCost(line.unitCost)}${line.item.unitSymbol ? ` / ${line.item.unitSymbol}` : ''}`}
						</TableCell>
						<TableCell
							sx={{
								...textCellSx,
								color: line.unvaluedLot?.status === 'PENDING' ? 'warning.dark' : undefined
							}}
						>
							{destination(line)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</SheetGrid>
	);
}
