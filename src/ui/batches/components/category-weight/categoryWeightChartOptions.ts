import type { Theme } from '@mui/material/styles';
import { CategoryCurve, dayToTime, formatDay, formatWeight, massAsOf, pointAsOf } from './categoryWeightModel';

const DAY_MS = 24 * 60 * 60 * 1000;
/** A lone weighing still needs a span of time around it to read as a date. */
const MIN_SPAN_MS = 28 * DAY_MS;
/** Below this span the ticks read as days; above it, as months. */
const MONTH_TICKS_FROM_MS = 60 * DAY_MS;
/** Above this many lines, end labels no longer help: the values stay beside the chart. */
const MAX_DIRECT_LABELS = 4;
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** The series that draws the mark of a day picked outside the chart. */
export const DAY_MARKER_SERIES_ID = 'day-marker';

/** The day of the axis closest to a time: the pointer travels between weighings. */
export function nearestDay(days: string[], time: number): string | null {
	return days.reduce<string | null>(
		(closest, day) =>
			closest === null || Math.abs(dayToTime(day) - time) < Math.abs(dayToTime(closest) - time) ? day : closest,
		null
	);
}

function tooltipRows(curves: CategoryCurve[], day: string, theme: Theme): string {
	const { primary, secondary } = theme.palette.text;
	const standing = curves
		.map((curve) => ({ curve, point: pointAsOf(curve, day) }))
		.filter((row) => row.point !== null)
		.sort((a, b) => b.point!.average_weight - a.point!.average_weight);

	const rows = standing
		.map(({ curve, point }) => {
			const stale = point!.weighing_date !== day ? ` · peso del ${formatDay(point!.weighing_date)}` : '';

			return `<div style="display:grid;grid-template-columns:12px 1fr auto;column-gap:8px;align-items:baseline;margin-top:8px">
				<span style="width:12px;height:3px;border-radius:2px;background:${curve.color};align-self:center"></span>
				<span style="color:${primary};font-weight:500">${curve.name}</span>
				<span style="color:${primary};font-weight:600;margin-left:16px">${formatWeight(point!.average_weight)} kg</span>
				<span></span>
				<span style="color:${secondary};font-size:11px;grid-column:2 / 4">${point!.weighed_count} de ${point!.head_count} pesadas${stale}</span>
			</div>`;
		})
		.join('');

	return `<div style="font-size:12px;min-width:200px;white-space:normal">
		<div style="color:${secondary};font-weight:500">${formatDay(day)}</div>
		${rows}
		<div style="display:flex;justify-content:space-between;margin-top:10px;padding-top:8px;border-top:1px solid ${theme.palette.divider}">
			<span style="color:${secondary}">Kilos totales</span>
			<span style="color:${primary};font-weight:600">${formatWeight(massAsOf(curves, day), 0)} kg</span>
		</div>
	</div>`;
}

/**
 * One axis, one 2px line per category and the last value at the end of its line. The legend is not
 * here: it is HTML beside the plot, so it can never take room from it. A stretch where the number of
 * animals weighed changed is dashed, since that move is not a gain. No second scale for the mass,
 * which is in the tooltip: two scales on one plot would suggest a relation their alignment made up.
 */
