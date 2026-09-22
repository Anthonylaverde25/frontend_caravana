import { Box, Link, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { Legend } from '../../components/primitives/StackedBar';
import { FunnelBars } from '../../components/charts/FunnelBars';
import { LineTrendChart } from '../../components/charts/LineTrendChart';
import { StackedColumnChart } from '../../components/charts/StackedColumnChart';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber } from '../../theme/formatters';
import { CALVINGS_BY_WEEK, FUNNEL, PREGNANCY_BY_CAMPAIGN } from '../../mocks/reproductiveMocks';

export function ReproductiveFunnelWidget({ instance }: WidgetRenderProps) {
	return (
		<WidgetCard
			title={instance.title ?? `Embudo reproductivo · campaña ${FUNNEL.campaign}`}
			subtitle={
				<>
					Todos los porcentajes se calculan sobre los mismos{' '}
					<strong>{`${FUNNEL.stages[0].value} vientres expuestos`}</strong>, por eso son comparables entre
					etapas.
				</>
			}
			actions={
				<Link
					href="#reproductivo"
					sx={{ fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap' }}
				>
					Ver detalle →
				</Link>
			}
		>
			<FunnelBars stages={FUNNEL.stages} />
		</WidgetCard>
	);
}

export function PregnancyByCampaignWidget({ instance }: WidgetRenderProps) {
	return (
		<WidgetCard
			title={instance.title ?? 'Preñez por campaña'}
			subtitle="% de vientres expuestos diagnosticados preñados. La campaña en curso es parcial."
			footnote="El eje empieza en 75 % para distinguir campañas; los valores están rotulados."
		>
			<Box sx={{ display: 'flex', gap: 2.25, fontSize: '0.75rem', color: 'text.secondary' }}>
				<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
					<Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: DASHBOARD_COLORS.accent }} />
					Cerrada
				</Box>
				<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
					<Box
						sx={{
							width: 10,
							height: 10,
							borderRadius: '50%',
							border: 2,
							borderColor: DASHBOARD_COLORS.accent
						}}
					/>
					Parcial
				</Box>
			</Box>
			<LineTrendChart
				points={PREGNANCY_BY_CAMPAIGN}
				yMin={75}
				yMax={95}
				yTicks={[75, 80, 85, 90, 95]}
				formatValue={(v) => formatNumber(v, 1)}
				formatTick={(v) => `${v} %`}
				showValueLabels
				ariaLabel={`Preñez por campaña: ${PREGNANCY_BY_CAMPAIGN.map((p) => `${p.label} ${formatNumber(p.value, 1)}`).join('; ')}`}
			/>
		</WidgetCard>
	);
}

export function CalvingsByWeekWidget({ instance }: WidgetRenderProps) {
	const d = CALVINGS_BY_WEEK;
	const weeksToDate = Math.floor(d.todayPosition);
	const expectedToDate = d.expected.slice(0, weeksToDate).reduce((a, b) => a + b, 0);
	const registered = d.registered.reduce((a, b) => a + b, 0);

	return (
		<WidgetCard
			title={instance.title ?? 'Pariciones: esperadas vs. registradas'}
			subtitle="Por semana, según la fecha probable de parto de cada preñez."
			actions={
				<Legend
					items={[
						{ label: 'Registradas', color: DASHBOARD_COLORS.accent },
						{ label: 'Esperadas (contorno)', color: DASHBOARD_COLORS.accentLight }
					]}
				/>
			}
		>
			<StackedColumnChart
				categories={d.weeks}
				series={[{ label: 'Registradas', color: DASHBOARD_COLORS.accent, values: d.registered }]}
				outline={d.expected}
				yMax={65}
				yTicks={[0, 20, 40, 60]}
				marker={{ position: d.todayPosition, label: 'hoy 18/09' }}
				ariaLabel="Pariciones esperadas por semana y nacimientos registrados hasta hoy"
			/>
			<Box sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
				<Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
					Esperadas a la fecha <strong>{expectedToDate}</strong> · registradas <strong>{registered}</strong> ·
					faltan registrar o se perdieron <strong>{expectedToDate - registered}</strong>
				</Typography>
			</Box>
		</WidgetCard>
	);
}
