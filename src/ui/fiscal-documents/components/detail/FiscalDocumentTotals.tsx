import { Paper, Stack, Typography } from '@mui/material';
import { FiscalDocumentDetail } from '@/core/fiscal/domain/entities/FiscalDocument';
import { dec, isZero } from '@/core/stock/domain/rules/decimal';
import { formatMoney } from '@/core/stock/domain/rules/quantityFormat';

const Row = ({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: string }) => (
	<Stack
		direction="row"
		justifyContent="space-between"
		spacing={4}
	>
		<Typography
			variant="body2"
			color={tone ?? (strong ? 'text.primary' : 'text.secondary')}
			sx={{ fontWeight: strong ? 700 : 400 }}
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

/** Net, each tax as the paper prints it, the total, and the difference with the declared total (DS19). */
export default function FiscalDocumentTotals({ document }: { document: FiscalDocumentDetail }) {
	const difference = dec(document.totalDifference);

	return (
		<Paper
			variant="outlined"
			sx={{ p: 2, borderRadius: '8px', minWidth: 320, alignSelf: 'flex-end' }}
		>
			<Stack spacing={0.75}>
				<Row
					label="Neto"
					value={formatMoney(document.linesAmount)}
					strong
				/>
				{document.taxSummary.map((t) => (
					<Row
						key={t.label}
						label={`${t.label}${t.isRecoverable ? '' : ' (costo)'}`}
						value={formatMoney(t.amount)}
					/>
				))}
				<Row
					label="Total"
					value={formatMoney(document.totalAmount)}
					strong
				/>
				{difference !== null && !isZero(difference) && (
					<Row
						label={`Difiere del papel (${formatMoney(document.declaredTotal)})`}
						value={formatMoney(difference)}
						tone="warning.main"
					/>
				)}
			</Stack>
		</Paper>
	);
}
