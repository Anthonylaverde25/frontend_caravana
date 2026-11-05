import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, useTheme } from '@mui/material';
import { CategoryWeightItem } from '../hooks/useCategoryWeightsData';
import { formatNumber } from '../../../theme/formatters';

export type CategoryWeightPlotMode = 'average' | 'biomass';
export type CategoryWeightChartStyle = 'bar' | 'area';

interface CategoryWeightAreaPiecesPlotProps {
	categories: CategoryWeightItem[];
	mode?: CategoryWeightPlotMode;
	chartStyle?: CategoryWeightChartStyle;
	height?: number | string;
}

export function CategoryWeightAreaPiecesPlot({
	categories,
	mode = 'average',
	chartStyle = 'bar',
	height = 380
}: CategoryWeightAreaPiecesPlotProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const { primary, secondary } = theme.palette.text;
	const hairline = theme.palette.divider;
	const surface = theme.palette.background.paper;

	const option = useMemo(() => {
		const names = categories.map((c) => c.name);
		const avgWeights = categories.map((c) => c.avgWeight);
		const totalBiomass = categories.map((c) => c.totalBiomass);

		const isAverage = mode === 'average';
		const isBar = chartStyle === 'bar';

		// Tooltip formatter showing complete animal zootechnical context
		const tooltipFormatter = (params: any) => {
			const index = params[0]?.dataIndex ?? 0;
			const cat = categories[index];
			if (!cat) return '';

			const isZero = isAverage ? cat.avgWeight === 0 : cat.totalBiomass === 0;

			return `
				<div style="font-family: inherit; font-size: 12px; min-width: 190px; color: ${primary}">
					<div style="font-weight: 700; font-size: 13px; margin-bottom: 4px; border-bottom: 1px solid ${hairline}; padding-bottom: 4px;">
						${cat.name}
					</div>
					<div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 4px;">
						<span style="color: ${secondary}">Peso Promedio:</span>
						<strong style="color: ${primary}">${isZero ? 'Sin registros' : `${formatNumber(cat.avgWeight)} kg/cab`}</strong>
					</div>
					<div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 2px;">
						<span style="color: ${secondary}">Biomasa Total:</span>
						<strong style="color: ${primary}">${formatNumber(cat.totalBiomass)} kg</strong>
					</div>
					<div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 2px;">
						<span style="color: ${secondary}">Cobertura:</span>
						<span style="color: ${secondary}">${cat.weighedCount} de ${cat.headCount} cab. (${cat.coveragePct}%)</span>
					</div>
					${
						cat.minWeight > 0 && cat.maxWeight > 0
							? `<div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 2px;">
									<span style="color: ${secondary}">Rango (Mín - Máx):</span>
									<span style="color: ${secondary}">${cat.minWeight} - ${cat.maxWeight} kg</span>
							   </div>`
							: ''
					}
				</div>
			`;
		};

		// 1. Average Weight (kg/head) - Apache ECharts Piecewise (Bar or Area)
		if (isAverage) {
			return {
				animationDuration: 750,
				grid: {
					top: 32,
					left: 16,
					right: 20,
					bottom: 50,
					containLabel: true
				},
				tooltip: {
					trigger: 'axis',
					backgroundColor: surface,
					borderColor: hairline,
					borderWidth: 1,
					textStyle: { color: primary },
					formatter: tooltipFormatter
				},
				xAxis: {
					type: 'category',
					boundaryGap: isBar,
					data: names,
					axisLine: { lineStyle: { color: hairline } },
					axisLabel: {
						color: secondary,
						fontSize: 11,
						interval: 0,
						rotate: names.length > 5 ? 20 : 0
					}
				},
				yAxis: {
					type: 'value',
					boundaryGap: [0, '25%'],
					splitLine: { lineStyle: { color: hairline, type: 'dashed' } },
					axisLabel: {
						color: secondary,
						fontSize: 11,
						formatter: '{value} kg'
					}
				},
				visualMap: {
					type: 'piecewise',
					show: true,
					dimension: 1, // Y-axis pieces (Kilograms)
					orient: 'horizontal',
					left: 'center',
					bottom: 0,
					itemWidth: 12,
					itemHeight: 12,
					itemGap: 10,
					textStyle: { color: secondary, fontSize: 10.5 },
					pieces: [
						{ lte: 180, color: '#38BDF8', label: 'Destete (< 180)' },
						{ gt: 180, lte: 280, color: '#10B981', label: 'Recría (180 - 280)' },
						{ gt: 280, lte: 380, color: '#F59E0B', label: 'Entore (280 - 380)' },
						{ gt: 380, lte: 500, color: '#2563EB', label: 'Adultos (380 - 500)' },
						{ gt: 500, color: '#7C3AED', label: 'Toros (> 500)' }
					],
					outOfRange: { color: '#9CA3AF' }
				},
				series: [
					isBar
						? {
								name: 'Kilogramos Promedio',
								type: 'bar',
								barMaxWidth: 46,
								itemStyle: {
									borderRadius: [6, 6, 0, 0]
								},
								label: {
									show: true,
									position: 'top',
									color: primary,
									fontWeight: 600,
									fontSize: 11,
									formatter: (p: any) => (p.value > 0 ? `${p.value} kg` : '')
								},
								markLine: {
									silent: true,
									lineStyle: { type: 'dashed', color: secondary, width: 1 },
									data: [{ type: 'average', name: 'Media' }]
								},
								data: avgWeights
						  }
						: {
								name: 'Kilogramos Promedio',
								type: 'line',
								smooth: 0.45,
								symbol: 'circle',
								symbolSize: 7,
								lineStyle: { width: 3 },
								areaStyle: {
									opacity: isDark ? 0.45 : 0.6
								},
								markPoint: {
									symbolSize: 38,
									label: { fontSize: 9.5, fontWeight: 700 },
									data: [
										{ type: 'max', name: 'Máx' },
										{ type: 'min', name: 'Mín' }
									]
								},
								data: avgWeights
						  }
				]
			};
		}

		// 2. Total Biomass (kg in herd)
		return {
			animationDuration: 750,
			grid: {
				top: 32,
				left: 16,
				right: 20,
				bottom: 50,
				containLabel: true
			},
			tooltip: {
				trigger: 'axis',
				backgroundColor: surface,
				borderColor: hairline,
				borderWidth: 1,
				textStyle: { color: primary },
				formatter: tooltipFormatter
			},
			xAxis: {
				type: 'category',
				boundaryGap: isBar,
				data: names,
				axisLine: { lineStyle: { color: hairline } },
				axisLabel: {
					color: secondary,
					fontSize: 11,
					interval: 0,
					rotate: names.length > 5 ? 20 : 0
				}
			},
			yAxis: {
				type: 'value',
				boundaryGap: [0, '25%'],
				splitLine: { lineStyle: { color: hairline, type: 'dashed' } },
				axisLabel: {
					color: secondary,
					fontSize: 11,
					formatter: (val: number) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`)
				}
			},
			visualMap: {
				type: 'piecewise',
				show: true,
				dimension: 1,
				orient: 'horizontal',
				left: 'center',
				bottom: 0,
				itemWidth: 12,
				itemHeight: 12,
				itemGap: 10,
				textStyle: { color: secondary, fontSize: 10.5 },
				pieces: [
					{ lte: 5000, color: '#93C5FD', label: '< 5.000 kg' },
					{ gt: 5000, lte: 15000, color: '#3B82F6', label: '5.000 - 15.000' },
					{ gt: 15000, lte: 35000, color: '#1D4ED8', label: '15.000 - 35.000' },
					{ gt: 35000, color: '#1E3A8A', label: '> 35.000 kg' }
				],
				outOfRange: { color: '#9CA3AF' }
			},
			series: [
				isBar
					? {
							name: 'Biomasa Total',
							type: 'bar',
							barMaxWidth: 46,
							itemStyle: {
								borderRadius: [6, 6, 0, 0]
							},
							label: {
								show: true,
								position: 'top',
								color: primary,
								fontWeight: 600,
								fontSize: 11,
								formatter: (p: any) =>
									p.value >= 1000 ? `${(p.value / 1000).toFixed(1)}k kg` : `${p.value} kg`
							},
							data: totalBiomass
					  }
					: {
							name: 'Biomasa Total',
							type: 'line',
							smooth: 0.45,
							symbol: 'circle',
							symbolSize: 7,
							lineStyle: { width: 3 },
							areaStyle: {
								opacity: isDark ? 0.45 : 0.6
							},
							data: totalBiomass
					  }
			]
		};
	}, [categories, mode, chartStyle, isDark, primary, secondary, hairline, surface]);

	return (
		<Box sx={{ width: '100%', height }}>
			<ReactECharts
				option={option}
				style={{ height: '100%', width: '100%' }}
				opts={{ renderer: 'svg' }}
				notMerge
			/>
		</Box>
	);
}