export function buildCategoryWeightOptions(
	curves: CategoryCurve[],
	days: string[],
	theme: Theme,
	focusKey: string | null = null
) {
	const { primary, secondary } = theme.palette.text;
	const hairline = theme.palette.divider;
	const surface = theme.palette.background.paper;
	const fontFamily = theme.typography.fontFamily;
	const direct = curves.length <= MAX_DIRECT_LABELS;
	const opacityOf = (curve: CategoryCurve) => (focusKey && focusKey !== curve.key ? 0.15 : 1);

	const times = days.map(dayToTime);
	const first = times[0];
	const last = times[times.length - 1];
	const span = Math.max(last - first, MIN_SPAN_MS);
	const pad = last === first ? span / 2 : span * 0.03;
	const min = first - pad;
	const max = last + pad;
	const showsMonths = span >= MONTH_TICKS_FROM_MS;
	const showsYear = span > 300 * DAY_MS;

	const lines = curves.flatMap((curve) =>
		curve.points.slice(1).map((point, index) => {
			const previous = curve.points[index];

			return {
				type: 'line',
				name: curve.name,
				silent: true,
				showSymbol: false,
				smooth: false,
				z: 2,
				lineStyle: {
					width: 2,
					color: curve.color,
					cap: 'round',
					opacity: opacityOf(curve),
					type: previous.weighed_count !== point.weighed_count ? [4, 5] : 'solid'
				},
				data: [
					[dayToTime(previous.weighing_date), previous.average_weight],
					[dayToTime(point.weighing_date), point.average_weight]
				]
			};
		})
	);

	const marks = curves.map((curve) => ({
		type: 'scatter',
		name: curve.name,
		symbolSize: 9,
		z: 3,
		itemStyle: { color: curve.color, borderColor: surface, borderWidth: 2, opacity: opacityOf(curve) },
		// Labels of lines that end close together move apart instead of printing over each other.
		labelLayout: { moveOverlap: 'shiftY' },
		data: curve.points.map((point, index) => ({
			value: [dayToTime(point.weighing_date), point.average_weight],
			...(direct && index === curve.points.length - 1
				? {
						label: {
							show: true,
							position: 'right',
							distance: 8,
							color: primary,
							opacity: opacityOf(curve),
							fontSize: 12,
							fontWeight: 600,
							fontFamily,
							formatter: formatWeight(point.average_weight)
						}
					}
				: {})
		}))
	}));

	return {
		aria: { enabled: true },
		animation: false,
		grid: { top: 8, right: direct ? 52 : 12, bottom: 2, left: 2, containLabel: true },
		tooltip: {
			trigger: 'axis',
			confine: true,
			backgroundColor: surface,
			borderColor: hairline,
			borderWidth: 1,
			padding: 12,
			extraCssText: 'box-shadow:0 4px 16px rgba(0,0,0,0.10);border-radius:8px;',
			axisPointer: { type: 'line', snap: true, lineStyle: { color: secondary, width: 1, type: 'solid' } },
			formatter: (params: { axisValue?: number; value?: [number, number] }[]) => {
				const time = params[0]?.axisValue ?? params[0]?.value?.[0] ?? first;

				return tooltipRows(curves, nearestDay(days, Number(time)) ?? days[0], theme);
			}
		},
		xAxis: {
			type: 'time',
			min,
			max,
			// Monthly at least: the time scale then lands its ticks on the first of each month.
			minInterval: showsMonths ? 28 * DAY_MS : DAY_MS,
			axisLine: { lineStyle: { color: hairline } },
			axisTick: { show: false },
			splitLine: { show: false },
			axisLabel: {
				color: secondary,
				fontSize: 11,
				hideOverlap: true,
				formatter: (value: number) => {
					const date = new Date(value);

					if (showsMonths) {
						// The ends of the axis are ticks too, and they are not months.
						if (date.getDate() !== 1) return '';

						return showsYear
							? `${MONTHS[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`
							: MONTHS[date.getMonth()];
					}

					return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
				}
			}
		},
		yAxis: {
			type: 'value',
			scale: true,
			splitNumber: 4,
			axisLine: { show: false },
			axisTick: { show: false },
			splitLine: { lineStyle: { color: hairline, width: 1, type: 'solid' } },
			axisLabel: { color: secondary, fontSize: 11, formatter: (value: number) => formatWeight(value, 0) }
		},
		series: [
			...lines,
			...marks,
			{
				id: DAY_MARKER_SERIES_ID,
				type: 'line',
				silent: true,
				data: [],
				markLine: {
					symbol: 'none',
					silent: true,
					animation: false,
					label: { show: false },
					lineStyle: { type: 'solid', color: secondary, width: 1 },
					data: []
				}
			}
		]
	};
}

