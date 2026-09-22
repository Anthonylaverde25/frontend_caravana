import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { Delta } from '../../components/primitives/Delta';
import { StackedBar } from '../../components/primitives/StackedBar';
import { HorizontalBarList } from '../../components/primitives/HorizontalBarList';
import { Sparkline } from '../../components/charts/Sparkline';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber, formatSigned } from '../../theme/formatters';
import { STOCK_BALANCE_30D, STOCK_BY_BREED, STOCK_TOTAL } from '../../mocks/stockMocks';

/** Active caravans, excluding INTERNAL_DEATH and INTERNAL_CONSUMPTION batches. */
export function StockTotalWidget({ instance }: WidgetRenderProps) {
	const d = STOCK_TOTAL;
	const b = STOCK_BALANCE_30D;

	return (
		<KpiCard
			label={instance.title ?? 'Existencias'}
			status={
				<StatusPill
					tone="neutral"
					label="Hoy"
				/>
			}
			value={formatNumber(d.heads)}
			unit="cabezas"
			visual={
				<Sparkline
					values={d.last12Months}
					ariaLabel={`Existencias de los últimos 12 meses, de ${formatNumber(d.last12Months[0])} a ${formatNumber(d.heads)} cabezas`}
				/>
			}
			context={
				<>
					<Delta
						text={`▲ ${formatSigned(d.deltaHeads30d, 0)} (${formatSigned(d.deltaPct30d)} %)`}
						favorable
					/>
					{` vs. hace 30 días · nacimientos +${b.births} · salidas −${b.exits + b.deaths + b.internalConsumption}`}
				</>
			}
			footnote={`Caravanas activas al ${d.asOf}`}
		/>
	);
}

export function StockByBreedWidget({ instance }: WidgetRenderProps) {
	const colors = [DASHBOARD_COLORS.accent, DASHBOARD_COLORS.accentMid, '#9DBFAE', DASHBOARD_COLORS.neutral];

	return (
		<KpiCard
			label={instance.title ?? 'Composición por raza'}
			value={formatNumber(STOCK_TOTAL.heads)}
			unit="cabezas"
			visual={
				<StackedBar
					height={16}
					showLegend={false}
					segments={STOCK_BY_BREED.map((row, i) => ({
						label: row.label,
						value: row.value,
						color: colors[i]
					}))}
				/>
			}
			context={
				<HorizontalBarList
					labelWidth={110}
					rows={STOCK_BY_BREED.map((row, i) => ({
						label: row.label,
						value: row.value,
						display: `${row.pct} %`,
						color: colors[i]
					}))}
				/>
			}
			footnote="Sin raza cargada cuenta como “sin dato”"
		/>
	);
}
