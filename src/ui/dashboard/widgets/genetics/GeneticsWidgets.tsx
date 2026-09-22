import { WidgetRenderProps } from '../../types/dashboard.types';
import { KpiCard } from '../../components/primitives/KpiCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { StackedBar } from '../../components/primitives/StackedBar';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { HorizontalBarList } from '../../components/primitives/HorizontalBarList';
import { AlertList } from '../../components/primitives/AlertList';
import { Legend } from '../../components/primitives/StackedBar';
import { StackedColumnChart } from '../../components/charts/StackedColumnChart';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatPercent } from '../../theme/formatters';
import {
	ATTENTION_ITEMS,
	FIELD_RECORDS,
	PENDING_SIRES,
	PROGENY_BY_SIRE,
	SIRE_METHODS
} from '../../mocks/geneticsMocks';

/** caravan_lineages with father_id IS NULL; age = today − birth_date. */
export function PendingSiresKpiWidget({ instance }: WidgetRenderProps) {
	const d = PENDING_SIRES;

	return (
		<KpiCard
			label={instance.title ?? 'Padres sin asignar'}
			status={
				<StatusPill
					tone={d.older30d > 0 ? 'warn' : 'ok'}
					label={`Más antiguo: ${d.oldestDays} d`}
				/>
			}
			value={String(d.total)}
			unit="terneros"
			visual={
				<StackedBar
					segments={[
						{ label: '> 30 días', value: d.older30d, color: DASHBOARD_COLORS.ochre },
						{ label: '≤ 30 días', value: d.recent, color: DASHBOARD_COLORS.neutral }
					]}
				/>
			}
			context={`Sobre ${d.births} nacimientos de la campaña (${formatPercent((d.total / d.births) * 100)})`}
		/>
	);
}

const METHOD_COLORS = [DASHBOARD_COLORS.accent, DASHBOARD_COLORS.accentMid, DASHBOARD_COLORS.info];

export function SireMethodWidget({ instance }: WidgetRenderProps) {
	return (
		<KpiCard
			label={instance.title ?? 'Cómo se identificó al padre'}
			value={String(SIRE_METHODS.assigned)}
			unit="asignados"
			visual={
				<StackedBar
					segments={SIRE_METHODS.rows.map((r, i) => ({
						label: r.label,
						value: r.value,
						color: METHOD_COLORS[i]
					}))}
				/>
			}
			context="Da el nivel de confianza del pedigree del rodeo"
			footnote="Sólo el laboratorio confirma la paternidad"
		/>
	);
}

export function ProgenyBySireWidget({ instance }: WidgetRenderProps) {
	const total = PROGENY_BY_SIRE.reduce((acc, r) => acc + r.value, 0);

	return (
		<WidgetCard
			title={instance.title ?? 'Terneros por padre · campaña 2025/26'}
			subtitle={`${total} terneros con padre asignado. Ayuda a detectar toros que sirvieron poco.`}
			footnote="Un toro muy por debajo del resto de su lote se revisa junto con su evaluación andrológica"
		>
			<HorizontalBarList
				labelWidth={110}
				rows={PROGENY_BY_SIRE.map((r) => ({
					label: r.label,
					value: r.value,
					color: r.isRest ? DASHBOARD_COLORS.neutral : DASHBOARD_COLORS.accent
				}))}
			/>
		</WidgetCard>
	);
}

export function FieldRecordsWidget({ instance }: WidgetRenderProps) {
	const d = FIELD_RECORDS;

	return (
		<WidgetCard
			title={instance.title ?? 'Registros de campo por semana'}
			subtitle="Planillas procesadas en las jornadas de trabajo."
			actions={
				<Legend
					items={[
						{ label: 'Ingresos', color: DASHBOARD_COLORS.accent },
						{ label: 'Actualizaciones', color: DASHBOARD_COLORS.accentMid },
						{ label: 'Egresos', color: DASHBOARD_COLORS.ochre }
					]}
				/>
			}
		>
			<StackedColumnChart
				categories={d.weeks}
				series={[
					{ label: 'Ingresos', color: DASHBOARD_COLORS.accent, values: d.entry },
					{ label: 'Actualizaciones', color: DASHBOARD_COLORS.accentMid, values: d.update },
					{ label: 'Egresos', color: DASHBOARD_COLORS.ochre, values: d.exit }
				]}
				yMax={100}
				yTicks={[0, 40, 80]}
				showTotals
				ariaLabel="Registros de campo por semana, apilados por tipo de trabajo"
			/>
		</WidgetCard>
	);
}

/** Cross-board summary: every alert is derived from the state of another widget. */
export function AttentionWidget({ instance }: WidgetRenderProps) {
	return (
		<WidgetCard
			title={instance.title ?? 'Requiere atención'}
			actions={
				<StatusPill
					tone="neutral"
					label={String(ATTENTION_ITEMS.length)}
				/>
			}
			footnote="Orden: crítico → advertencia → programado"
		>
			<AlertList items={ATTENTION_ITEMS} />
		</WidgetCard>
	);
}
