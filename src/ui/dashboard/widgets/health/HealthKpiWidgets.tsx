import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { Delta } from '../../components/primitives/Delta';
import { ReferenceBar } from '../../components/primitives/ReferenceBar';
import { StackedBar } from '../../components/primitives/StackedBar';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber, formatPercent, formatPp } from '../../theme/formatters';
import {
	ACTIVE_DIAGNOSES,
	BULL_APTITUDE,
	LAB_EXPECTED_DAYS,
	LAB_PENDING,
	MORTALITY,
	TURNAROUND
} from '../../mocks/healthMocks';

export function LabPendingWidget({ instance }: WidgetRenderProps) {
	const d = LAB_PENDING;

	return (
		<KpiCard
			label={instance.title ?? 'Laboratorio en espera'}
			status={
				<StatusPill
					tone={d.overdue > 0 ? 'bad' : 'ok'}
					label={d.overdue > 0 ? `${d.overdue} demorados` : 'En plazo'}
				/>
			}
			value={String(d.protocols)}
			unit="protocolos"
			visual={
				<StackedBar
					showLegend={false}
					segments={[
						{ label: 'Demorados', value: d.overdue, color: DASHBOARD_COLORS.danger },
						{ label: 'En plazo', value: d.onTime, color: DASHBOARD_COLORS.neutral }
					]}
				/>
			}
			context={`${d.samples} muestras sin resultado · ${d.overdue} con más de ${LAB_EXPECTED_DAYS} días, ${d.onTime} en plazo`}
			footnote={`Plazo esperado de resultado: ${LAB_EXPECTED_DAYS} días`}
		/>
	);
}

const APTITUDE_COLORS: Record<string, string> = {
	APT: DASHBOARD_COLORS.accent,
	UNFIT: DASHBOARD_COLORS.danger,
	IN_TREATMENT: DASHBOARD_COLORS.ochre,
	PENDING_EVALUATION: DASHBOARD_COLORS.neutral
};

export function BullAptitudeWidget({ instance }: WidgetRenderProps) {
	const d = BULL_APTITUDE;
	const apt = d.rows.find((r) => r.status === 'APT')?.value ?? 0;
	const toReview = d.total - apt;

	return (
		<KpiCard
			label={instance.title ?? 'Toros aptos'}
			status={
				<StatusPill
					tone={toReview > 0 ? 'warn' : 'ok'}
					label={toReview > 0 ? `${toReview} a revisar` : 'Todos aptos'}
				/>
			}
			value={String(apt)}
			unit={`de ${d.total}`}
			visual={
				<StackedBar
					segments={d.rows.map((r) => ({ label: r.label, value: r.value, color: APTITUDE_COLORS[r.status] }))}
				/>
			}
			context={`Estado de la última evaluación de cada toro activo`}
			footnote={`El próximo servicio comienza el ${d.nextServiceStart}`}
		/>
	);
}

export function ActiveDiagnosesWidget({ instance }: WidgetRenderProps) {
	const d = ACTIVE_DIAGNOSES;

	return (
		<KpiCard
			label={instance.title ?? 'Diagnósticos activos'}
			status={
				<StatusPill
					tone={d.disqualifying > 0 ? 'bad' : 'ok'}
					label={d.disqualifying > 0 ? `${d.disqualifying} descalificantes` : 'Sin descalificantes'}
				/>
			}
			value={String(d.total)}
			unit="casos abiertos"
			visual={
				<StackedBar
					showLegend={false}
					segments={[
						{ label: 'Positivo confirmado', value: d.confirmedPositive, color: DASHBOARD_COLORS.danger },
						{ label: 'En tratamiento', value: d.inTreatment, color: DASHBOARD_COLORS.ochre },
						{ label: 'Sospecha', value: d.suspected, color: DASHBOARD_COLORS.neutral }
					]}
				/>
			}
			context={`${d.confirmedPositive} positivos confirmados · ${d.inTreatment} en tratamiento · ${d.suspected} sospechas`}
			footnote="Un positivo descalificante saca al toro del servicio"
		/>
	);
}

/** Median, not mean: a few long delays would distort an average. */
export function TurnaroundWidget({ instance }: WidgetRenderProps) {
	const d = TURNAROUND;
	const onTime = d.medianDays <= LAB_EXPECTED_DAYS;

	return (
		<KpiCard
			label={instance.title ?? 'Tiempo hasta el resultado'}
			status={
				<StatusPill
					tone={onTime ? 'ok' : 'bad'}
					label={onTime ? 'Dentro del plazo' : 'Fuera de plazo'}
				/>
			}
			value={String(d.medianDays)}
			unit="días"
			visual={
				<ReferenceBar
					value={d.medianDays}
					min={0}
					max={45}
					minLabel="0"
					maxLabel="45 d"
					marker={{ value: LAB_EXPECTED_DAYS, label: `plazo ${LAB_EXPECTED_DAYS} d` }}
					ariaLabel={`mediana ${d.medianDays} días; plazo ${LAB_EXPECTED_DAYS}`}
				/>
			}
			context={`Mediana de ${d.samples} muestras con resultado · últimos 90 días`}
			footnote={`Derivadas: ${d.derivedDays} d · in situ: ${d.inSituDays} d`}
		/>
	);
}

/** Deaths = transfers into INTERNAL_DEATH batches, over the average stock of the period. */
export function MortalityWidget({ instance }: WidgetRenderProps) {
	const d = MORTALITY;
	const delta = d.rate - d.previousRate;
	const improved = delta <= 0;

	return (
		<KpiCard
			label={instance.title ?? 'Mortandad · 12 meses'}
			status={
				<StatusPill
					tone={improved ? 'ok' : 'bad'}
					trend={improved ? 'down' : 'up'}
					label={improved ? 'Bajó' : 'Subió'}
				/>
			}
			value={formatNumber(d.rate, 1)}
			unit="%"
			visual={
				<ReferenceBar
					value={d.rate}
					min={0}
					max={4}
					minLabel="0 %"
					maxLabel="4 %"
					marker={{ value: d.previousRate, label: `año anterior ${formatNumber(d.previousRate, 1)}` }}
					ariaLabel={`${formatPercent(d.rate)}; año anterior ${formatPercent(d.previousRate)}`}
				/>
			}
			context={
				<>
					{`${d.deaths} bajas sobre una existencia media de `}
					<strong>{`${formatNumber(d.averageStock)} cabezas`}</strong>
					{' · '}
					<Delta
						text={formatPp(delta)}
						favorable={improved}
					/>
				</>
			}
			footnote={`${d.period} · animales transferidos a lotes de bajas`}
		/>
	);
}
