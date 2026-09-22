import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AXIS_TEXT, CHART_MAX_HEIGHT, ChartFrame, bandX, linearY } from './chartScale';

export interface ColumnSeries {
	label: string;
	color: string;
	values: number[];
}

interface StackedColumnChartProps {
	categories: string[];
	series: ColumnSeries[];
	yMax: number;
	yTicks: number[];
	/** Dashed outline per category, e.g. expected calvings behind the registered ones. */
	outline?: number[];
	outlineColor?: string;
	/** Vertical marker at a fractional category index (e.g. "hoy"). */
	marker?: { position: number; label: string };
	showTotals?: boolean;
	ariaLabel: string;
	height?: number;
}

export function StackedColumnChart({
	categories,
	series,
	yMax,
	yTicks,
	outline,
	outlineColor = '#6FA088',
	marker,
	showTotals = false,
	ariaLabel,
	height = 240
}: StackedColumnChartProps) {
	const theme = useTheme();
	const muted = theme.palette.text.secondary;
	const ink = theme.palette.text.primary;
	const frame: ChartFrame = { width: 820, height, left: 44, right: 12, top: 28, bottom: 28 };
	const y = linearY(frame, 0, yMax);
	const { step, center } = bandX(frame, categories.length);
	const barWidth = Math.min(56, step * 0.64);
	const baseY = frame.height - frame.bottom;

	return (
		<Box
			component="svg"
			viewBox={`0 0 ${frame.width} ${frame.height}`}
			role="img"
			aria-label={ariaLabel}
			sx={{ width: '100%', height: 'auto', maxHeight: CHART_MAX_HEIGHT, display: 'block' }}
		>
			{yTicks.map((tick) => (
				<g key={tick}>
					<line
						x1={frame.left}
						x2={frame.width - frame.right}
						y1={y(tick)}
						y2={y(tick)}
						stroke={theme.palette.divider}
					/>
					<text
						x={frame.left - 8}
						y={y(tick) + 4}
						textAnchor="end"
						fill={muted}
						{...AXIS_TEXT}
					>
						{tick}
					</text>
				</g>
			))}
			{categories.map((category, i) => {
				const left = center(i) - barWidth / 2;
				let top = baseY;
				const total = series.reduce((acc, s) => acc + (s.values[i] ?? 0), 0);

				return (
					<g key={category}>
						{outline && outline[i] > 0 && (
							<rect
								x={left}
								y={y(outline[i])}
								width={barWidth}
								height={baseY - y(outline[i])}
								fill="none"
								stroke={outlineColor}
								strokeWidth={1.5}
								strokeDasharray="3 2"
							/>
						)}
						{series.map((s) => {
							const value = s.values[i] ?? 0;

							if (value <= 0) return null;

							const h = baseY - y(value);
							top -= h;

							return (
								<rect
									key={s.label}
									x={left}
									y={top}
									width={barWidth}
									height={h}
									fill={s.color}
								/>
							);
						})}
						{showTotals && total > 0 && (
							<text
								x={center(i)}
								y={top - 6}
								textAnchor="middle"
								fill={ink}
								fontSize={12}
								fontWeight={600}
							>
								{total}
							</text>
						)}
						<text
							x={center(i)}
							y={baseY + 18}
							textAnchor="middle"
							fill={muted}
							{...AXIS_TEXT}
						>
							{category}
						</text>
					</g>
				);
			})}
			{marker && (
				<g>
					<line
						x1={frame.left + step * marker.position}
						x2={frame.left + step * marker.position}
						y1={frame.top - 12}
						y2={baseY + 4}
						stroke={ink}
						strokeWidth={1.5}
					/>
					<text
						x={frame.left + step * marker.position + 6}
						y={frame.top - 2}
						fill={ink}
						fontSize={12}
						fontWeight={600}
					>
						{marker.label}
					</text>
				</g>
			)}
		</Box>
	);
}

export default StackedColumnChart;
