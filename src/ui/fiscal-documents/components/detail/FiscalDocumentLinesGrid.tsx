import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { FiscalDocumentLine } from '@/core/fiscal/domain/entities/FiscalDocument';
import { formatMoney, formatQuantity, formatUnitCost } from '@/core/stock/domain/rules/quantityFormat';

/** The lines of a registered document: as on paper, converted, with their taxes and cost. */
export default function FiscalDocumentLinesGrid({ lines }: { lines: FiscalDocumentLine[] }) {
	const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();
	const taxText = (line: FiscalDocumentLine) =>
		line.taxes.map((t) => `${t.rateName ? `${t.name} ${t.rateName}` : t.name} ${formatMoney(t.amount)}`).join(' · ') || '—';

	return (
		<SheetGrid minWidth={1180} maxHeight={{ xs: 520, lg: 'calc(100vh - 380px)' }}>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={headSx}>Ítem</TableCell>
					<TableCell sx={{ ...headSx, width: 230 }}>En el papel</TableCell>
					<TableCell sx={{ ...headSx, width: 120 }} align="right">Cantidad</TableCell>
					<TableCell sx={{ ...headSx, width: 120 }} align="right">Importe</TableCell>
					<TableCell sx={{ ...headSx, width: 230 }}>Impuestos</TableCell>
					<TableCell sx={{ ...headSx, width: 120 }} align="right">Costo</TableCell>
					<TableCell sx={{ ...headSx, width: 120 }} align="right">Costo u.</TableCell>
					<TableCell sx={{ ...headSx, width: 170 }}>Lote</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{lines.map((line, index) => (
					<TableRow key={line.id} sx={{ bgcolor: index % 2 === 1 ? zebraBg : undefined }}>
						<TableCell sx={indexSx}>{line.position}</TableCell>
						<TableCell sx={{ ...textCellSx, fontWeight: 600 }}>{line.item.name}</TableCell>
						<TableCell sx={textCellSx}>
							{formatQuantity(line.inputQuantity)} {line.inputLabel} a {formatMoney(line.unitPrice)}
						</TableCell>
						<TableCell sx={textCellSx} align="right">{formatQuantity(line.quantity, line.item.unitSymbol)}</TableCell>
						<TableCell sx={textCellSx} align="right">{formatMoney(line.lineAmount)}</TableCell>
						<TableCell sx={{ ...textCellSx, fontSize: '0.78rem' }}>{taxText(line)}</TableCell>
						<TableCell sx={{ ...textCellSx, fontWeight: 700 }} align="right">{formatMoney(line.costAmount)}</TableCell>
						<TableCell sx={textCellSx} align="right">
							{formatUnitCost(line.unitCost)}
							{line.item.unitSymbol ? ` / ${line.item.unitSymbol}` : ''}
						</TableCell>
						<TableCell sx={textCellSx}>
							{line.batch ? `${line.batch.name} · ${line.headsTreated} cab.` : line.item.trackStock ? 'Al almacén' : 'Gasto directo'}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</SheetGrid>
	);
}
