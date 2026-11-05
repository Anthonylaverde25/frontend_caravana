import { useEffect, useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { CategoryCurve, dayToTime } from './categoryWeightModel';
import { buildCategoryBiomassStackedOptions, buildCategoryWeightOptions, DAY_MARKER_SERIES_ID, nearestDay } from './categoryWeightChartOptions';

export type CategoryWeightPlotMode = 'average' | 'biomass';

interface BatchCategoryWeightPlotProps {
	curves: CategoryCurve[];
	days: string[];
	height?: number | string;
	/** 'average': kg per head per category lines. 'biomass': Apache ECharts Stacked Area of total kg by category. */
	mode?: CategoryWeightPlotMode;
	/** The category to keep in focus; the rest fade. */
	focusKey?: string | null;
	/** A day picked outside the chart, marked with a vertical line and no tooltip. */
	markedDay?: string | null;
	onHoverDay?: (day: string | null) => void;
}

/** The plot alone, without a frame, a legend or a caption: whoever places it decides those. */
export function BatchCategoryWeightPlot({
	curves,
	days,
	height = 320,
	mode = 'average',
	focusKey = null,
	markedDay = null,
	onHoverDay
}: BatchCategoryWeightPlotProps) {
	const theme = useTheme();
	const chartRef = useRef<ReactECharts>(null);
	const hoverRef = useRef(onHoverDay);

	hoverRef.current = onHoverDay;

	const option = useMemo(
		() =>
			mode === 'biomass'
				? buildCategoryBiomassStackedOptions(curves, days, theme, focusKey)
				: buildCategoryWeightOptions(curves, days, theme, focusKey),
		[curves, days, theme, focusKey, mode]
	);

	const events = useMemo(
		() => ({
			updateAxisPointer: (event: { axesInfo?: { value: number }[] }) => {
				const time = event.axesInfo?.[0]?.value;

				hoverRef.current?.(time === undefined ? null : nearestDay(days, time));
			},
			globalout: () => hoverRef.current?.(null)
		}),
		[days]
	);

	useEffect(() => {
		chartRef.current?.getEchartsInstance().setOption({
			series: [
				{ id: DAY_MARKER_SERIES_ID, markLine: { data: markedDay ? [{ xAxis: dayToTime(markedDay) }] : [] } }
			]
		});
	}, [markedDay, option]);

	return (
		<Box sx={{ width: '100%', height }}>
			<ReactECharts
				ref={chartRef}
				option={option}
				onEvents={events}
				style={{ height: '100%', width: '100%' }}
				opts={{ renderer: 'svg' }}
				notMerge
			/>
		</Box>
	);
}

export default BatchCategoryWeightPlot;
