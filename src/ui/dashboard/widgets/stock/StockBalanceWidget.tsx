import { Box, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber } from '../../theme/formatters';
import { STOCK_BALANCE_30D } from '../../mocks/stockMocks';

interface BalanceRow {
	label: string;
	value: number;
	sign: '+' | '−';
}

/**
 * Opening + births + ORIGIN/ENTRY − EXIT − deaths − internal consumption = closing.
 * TRANSFER and WEANING between regular batches do not change the total.
 */
export function StockBalanceWidget({ instance }: WidgetRenderProps) {
	const d = STOCK_BALANCE_30D;
	const rows: BalanceRow[] = [
		{ label: 'Nacimientos', value: d.births, sign: '+' },
		{ label: 'Ingresos (compras)', value: d.entries, sign: '+' },
		{ label: 'Egresos del establecimiento', value: d.exits, sign: '−' },
		{ label: 'Bajas', value: d.deaths, sign: '−' },
		{ label: 'Consumo interno', value: d.internalConsumption, sign: '−' }
	];
	const max = Math.max(...rows.map((r) => r.value), 1);

	return (
		<WidgetCard
			title={instance.title ?? 'Balance de existencias · últimos 30 días'}
			subtitle="Qué entró y qué salió. Los movimientos entre lotes no cambian el total y se informan aparte."
			footnote={`Movimientos internos del período: ${formatNumber(d.internalMovements)} (transferencias y destetes)`}
		>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, fontVariantNumeric: 'tabular-nums' }}>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						pb: 1,
						borderBottom: 1,
						borderColor: 'divider'
					}}
				>
					<Typography sx={{ fontSize: '0.875rem' }}>{`Existencia al ${d.from}`}</Typography>
					<Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>{formatNumber(d.opening)}</Typography>
				</Box>
				{rows.map((row) => (
					<Box
						key={row.label}
						sx={{ display: 'grid', gridTemplateColumns: '190px 1fr 64px', gap: 1.5, alignItems: 'center' }}
					>
						<Typography sx={{ fontSize: '0.875rem' }}>{row.label}</Typography>
						<Box
							role="img"
							aria-label={`${row.label} ${row.sign}${row.value}`}
							sx={{ height: 16 }}
						>
							<Box
								sx={{
									width: `${(row.value / max) * 100}%`,
									height: 16,
									borderRadius: '3px',
									bgcolor: row.sign === '+' ? DASHBOARD_COLORS.accent : DASHBOARD_COLORS.danger
								}}
							/>
						</Box>
						<Typography
							sx={{ fontSize: '0.875rem', fontWeight: 700, textAlign: 'right' }}
						>{`${row.sign}${row.value}`}</Typography>
					</Box>
				))}
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						pt: 1,
						borderTop: 2,
						borderColor: 'divider'
					}}
				>
					<Typography sx={{ fontSize: '0.9375rem', fontWeight: 700 }}>{`Existencia al ${d.to}`}</Typography>
					<Typography sx={{ fontSize: '0.9375rem', fontWeight: 700 }}>{formatNumber(d.closing)}</Typography>
				</Box>
			</Box>
		</WidgetCard>
	);
}

export default StockBalanceWidget;