function biomassStackedTooltipRows(curves: CategoryCurve[], day: string, theme: Theme): string {
	const { primary, secondary } = theme.palette.text;
	const hairline = theme.palette.divider;

	const categoryRows = curves
		.map((curve) => {
			const point = pointAsOf(curve, day);
			const kilos = point ? Math.round(point.average_weight * point.weighed_count) : 0;
			return { curve, point, kilos };
		})
		.filter((row) => row.kilos > 0 || (row.point && row.point.head_count > 0));

	const totalKilos = categoryRows.reduce((sum, row) => sum + row.kilos, 0);
	const totalWeighed = categoryRows.reduce((sum, row) => sum + (row.point?.weighed_count ?? 0), 0);
	const weightedAvg = totalWeighed > 0 ? totalKilos / totalWeighed : 0;

	// Heaviest category first
	const sorted = [...categoryRows].sort((a, b) => b.kilos - a.kilos);

	const rows = sorted
		.map(({ curve, point, kilos }) => {
			const pct = totalKilos > 0 ? ((kilos / totalKilos) * 100).toFixed(1) : '0.0';
			const stale = point && point.weighing_date !== day ? ` · peso del ${formatDay(point.weighing_date)}` : '';

			return `<div style="display:grid;grid-template-columns:12px 1fr auto;column-gap:8px;align-items:baseline;margin-top:8px">
				<span style="width:12px;height:12px;border-radius:3px;background:${curve.color};align-self:center"></span>
				<div>
					<span style="color:${primary};font-weight:600">${curve.name}</span>
					<span style="color:${secondary};font-size:11px;margin-left:6px">(${pct}%)</span>
				</div>
				<span style="color:${primary};font-weight:700">${formatWeight(kilos, 0)} kg</span>
				<span></span>
				<span style="color:${secondary};font-size:11px;grid-column:2 / 4">
					${point?.weighed_count ?? 0} cab. pesadas · prom. ${point ? formatWeight(point.average_weight, 1) : 0} kg/cab${stale}
				</span>
			</div>`;
		})
		.join('');

	return `<div style="font-size:12px;min-width:240px;max-width:320px;white-space:normal">
		<div style="display:flex;justify-content:space-between;align-items:center">
			<span style="color:${secondary};font-weight:600">${formatDay(day)}</span>
			<span style="color:${secondary};font-size:11px;font-weight:500">Biomasa Apilada</span>
		</div>
		${rows}
		<div style="margin-top:10px;padding-top:8px;border-top:1px solid ${hairline}">
			<div style="display:flex;justify-content:space-between">
				<span style="color:${secondary};font-weight:500">Biomasa total</span>
				<span style="color:${primary};font-weight:700">${formatWeight(totalKilos, 0)} kg</span>
			</div>
			<div style="display:flex;justify-content:space-between;margin-top:4px">
				<span style="color:${secondary};font-size:11px">Total pesadas (prom. ponderado)</span>
				<span style="color:${primary};font-size:11px;font-weight:600">${totalWeighed} cab. (${formatWeight(weightedAvg, 1)} kg/cab)</span>
			</div>
		</div>
	</div>`;
}

/**
 * Stacked Area Chart (Apache ECharts):
 * Plots biomass (total weight in kg) by category stacked over time.
 * The top silhouette represents the batch total live biomass.
 * Stacking kg is mathematically additive and sound (unlike stacking averages).
 */
