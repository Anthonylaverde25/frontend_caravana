import { Box, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { StatusPill } from '../../components/primitives/StatusPill';
import { DivergingRows, RangeRows } from '../../components/primitives/RangeRows';
import { ThresholdHistogram } from '../../components/charts/ThresholdHistogram';
import { WeightCompositionChart } from '../../components/charts/WeightCompositionChart';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber, formatSigned } from '../../theme/formatters';
import {
	SUBCATEGORY_OPTIONS,
	WEIGHT_CHANGE_BREAKDOWN,
	WEIGHT_CURVE,
	WEIGHT_DISPERSION,
	WEIGHT_VS_TARGET
} from '../../mocks/weightsMocks';

function LegendLine({ label, dashed, color }: { label: string; dashed?: boolean; color: string }) {
	return (
		<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
			<Box sx={{ width: 22, borderTop: `${dashed ? 2 : 2.5}px ${dashed ? 'dashed' : 'solid'} ${color}` }} />
			{label}
		</Box>
	);
}

/** batch_weights series: CONTROL joined by solid lines, MOVEMENT_IN/OUT drawn as vertical composition steps. */
export function WeightCurveWidget({ instance }: WidgetRenderProps) {
	const d = WEIGHT_CURVE;

	return (
		<WidgetCard
			title={instance.title ?? `${d.batchName} · peso promedio del lote`}
			subtitle="Cada punto es un pesaje. Un cambio de animales en el lote se dibuja aparte, porque mueve el promedio sin que ningún animal haya ganado o perdido peso."
		>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, fontSize: '0.75rem', color: 'text.secondary' }}>
				<LegendLine
					label="Crecimiento medido"
					color={DASHBOARD_COLORS.accent}
				/>
				<LegendLine
					label="Sin medición"
					color={DASHBOARD_COLORS.neutralDark}
					dashed
				/>
				<LegendLine
					label="Efecto de composición"
					color={DASHBOARD_COLORS.ochreLine}
					dashed
				/>
			</Box>
			<WeightCompositionChart
				points={d.points}
				totalDays={d.totalDays}
				yMin={160}
				yMax={250}
				yTicks={[160, 180, 200, 220, 240]}
				ariaLabel={`Peso promedio de ${d.points[0].average} a ${d.points[d.points.length - 1].average} kilos; el 12/07 ingresan 16 terneras y el promedio baja 5 kilos por composición`}
			/>
		</WidgetCard>
	);
}

export function WeightChangeBreakdownWidget({ instance }: WidgetRenderProps) {
	const d = WEIGHT_CHANGE_BREAKDOWN;

	return (
		<WidgetCard
			title={instance.title ?? '¿Por qué cambió el promedio?'}
			subtitle={`${d.batchName} · del ${d.from} (${d.fromAverage} kg) al ${d.to} (${d.toAverage} kg)`}
			footnote="Los kilos se suman al repartir animales; el promedio no."
		>
			<Box sx={{ p: 1.75, borderRadius: '8px', bgcolor: 'action.hover' }}>
				<Typography
					sx={{
						fontSize: '0.75rem',
						fontWeight: 600,
						letterSpacing: '0.06em',
						textTransform: 'uppercase',
						color: 'text.secondary'
					}}
				>
					Variación neta del promedio
				</Typography>
				<Typography sx={{ fontSize: '2rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
					{`${formatSigned(d.net, 0)} `}
					<Box
						component="span"
						sx={{ fontSize: '1rem', fontWeight: 500, color: 'text.secondary' }}
					>
						kg por cabeza
					</Box>
				</Typography>
			</Box>
			<DivergingRows
				halfScale={40}
				items={[
					{
						label: 'Crecimiento real',
						value: d.realGrowth,
						display: `${formatSigned(d.realGrowth, 0)} kg`,
						caption: 'Los mismos animales, pesados en dos fechas',
						favorable: true
					},
					{
						label: 'Efecto de composición',
						value: d.composition,
						display: `${formatSigned(d.composition, 0)} kg`,
						caption: d.compositionCaption,
						favorable: false
					}
				]}
			/>
			<Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
				Kilos totales del lote:{' '}
				<strong>{`${formatNumber(d.totalKgFrom)} → ${formatNumber(d.totalKgTo)} kg`}</strong>
			</Typography>
		</WidgetCard>
	);
}

export function WeightDispersionWidget({ instance }: WidgetRenderProps) {
	return (
		<WidgetCard
			title={instance.title ?? 'Dispersión dentro del lote'}
			subtitle="Punto = promedio · franja = mínimo a máximo. Una franja ancha pide re-lotear."
		>
			<RangeRows
				rows={WEIGHT_DISPERSION}
				domainMin={180}
				domainMax={360}
				unit="kg"
			/>
		</WidgetCard>
	);
}

/** Histogram of current weights for a subcategory against its catalog target weight. */
export function WeightVsTargetWidget({ instance }: WidgetRenderProps) {
	const d = WEIGHT_VS_TARGET;
	const subcategory =
		SUBCATEGORY_OPTIONS.find((o) => o.value === instance.config?.subcategory) ?? SUBCATEGORY_OPTIONS[0];
	const share = Math.round((d.reached / d.total) * 100);

	return (
		<WidgetCard
			title={instance.title ?? 'Peso contra el objetivo de la subcategoría'}
			subtitle={`${subcategory.label} · ${subcategory.helper ?? ''}`}
		>
			<ThresholdHistogram
				bins={d.bins}
				thresholdIndex={d.thresholdIndex}
				thresholdLabel={d.targetLabel}
				ariaLabel={`Distribución de peso de ${d.total} animales; ${d.reached} alcanzan el objetivo`}
			/>
			<Box
				sx={{
					pt: 1.5,
					borderTop: 1,
					borderColor: 'divider',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					gap: 1
				}}
			>
				<Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
					Alcanzan el objetivo <strong>{`${d.reached} de ${d.total} (${share} %)`}</strong>
					{` · faltan ${d.total - d.reached}`}
				</Typography>
				<StatusPill
					tone={share >= 80 ? 'ok' : 'warn'}
					label={share >= 80 ? 'Mayoría en objetivo' : 'Revisar alimentación'}
				/>
			</Box>
		</WidgetCard>
	);
}
