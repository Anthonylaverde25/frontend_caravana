import { Box, Typography } from '@mui/material';
import { FiscalDocumentDetail, FiscalDocumentLine } from '@/core/fiscal/domain/entities/FiscalDocument';
import { formatMoney, formatQuantity } from '@/core/stock/domain/rules/quantityFormat';
import { INK } from './paperStyles';

const vatOf = (line: FiscalDocumentLine): string => line.taxes.find((t) => t.code === 'VAT')?.rateName ?? '—';
/** An amount as the paper prints it: no currency sign, two decimals. */
const plain = (value: string | null): string => (value === null ? '—' : formatMoney(value).replace('$ ', ''));

const thSx = { bgcolor: '#E5E7EB', borderTop: `1.5px solid ${INK}`, borderBottom: `1.5px solid ${INK}`, textAlign: 'left', px: 1, py: 0.75, fontWeight: 700, fontSize: '0.75rem' } as const;
const tdSx = { px: 1, py: '7px', borderBottom: '1px solid #F1F2F4', verticalAlign: 'top', fontSize: '0.78rem' } as const;
const right = { textAlign: 'right' } as const;

/**
 * The lines of the paper (lienzo: FiscalDocumentDetail): grey header between heavy rules. An unpriced
 * delivery note shows quantities only; its value comes with the invoice.
 */
export default function FiscalPaperItems({ document: d }: { document: FiscalDocumentDetail }) {
	const priced = d.linesAmount !== null;
	const vat = priced && d.type.discriminatesVat;

	return (
		<Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
			<thead>
				<tr>
					<Box component="th" scope="col" sx={{ ...thSx, width: 80 }}>Código</Box>
					<Box component="th" scope="col" sx={thSx}>Descripción</Box>
					<Box component="th" scope="col" sx={{ ...thSx, ...right, width: 130 }}>Cantidad</Box>
					{priced && <Box component="th" scope="col" sx={{ ...thSx, ...right, width: 100 }}>P. unitario</Box>}
					{vat && <Box component="th" scope="col" sx={{ ...thSx, ...right, width: 70 }}>Alíc. IVA</Box>}
					{priced && <Box component="th" scope="col" sx={{ ...thSx, ...right, width: 100 }}>Importe</Box>}
				</tr>
			</thead>
			<tbody>
				{d.lines.map((line) => (
					<tr key={line.id}>
						<Box component="td" sx={{ ...tdSx, fontFamily: 'monospace', fontWeight: 600 }}>{line.item.code ?? '—'}</Box>
						<Box component="td" sx={tdSx}>
							{line.item.name}
							{line.sourceDescription && line.sourceDescription !== line.item.name && (
								<Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>En el papel: {line.sourceDescription}</Typography>
							)}
						</Box>
						<Box component="td" sx={{ ...tdSx, ...right }}>{formatQuantity(line.inputQuantity, line.inputLabel ?? line.item.unitSymbol)}</Box>
						{priced && <Box component="td" sx={{ ...tdSx, ...right }}>{plain(line.unitPrice)}</Box>}
						{vat && <Box component="td" sx={{ ...tdSx, ...right }}>{vatOf(line)}</Box>}
						{priced && <Box component="td" sx={{ ...tdSx, ...right }}>{plain(line.lineAmount)}</Box>}
					</tr>
				))}
			</tbody>
			{!priced && (
				<caption style={{ captionSide: 'bottom', textAlign: 'left' }}>
					<Typography sx={{ mt: 1.5, fontSize: '0.75rem', color: 'text.secondary' }}>Remito sin precios: el valor llega con su factura.</Typography>
				</caption>
			)}
		</Box>
	);
}