export function buildCategoryBiomassStackedOptions(
	curves: CategoryCurve[],
	days: string[],
	theme: Theme,
	focusKey: string | null = null
) {
	const { secondary } = theme.palette.text;
	const hairline = theme.palette.divider;
	const surface = theme.palette.background.paper;
	const fontFamily = theme.typography.fontFamily;
	const opacityOf = (curve: CategoryCurve) => (focusKey && focusKey !== curve.key ? 0.15 : 1);

	const times = days.map(dayToTime);
	const first = times[0];
	const last = times[times.length - 1];
	const span = Math.max(last - first, MIN_SPAN_MS);
	const pad = last === first ? span / 2 : span * 0.03;
	const min = first - pad;
	const max = last + pad;
	const showsMonths = span >= MONTH_TICKS_FROM_MS;
	const showsYear = span > 300 * DAY_MS;

	const series = curves.map((curve) => {
		const curveOpacity = opacityOf(curve);
		return {
			name: curve.name,
			type: 'line',
			stack: 'TotalBiomass',
			silent: false,
			smooth: false,
			showSymbol: true,
			symbol: 'circle',
			symbolSize: 7,
			z: 2,
			lineStyle: {
				width: 1.5,
				color: curve.color,
				opacity: curveOpacity
			},
			itemStyle: {
				color: curve.color,
				borderColor: surface,
				borderWidth: 1.5,
				opacity: curveOpacity
			},
			areaStyle: {
				opacity: curveOpacity === 1 ? (theme.palette.mode === 'dark' ? 0.55 : 0.42) : 0.1,
				color: curve.color
			},
			emphasis: {
				focus: 'series'
			},
			data: days.map((day) => {
				const pt = pointAsOf(curve, day);
				const kilos = pt ? Math.round(pt.average_weight * pt.weighed_count) : 0;
				return [dayToTime(day), kilos];
			})
		};
	});

	return {
		aria: { enabled: true },
		animationDuration: 300,
		grid: { top: 16, right: 32, bottom: 4, left: 8, containLabel: true },
		tooltip: {
			trigger: 'axis',
			confine: true,
			backgroundColor: surface,
			borderColor: hairline,
			borderWidth: 1,
			padding: 12,
			extraCssText: 'box-shadow:0 4px 20px rgba(0,0,0,0.12);border-radius:8px;',
			axisPointer: {
				type: 'cross',
				label: {
					backgroundColor: theme.palette.mode === 'dark' ? '#334155' : '#64748b'
				},
				lineStyle: { color: secondary, width: 1, type: 'solid' }
			},
			formatter: (params: { axisValue?: number; value?: [number, number] }[]) => {
				const time = params[0]?.axisValue ?? params[0]?.value?.[0] ?? first;
				return biomassStackedTooltipRows(curves, nearestDay(days, Number(time)) ?? days[0], theme);
			}
		},
		xAxis: {
			type: 'time',
			min,
			max,
			minInterval: showsMonths ? 28 * DAY_MS : DAY_MS,
			axisLine: { lineStyle: { color: hairline } },
			axisTick: { show: false },
			splitLine: { show: false },
			axisLabel: {
				color: secondary,
				fontSize: 11,
				hideOverlap: true,
				formatter: (value: number) => {
					const date = new Date(value);
					if (showsMonths) {
						if (date.getDate() !== 1) return '';
						return showsYear
							? `${MONTHS[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`
							: MONTHS[date.getMonth()];
					}
					return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
				}
			}
		},
		yAxis: {
			type: 'value',
			scale: true,
			splitNumber: 4,
			axisLine: { show: false },
			axisTick: { show: false },
			splitLine: { lineStyle: { color: hairline, width: 1, type: 'solid' } },
			axisLabel: {
				color: secondary,
				fontSize: 11,
				formatter: (value: number) => `${formatWeight(value, 0)} kg`
			}
		},
		series: [
			...series,
			{
				id: DAY_MARKER_SERIES_ID,
				type: 'line',
				silent: true,
				data: [],
				markLine: {
					symbol: 'none',
					silent: true,
					animation: false,
					label: { show: false },
					lineStyle: { type: 'solid', color: secondary, width: 1 },
					data: []
				}
			}
		]
	};
}
