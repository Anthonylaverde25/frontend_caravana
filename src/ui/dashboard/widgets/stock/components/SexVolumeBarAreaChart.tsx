import { useMemo } from 'react';
import ReactEcharts from 'echarts-for-react';
import { Box, useTheme } from '@mui/material';
import { HerdSexBreakdown } from '../types/herdGraph.types';
import { formatNumber, formatPercent } from '../../../theme/formatters';

export type ChartDisplayMode = 'bar' | 'combo' | 'area';

interface SexVolumeBarAreaChartProps {
	data: HerdSexBreakdown;
	totalHerdHeads: number;
	accentColor: string;
	mode?: ChartDisplayMode;
	height?: number;
}

/**
 * Professional, minimalist categorical bar chart for herd demography.
 * Eliminates artificial AI spline curves and neon gradients in favor of clean proportions,
 * subtle background tracks, and executive tabular figures.
 */
export function SexVolumeBarAreaChart({
	data,
	totalHerdHeads,
	accentColor,
	height = 280
}: SexVolumeBarAreaChartProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	const textColor = isDark ? '#E5E7EB' : '#1F2937';
	const mutedColor = isDark ? '#9CA3AF' : '#6B7280';
	const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
	const trackColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.025)';
	const tooltipBg = isDark ? '#1E293B' : '#FFFFFF';
	const tooltipBorder = isDark ? '#334155' : '#E2E8F0';

	const chartOption = useMemo(() => {
		const categories = data.categories;
		const categoryNames = categories.map((c) => c.label);

		const series: any[] = [
			{
				name: 'Cabezas',
				type: 'bar',
				barMaxWidth: 38,
				showBackground: true,
				backgroundStyle: {
					color: trackColor,
					borderRadius: [4, 4, 0, 0]
				},
				data: categories.map((cat) => ({
					value: cat.heads,
					itemStyle: {
						color: cat.color || accentColor,
						borderRadius: [4, 4, 0, 0]
					}
				})),
				label: {
					show: true,
					position: 'top',
					formatter: (params: any) => formatNumber(params.value),
					color: textColor,
					fontSize: 12,
					fontWeight: 600,
					distance: 8
				}
			}
		];

		return {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow',
					shadowStyle: {
						color: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'
					}
				},
				backgroundColor: tooltipBg,
				borderColor: tooltipBorder,
				borderWidth: 1,
				padding: [10, 14],
				extraCssText: 'box-shadow: 0 4px 20px rgba(0,0,0,0.08); border-radius: 8px;',
				formatter: (params: any) => {
					if (!params || !params.length) return '';
					const idx = params[0].dataIndex;
					const cat = categories[idx];
					if (!cat) return '';

					return `
						<div style="font-family: inherit;">
							<div style="font-size: 13px; font-weight: 600; color: ${textColor}; margin-bottom: 4px;">
								${cat.label}
							</div>
							<div style="font-size: 18px; font-weight: 700; color: ${cat.color || accentColor}; font-variant-numeric: tabular-nums;">
								${formatNumber(cat.heads)} <span style="font-size: 12px; font-weight: 500; color: ${mutedColor};">cabezas</span>
							</div>
							<div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9'}; font-size: 11px; color: ${mutedColor}; line-height: 1.6;">
								<div>• Proporción en ${data.sex === 'H' ? 'Hembras' : 'Machos'}: <strong style="color: ${textColor};">${formatPercent(cat.pctOfSex, 1)}</strong></div>
								<div>• Proporción en Rodeo General: <strong style="color: ${textColor};">${formatPercent(cat.pctOfTotal, 1)}</strong></div>
							</div>
						</div>
					`;
				}
			},
			grid: {
				top: 36,
				left: 42,
				right: 20,
				bottom: 34,
				containLabel: false
			},
			xAxis: {
				type: 'category',
				data: categoryNames,
				axisLine: { lineStyle: { color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } },
				axisTick: { show: false },
				axisLabel: {
					color: textColor,
					fontSize: 11,
					fontWeight: 500,
					interval: 0
				}
			},
			yAxis: {
				type: 'value',
				splitLine: { lineStyle: { color: gridColor } },
				axisLabel: {
					color: mutedColor,
					fontSize: 10,
					fontWeight: 500,
					formatter: (val: number) => val.toLocaleString('es-AR')
				}
			},
			series
		};
	}, [data, accentColor, isDark, textColor, mutedColor, gridColor, trackColor, tooltipBg, tooltipBorder]);

	return (
		<Box sx={{ width: '100%', height, minHeight: height, position: 'relative' }}>
			<ReactEcharts
				option={chartOption}
				style={{ height: '100%', width: '100%' }}
				notMerge
				lazyUpdate
			/>
		</Box>
	);
}

export default SexVolumeBarAreaChart;
