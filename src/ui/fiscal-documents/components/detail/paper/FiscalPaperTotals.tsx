import { Box, Typography } from '@mui/material';
import { FiscalDocumentDetail } from '@/core/fiscal/domain/entities/FiscalDocument';
import { add, dec, ZERO } from '@/core/stock/domain/rules/decimal';
import { formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import { paperBoxSx } from './paperStyles';

const plain = (value: Parameters<typeof formatMoney>[0]): string => formatMoney(value).replace('$ ', '');

/**
 * The totals box at the foot of the paper: net, VAT per rate, every other tax together ("Otros
 * tributos") and the total, as AFIP papers print them.
 */
export default function FiscalPaperTotals({ document: d }: { document: FiscalDocumentDetail }) {
	const vatRows = d.taxSummary.filter((t) => t.label.startsWith('IVA'));
	const others = d.taxSummary.filter((t) => !t.label.startsWith('IVA')).reduce((acc, t) => add(acc, dec(t.amount) ?? ZERO), ZERO);
	const row = (label: string, value: string, strong = false) => (
		<Box key={label} sx={{ display: 'contents', '& > *': { fontSize: strong ? '0.88rem' : '0.78rem' } }}>
			<Typography sx={{ fontWeight: 700, textAlign: 'right' }}>{label}: $</Typography>
			<Typography sx={{ textAlign: 'right', fontWeight: strong ? 700 : 400 }}>{value}</Typography>
		</Box>
	);

	return (
		<Box component="section" sx={{ ...paperBoxSx, p: '14px 18px' }}>
			<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 150px', columnGap: 2, rowGap: 0.75 }}>
				{row(d.type.discriminatesVat ? 'Importe neto gravado' : 'Subtotal', plain(d.linesAmount))}
				{vatRows.map((t) => row(t.label, plain(t.amount)))}
				{d.type.discriminatesVat && row('Otros tributos', plain(others))}
				{row('Total', plain(d.totalAmount), true)}
			</Box>
		</Box>
	);
}
