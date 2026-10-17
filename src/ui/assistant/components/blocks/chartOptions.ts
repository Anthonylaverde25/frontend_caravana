import type { ChartBlock, TableCell } from '@/core/assistant/domain/AssistantTypes';
import { DASHBOARD_COLORS } from '@/ui/dashboard/theme/dashboardTokens';

/**
 * Builds the ECharts option for a chart block. It only arranges the rows the backend attached; it
 * never aggregates or derives a value, so what is drawn is exactly what the API returned.
 */

const PALETTE = [
	DASHBOARD_COLORS.accent,
	DASHBOARD_COLORS.ochre,
	DASHBOARD_COLORS.info,
	DASHBOARD_COLORS.accentMid,
	DASHBOARD_COLORS.neutralDark,
	DASHBOARD_COLORS.danger
];

/** Readable names for series values the backend uses as codes. */
const SERIES_LABELS: Record<string, string> = {
	pesada: 'Pesada',
	composicion: 'Cambio de composición'
};

/** Series that are not a measurement (animals entering or leaving): loose markers, never a trend line. */
const COMPOSITION_SERIES = new Set(['composicion']);

interface ChartTheme {
	text: string;
	muted: string;
	grid: string;
	compact: boolean;
}

const numberOrNull = (value: TableCell | undefined): number | null => (typeof value === 'number' ? value : null);
const labelOf = (value: TableCell | undefined): string =>
	value === null || value === undefined || value === '' ? 'Sin dato' : String(value);

/** True when there is at least one number to draw; otherwise the view shows a fallback. */
export function hasDrawableData(block: ChartBlock): boolean {
	return block.rows.some((row) => block.y.some((key) => typeof row[key] === 'number'));
}

interface Series {
	name: string;
	code: string;
	values: Map<string, number | null>;
}

function buildSeries(block: ChartBlock): Series[] {
	if (block.series_by) {
		const byCode = new Map<string, Series>();

		block.rows.forEach((row) => {
			const code = labelOf(row[block.series_by as string]);
			const series = byCode.get(code) ?? { name: SERIES_LABELS[code] ?? code, code, values: new Map() };
			series.values.set(labelOf(row[block.x]), numberOrNull(row[block.y[0]]));
			byCode.set(code, series);
		});

		return [...byCode.values()];
	}

	return block.y.map((key) => ({
		name: key === block.y[0] && block.y_label ? block.y_label : key,
		code: key,
		values: new Map(block.rows.map((row) => [labelOf(row[block.x]), numberOrNull(row[key])]))
	}));
}

export function buildChartOption(block: ChartBlock, theme: ChartTheme): Record<string, unknown> {
	const axisText = { color: theme.muted, fontSize: theme.compact ? 10 : 11 };
	const tooltipUnit = block.unit ? ` ${block.unit}` : '';
	const base = {
		color: PALETTE,
		textStyle: { color: theme.text },
		tooltip: {
			trigger: block.kind === 'pie' || block.kind === 'scatter' ? 'item' : 'axis',
			valueFormatter: (v: unknown) => `${v ?? '—'}${tooltipUnit}`
		},
		animationDuration: 300
	};

	if (block.kind === 'pie') {
		return {
			...base,
			legend: { bottom: 0, type: 'scroll', textStyle: axisText },
			series: [
				{
					type: 'pie',
					radius: ['45%', '72%'],
					center: ['50%', '45%'],
					label: { show: !theme.compact, color: theme.text, formatter: '{b}: {d}%' },
					data: block.rows.map((row) => ({
						name: labelOf(row[block.x]),
						value: numberOrNull(row[block.y[0]])
					}))
				}
			]
		};
	}

	const grid = { left: 8, right: 16, top: 24, bottom: 8, containLabel: true };

	if (block.kind === 'scatter') {
		return {
			...base,
			grid,
			xAxis: {
				type: 'value',
				name: block.x_label ?? '',
				nameLocation: 'middle',
				nameGap: 26,
				axisLabel: axisText,
				splitLine: { lineStyle: { color: theme.grid } }
			},
			yAxis: {
				type: 'value',
				name: block.y_label ?? '',
				axisLabel: axisText,
				splitLine: { lineStyle: { color: theme.grid } }
			},
			series: block.y.map((key) => ({
				type: 'scatter',
				name: key,
				symbolSize: theme.compact ? 6 : 8,
				data: block.rows.map((row) => [numberOrNull(row[block.x]), numberOrNull(row[key])])
			}))
		};
	}

	const categories = [...new Set(block.rows.map((row) => labelOf(row[block.x])))];
	const series = buildSeries(block);
	const rotate = theme.compact && categories.length > 5 ? 35 : categories.length > 10 ? 30 : 0;
	const isLine = block.kind === 'line';

	return {
		...base,
		grid: { ...grid, top: series.length > 1 ? 34 : 24 },
		legend: series.length > 1 ? { top: 0, textStyle: axisText } : undefined,
		xAxis: {
			type: 'category',
			data: categories,
			axisLabel: { ...axisText, rotate, hideOverlap: true },
			axisTick: { alignWithLabel: true }
		},
		yAxis: {
			type: 'value',
			scale: isLine,
			name: block.unit ?? '',
			nameTextStyle: axisText,
			axisLabel: axisText,
			splitLine: { lineStyle: { color: theme.grid } }
		},
		series: series.map((s) => {
			const composition = COMPOSITION_SERIES.has(s.code);

			return {
				type: isLine && composition ? 'scatter' : isLine ? 'line' : 'bar',
				name: s.name,
				data: categories.map((category) => s.values.get(category) ?? null),
				connectNulls: isLine,
				smooth: false,
				symbolSize: isLine ? 7 : undefined,
				symbol: isLine && composition ? 'diamond' : undefined,
				barCategoryGap: block.kind === 'histogram' ? '4%' : undefined,
				itemStyle: block.kind === 'histogram' ? { borderRadius: [2, 2, 0, 0] } : undefined
			};
		})
	};
}
