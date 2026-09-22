import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { Delta } from '../../components/primitives/Delta';
import { ReferenceBar } from '../../components/primitives/ReferenceBar';
import { StackedBar } from '../../components/primitives/StackedBar';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber, formatPercent, formatPp } from '../../theme/formatters';
import { BULL_RATIO, EMPTY_AT_CHECK, HEAD_OF_CALVING, PREGNANCY } from '../../mocks/reproductiveMocks';

/** Pregnant ÷ females checked. Batches without a pregnancy check never enter the total. */
export function PregnancyRateWidget({ instance }: WidgetRenderProps) {
	const d = PREGNANCY;
	const delta = d.rate - d.previousRate;

	return (
		<KpiCard
			label={instance.title ?? 'Preñez por tacto'}
			status={
				<StatusPill
					tone="info"
					label="Parcial"
				/>
			}
			value={formatNumber(d.rate, 1)}
			unit="%"
			visual={
				<ReferenceBar
					value={d.rate}
					min={70}
					max={100}
					minLabel="70 %"
					maxLabel="100 %"
					marker={{
						value: d.previousRate,
						label: `${d.previousCampaign}: ${formatNumber(d.previousRate, 1)}`
					}}
					ariaLabel={`${formatPercent(d.rate)}; campaña ${d.previousCampaign}: ${formatPercent(d.previousRate)}`}
				/>
			}
			context={
				<>
					{`${d.pregnant} preñadas de `}
					<strong>{`${d.checked} vientres con tacto`}</strong>
					{' · '}
					<Delta
						text={formatPp(delta)}
						favorable={delta >= 0}
					/>
					{` vs. ${d.previousCampaign}`}
				</>
			}
			footnote={`Parcial: tacto al ${d.checkDate} · falta ${d.pendingBatch} (${d.pendingFemales} vientres)`}
		/>
	);
}

export function HeadOfCalvingWidget({ instance }: WidgetRenderProps) {
	const d = HEAD_OF_CALVING;
	const delta = d.rate - d.previousRate;

	return (
		<KpiCard
			label={instance.title ?? 'Cabeza de parición'}
			status={
				<StatusPill
					tone={delta >= 0 ? 'ok' : 'warn'}
					label={delta >= 0 ? 'Mejoró' : 'Empeoró'}
					trend={delta >= 0 ? 'up' : 'down'}
				/>
			}
			value={formatNumber(d.rate, 1)}
			unit="%"
			visual={
				<ReferenceBar
					value={d.rate}
					min={0}
					max={100}
					minLabel="0 %"
					maxLabel="100 %"
					marker={{ value: d.previousRate, label: `2024/25: ${formatNumber(d.previousRate, 1)}` }}
					ariaLabel={`${formatPercent(d.rate)}; campaña anterior ${formatPercent(d.previousRate)}`}
				/>
			}
			context={
				<>
					{`${d.head} de `}
					<strong>{`${d.pregnant} preñadas`}</strong>
					{' conciben en los primeros 21 días · '}
					<Delta
						text={formatPp(delta)}
						favorable={delta >= 0}
					/>
				</>
			}
			footnote="Denominador: preñadas, no expuestas"
		/>
	);
}

export function EmptyAtCheckWidget({ instance }: WidgetRenderProps) {
	const d = EMPTY_AT_CHECK;

	return (
		<KpiCard
			label={instance.title ?? 'Vacías al tacto'}
			status={
				<StatusPill
					tone="neutral"
					label="Para decidir"
				/>
			}
			value={String(d.total)}
			unit="vientres"
			visual={
				<StackedBar
					showLegend={false}
					segments={[
						{ label: 'Vacías secas', value: d.dry, color: DASHBOARD_COLORS.neutralDark },
						{ label: 'Vacías con cría al pie', value: d.nursing, color: DASHBOARD_COLORS.neutral }
					]}
				/>
			}
			context={
				<>
					<strong>{formatPercent((d.total / d.checked) * 100)}</strong>
					{` de ${d.checked} · ${d.dry} vacías secas · ${d.nursing} vacías con cría al pie`}
				</>
			}
			footnote="Según la lactancia registrada de cada vaca"
		/>
	);
}

/** Reference range 3–7 % from INTA Balcarce (analisis_cria.md). */
export function BullRatioWidget({ instance }: WidgetRenderProps) {
	const d = BULL_RATIO;
	const inRange = d.ratio >= d.refMin && d.ratio <= d.refMax;

	return (
		<KpiCard
			label={instance.title ?? 'Relación toro:vientre'}
			status={
				<StatusPill
					tone={inRange ? 'ok' : 'bad'}
					label={inRange ? 'En rango' : 'Fuera de rango'}
				/>
			}
			value={formatNumber(d.ratio, 1)}
			unit="%"
			visual={
				<ReferenceBar
					value={d.ratio}
					min={0}
					max={10}
					minLabel="0 %"
					maxLabel="10 %"
					band={{ from: d.refMin, to: d.refMax, label: `rango ${d.refMin}–${d.refMax} %` }}
					ariaLabel={`${formatPercent(d.ratio)}, rango de referencia ${d.refMin} a ${d.refMax} %`}
				/>
			}
			context={`${d.bulls} toros para ${d.females} vientres en servicio · ${d.apt} aptos, ${d.toReview} a revisar`}
			footnote="Rango de referencia: INTA Balcarce"
		/>
	);
}
