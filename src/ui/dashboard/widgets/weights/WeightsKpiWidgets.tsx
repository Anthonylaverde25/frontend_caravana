import { Box } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { Delta } from '../../components/primitives/Delta';
import { ReferenceBar } from '../../components/primitives/ReferenceBar';
import { StackedBar } from '../../components/primitives/StackedBar';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber, formatSigned } from '../../theme/formatters';
import { ADPV_BY_GROUP, AdpvGroup, BACKGROUNDING_KG, WEANING_WEIGHT, WEIGHT_FRESHNESS } from '../../mocks/weightsMocks';

/**
 * Average daily gain per animal, averaged only over animals weighed on both dates,
 * so batch composition changes never contaminate the gain.
 */
export function AdpvWidget({ instance }: WidgetRenderProps) {
	const group = (instance.config?.group as AdpvGroup | undefined) ?? 'FEMALE';
	const d = ADPV_BY_GROUP[group];
	const delta = d.value - d.previous;
	const improved = delta >= 0;

	return (
		<KpiCard
			label={instance.title ?? `ADPV · ${d.label}`}
			status={
				<StatusPill
					tone={improved ? 'ok' : 'bad'}
					trend={improved ? 'up' : 'down'}
					label={formatSigned(delta, 2)}
				/>
			}
			value={formatNumber(d.value, 2)}
			unit="kg/día"
			visual={
				<ReferenceBar
					value={d.value}
					min={0}
					max={0.8}
					minLabel="0"
					maxLabel="0,8"
					marker={{ value: d.previous, label: `anterior ${formatNumber(d.previous, 2)}` }}
					ariaLabel={`${formatNumber(d.value, 2)} kilos por día; período anterior ${formatNumber(d.previous, 2)}`}
				/>
			}
			context={
				<>
					<Delta
						text={formatSigned(delta, 2)}
						favorable={improved}
					/>
					{` vs. los 60 días anteriores · ${d.context}`}
				</>
			}
			footnote={
				d.staleWarning ? (
					<Box
						component="span"
						sx={{ color: 'warning.dark', fontWeight: 600 }}
					>
						{d.staleWarning}
					</Box>
				) : (
					d.footnote
				)
			}
		/>
	);
}

export function WeaningWeightWidget({ instance }: WidgetRenderProps) {
	const d = WEANING_WEIGHT;
	const inRange = d.average >= d.refMin && d.average <= d.refMax;

	return (
		<KpiCard
			label={instance.title ?? 'Peso al destete · 2026'}
			status={
				<StatusPill
					tone={inRange ? 'ok' : 'warn'}
					label={inRange ? 'En rango' : 'Fuera de rango'}
				/>
			}
			value={String(d.average)}
			unit="kg"
			visual={
				<ReferenceBar
					value={d.average}
					min={130}
					max={210}
					minLabel="130 kg"
					maxLabel="210"
					band={{ from: d.refMin, to: d.refMax, label: `referencia INTA ${d.refMin}–${d.refMax}` }}
					ariaLabel={`${d.average} kilos; referencia ${d.refMin} a ${d.refMax}`}
				/>
			}
			context={`${d.calves} terneros · machos ${d.males} kg · hembras ${d.females} kg`}
			footnote={`Destete tradicional · ${d.date}`}
		/>
	);
}

export function BackgroundingKgWidget({ instance }: WidgetRenderProps) {
	const d = BACKGROUNDING_KG;

	return (
		<KpiCard
			label={instance.title ?? 'Kilos en recría'}
			status={
				<StatusPill
					tone="neutral"
					label="Hoy"
				/>
			}
			value={formatNumber(d.totalKg)}
			unit="kg"
			visual={
				<StackedBar
					showLegend={false}
					segments={[
						{ label: 'Recría hembra', value: d.femalesKg, color: DASHBOARD_COLORS.accent },
						{ label: 'Recría macho', value: d.malesKg, color: DASHBOARD_COLORS.accentMid }
					]}
				/>
			}
			context={`${d.heads} cabezas en ${d.batches} lotes · hembras ${formatNumber(d.femalesKg)} · machos ${formatNumber(d.malesKg)}`}
			footnote={`Pesos con fechas entre ${d.from} y ${d.to}`}
		/>
	);
}

export function WeightFreshnessWidget({ instance }: WidgetRenderProps) {
	const d = WEIGHT_FRESHNESS;
	const pct = Math.round((d.weighed / d.heads) * 100);

	return (
		<KpiCard
			label={instance.title ?? 'Vigencia de los pesos'}
			status={
				<StatusPill
					tone={d.stale > 0 ? 'warn' : 'ok'}
					label={d.stale > 0 ? `${d.stale} desactualizados` : 'Pesos vigentes'}
				/>
			}
			value={String(pct)}
			unit="% pesados"
			visual={
				<StackedBar
					segments={[
						{ label: '< 15 días', value: d.fresh, color: DASHBOARD_COLORS.accent },
						{ label: '15–45', value: d.aging, color: DASHBOARD_COLORS.accentMid },
						{ label: '> 45', value: d.stale, color: DASHBOARD_COLORS.ochre }
					]}
				/>
			}
			context={`${d.weighed} de ${d.heads} animales de recría tienen peso`}
			footnote={`Umbral de vigencia: ${d.staleDays} días`}
		/>
	);
}
