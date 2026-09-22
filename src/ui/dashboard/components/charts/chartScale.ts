/** Shared geometry for the dashboard's SVG charts (fixed viewBox, scaled by CSS width). */
export interface ChartFrame {
	width: number;
	height: number;
	left: number;
	right: number;
	top: number;
	bottom: number;
}

export function linearY(frame: ChartFrame, min: number, max: number) {
	const plotBottom = frame.height - frame.bottom;
	const plotHeight = plotBottom - frame.top;

	return (value: number) => plotBottom - ((value - min) / (max - min || 1)) * plotHeight;
}

export function bandX(frame: ChartFrame, count: number) {
	const plotWidth = frame.width - frame.left - frame.right;
	const step = plotWidth / Math.max(count, 1);

	return { step, center: (index: number) => frame.left + step * index + step / 2 };
}

export function pointX(frame: ChartFrame, count: number) {
	const plotWidth = frame.width - frame.left - frame.right;

	return (index: number) =>
		count <= 1 ? frame.left + plotWidth / 2 : frame.left + (plotWidth * index) / (count - 1);
}

export const AXIS_TEXT = { fontSize: 11, fontFamily: 'inherit' } as const;

/** Charts scale with their card; past this height a full-width card keeps the chart centred instead of oversized. */
export const CHART_MAX_HEIGHT = 340;
