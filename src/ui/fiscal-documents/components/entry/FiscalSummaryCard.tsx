import { Alert, Paper, Stack, Typography } from '@mui/material';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { type Dec, dec, sub } from '@/core/stock/domain/rules/decimal';
import { formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import { SummaryRow } from '@/core/fiscal/domain/rules/fiscalPreview';
import { EntryMode } from './fiscalEntryState';

interface FiscalSummaryCardProps {
	lineCount: number;
	stockedCost: Dec;
	expenseCost: Dec;
	net: Dec;
	rows: SummaryRow[];
	total: Dec;
	declaredTotal: string;
	isCreditNote: boolean;
	mode: EntryMode;
	/** A delivery note without prices has no amounts: none are shown, never a $ 0 (delivery C). */
	unpriced: boolean;
}

/** What the stocked lines of each kind of paper do to the warehouse. */
const stockedLabel = (mode: EntryMode, isCreditNote: boolean): string =>
	mode === 'conversion'
		? 'De los remitos'
		: mode === 'delivery-note'
			? 'Entra al almacén'
			: isCreditNote
				? 'Sale del almacén'
				: 'Al almacén';

const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
	<Stack
		direction="row"
		justifyContent="space-between"
	>
		<Typography
			variant="body2"
			sx={{ fontWeight: strong ? 700 : 400 }}
			color={strong ? 'text.primary' : 'text.secondary'}
		>
			{label}
		</Typography>
		<Typography
			variant="body2"
			sx={{ fontWeight: strong ? 800 : 600, fontVariantNumeric: 'tabular-nums' }}
		>
			{value}
		</Typography>
	</Stack>
);

/** "2. Resumen": what goes to the warehouse and what is a direct expense, the taxes and the total against the paper (DS19). */
export default function FiscalSummaryCard(props: FiscalSummaryCardProps) {
	const { lineCount, stockedCost, expenseCost, net, rows, total, declaredTotal, isCreditNote, mode, unpriced } =
		props;

	if (unpriced) {
		return (
			<Paper
				variant="outlined"
				sx={{ p: 2, borderRadius: '8px' }}
			>
				<Typography sx={sectionTitleSx}>2. Resumen</Typography>
				<Stack
					spacing={0.75}
					sx={{ mt: 1.5 }}
				>
					<Row
						label={`${lineCount} renglón(es)`}
						value=""
					/>
					<Typography
						variant="body2"
						color="text.secondary"
					>
						Sin precios: la mercadería entra sin valor y lo toma de la factura.
					</Typography>
				</Stack>
			</Paper>
		);
	}

	const declared = dec(declaredTotal);
	const difference = declared === null ? null : sub(declared, total);
	// The issuer rounds VAT per rate, not per line: up to one peso is the same total (DS19).
	const onePeso = dec('1') ?? 0n;
	const matches = difference !== null && difference >= -onePeso && difference <= onePeso;

	return (
		<Paper
			variant="outlined"
			sx={{ p: 2, borderRadius: '8px' }}
		>
			<Typography sx={sectionTitleSx}>2. Resumen</Typography>
			<Stack
				spacing={0.75}
				sx={{ mt: 1.5 }}
			>
				<Row
					label={`${lineCount} renglón(es)`}
					value=""
				/>
				<Row
					label={stockedLabel(mode, isCreditNote)}
					value={formatMoney(stockedCost)}
				/>
				{mode !== 'delivery-note' && (
					<Row
						label="Gasto directo"
						value={formatMoney(expenseCost)}
					/>
				)}
				<Row
					label="Neto"
					value={formatMoney(net)}
					strong
				/>
				{rows.map((r) => (
					<Row
						key={r.label}
						label={r.label}
						value={formatMoney(r.amount)}
					/>
				))}
				<Row
					label="Total"
					value={formatMoney(total)}
					strong
				/>
			</Stack>
			{difference !== null && (
				<Alert
					severity={matches ? 'success' : 'warning'}
					sx={{ mt: 1.5, fontSize: '0.8rem', py: 0.5, borderRadius: '6px' }}
				>
					{matches
						? 'Coincide con el total del papel.'
						: `Difiere en ${formatMoney(difference)} del total del papel. Se puede registrar igual.`}
				</Alert>
			)}
		</Paper>
	);
}
