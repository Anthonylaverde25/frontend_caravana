import { useMemo } from 'react';
import ReactEcharts from 'echarts-for-react';
import { Box, useTheme } from '@mui/material';
import { HerdSexBreakdown } from '../types/herdGraph.types';
import { formatNumber, formatPercent } from '../../../theme/formatters';

export type ChartDisplayMode = 'combo' | 'bar' | 'area';

interface SexVolumeBarAreaChartProps {
	data: HerdSexBreakdown;
	totalHerdHeads: number;
	accentColor: string;
	mode?: ChartDisplayMode;
	height?: number;
}

export function SexVolumeBarAreaChart({
	data,
	totalHerdHeads,
	accentColor,
	mode = 'combo',
	height = 270
}: SexVolumeBarAreaChartProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	const textColor = isDark ? '#E5E7EB' : '#1F2937';
	const mutedColor = isDark ? '#9CA3AF' : '#6B7280';
	const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

	const chartOption = useMemo(() => {
		const categories = data.categories;
		const categoryNames = categories.map((c) => c.label);
		const values = categories.map((c) => c.heads);

		const showBar = mode === 'combo' || mode === 'bar';
		const showArea = mode === 'combo' || mode === 'area';

		const series: any[] = [];

		if (showBar) {
			series.push({
				name: 'Cabezas',
				type: 'bar',
				barMaxWidth: 44,
				data: categories.map((cat) => ({
					value: cat.heads,
					itemStyle: {
						color: {
							type: 'linear',
							x: 0,
							y: 0,
							x2: 0,
							y2: 1,
							colorStops: [
								{ offset: 0, color: cat.color || accentColor },
								{ offset: 1, color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }
							]
						},
						borderRadius: [6, 6, 0, 0],
						borderColor: cat.color || accentColor,
						borderWidth: 1.5
					}
				})),
				label: {
					show: true,
					position: 'top',
					formatter: (params: any) => formatNumber(params.value),
					color: textColor,
					fontSize: 12,
					fontWeight: 700,
					distance: 6
				},
				z: 2
			});
		}

		if (showArea) {
			series.push({
				name: 'Masa y Contorno',
				type: 'line',
				smooth: true,
				data: values,
				symbol: 'circle',
				symbolSize: 8,
				itemStyle: {
					color: accentColor,
					borderColor: isDark ? '#1F2937' : '#FFFFFF',
					borderWidth: 2
				},
				lineStyle: {
					color: accentColor,
					width: 3,
					shadowColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
					shadowBlur: 4
				},
				areaStyle: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{
								offset: 0,
								color: accentColor === '#059669' ? 'rgba(5, 150, 105, 0.40)' : 'rgba(37, 99, 235, 0.40)'
							},
							{
								offset: 1,
								color: accentColor === '#059669' ? 'rgba(5, 150, 105, 0.02)' : 'rgba(37, 99, 235, 0.02)'
							}
						]
					}
				},
				label: {
					show: !showBar, // Only show top numbers if bars are hidden
					position: 'top',
					formatter: (params: any) => formatNumber(params.value),
					color: textColor,
					fontSize: 12,
					fontWeight: 700
				},
				z: 1
			});
		}

		return {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					crossStyle: { color: mutedColor },
					lineStyle: { color: mutedColor, type: 'dashed' }
				},
				backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
				borderColor: isDark ? '#374151' : '#E5E7EB',
				textStyle: { color: textColor },
				formatter: (params: any) => {
					if (!params || !params.length) return '';
					const idx = params[0].dataIndex;
					const cat = categories[idx];
					if (!cat) return '';

					return `
						<div style="font-family: inherit; padding: 4px 6px;">
							<div style="font-size: 13px; font-weight: 700; color: ${textColor}; margin-bottom: 4px;">
								${cat.label}
							</div>
							<div style="font-size: 14px; font-weight: 800; color: ${accentColor};">
								${formatNumber(cat.heads)} <span style="font-size: 11px; font-weight: 500; color: ${mutedColor};">cabezas</span>
							</div>
							<div style="margin-top: 6px; font-size: 11px; color: ${mutedColor}; line-height: 1.4;">
								<div>• Proporción en ${data.sex === 'H' ? 'Hembras' : 'Machos'}: <strong>${formatPercent(cat.pctOfSex, 1)}</strong></div>
								<div>• Proporción en Rodeo Total: <strong>${formatPercent(cat.pctOfTotal, 1)}</strong></div>
							</div>
						</div>
					`;
				}
			},
			grid: {
				top: 36,
				left: 48,
				right: 24,
				bottom: 38,
				containLabel: false
			},
			xAxis: {
				type: 'category',
				data: categoryNames,
				axisLine: { lineStyle: { color: mutedColor } },
				axisTick: { alignWithLabel: true },
				axisLabel: {
					color: textColor,
					fontSize: 11,
					fontWeight: 600,
					interval: 0,
					formatter: (value: string) => {
						// Split long words or show clean 2 lines if needed
						return value.length > 12 ? value.slice(0, 10) + '…' : value;
					}
				}
			},
			yAxis: {
				type: 'value',
				splitLine: { lineStyle: { color: gridColor } },
				axisLabel: {
					color: mutedColor,
					fontSize: 10,
					fontWeight: 600,
					formatter: (val: number) => val.toLocaleString('es-AR')
				}
			},
			series
		};
	}, [data, totalHerdHeads, accentColor, mode, isDark, textColor, mutedColor, gridColor]);

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
