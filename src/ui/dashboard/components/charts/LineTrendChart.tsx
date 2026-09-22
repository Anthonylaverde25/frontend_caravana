import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { AXIS_TEXT, CHART_MAX_HEIGHT, ChartFrame, linearY, pointX } from './chartScale';

export interface TrendPoint {
	label: string;
	value: number;
	/** Second axis line (e.g. year or coverage). */
	sublabel?: string;
	/** Period still open: drawn hollow and joined with a dashed segment. */
	partial?: boolean;
}

interface LineTrendChartProps {
	points: TrendPoint[];
	yMin: number;
	yMax: number;
	yTicks: number[];
	formatValue: (value: number) => string;
	/** Axis tick format; defaults to `formatValue`. */
	formatTick?: (value: number) => string;
	showValueLabels?: boolean;
	showArea?: boolean;
	annotations?: { index: number; text: string }[];
	ariaLabel: string;
	height?: number;
}

/** Single-series trend. When the axis does not start at zero, values are labelled to keep the reading honest. */
export function LineTrendChart({
	points,
	yMin,
	yMax,
	yTicks,
	formatValue,
	formatTick = formatValue,
	showValueLabels = false,
	showArea = false,
	annotations = [],
	ariaLabel,
	height = 250
}: LineTrendChartProps) {
	const theme = useTheme();
	const ink = theme.palette.text.primary;
	const muted = theme.palette.text.secondary;
	const grid = theme.palette.divider;
	const frame: ChartFrame = { width: 860, height, left: 56, right: 24, top: 36, bottom: 44 };
	const y = linearY(frame, yMin, yMax);
	const x = pointX(frame, points.length);
	const closed = points.filter((p) => !p.partial);
	const lastClosed = closed.length - 1;
	const line = closed.map((p, i) => `${x(i)},${y(p.value)}`).join(' ');
	const baseY = frame.height - frame.bottom;
	const area = `M${x(0)},${baseY} L${points.map((p, i) => `${x(i)},${y(p.value)}`).join(' L')} L${x(points.length - 1)},${baseY} Z`;

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
						stroke={grid}
					/>
					<text
						x={frame.left - 8}
						y={y(tick) + 4}
						textAnchor="end"
						fill={muted}
						{...AXIS_TEXT}
					>
						{formatTick(tick)}
					</text>
				</g>
			))}
			{showArea && (
				<path
					d={area}
					fill={DASHBOARD_COLORS.accent}
					fillOpacity={0.08}
				/>
			)}
			<polyline
				points={line}
				fill="none"
				stroke={DASHBOARD_COLORS.accent}
				strokeWidth={2.5}
				strokeLinejoin="round"
			/>
			{points.map((p, i) =>
				p.partial ? (
					<g key={p.label}>
						{lastClosed >= 0 && (
							<line
								x1={x(lastClosed)}
								y1={y(points[lastClosed].value)}
								x2={x(i)}
								y2={y(p.value)}
								stroke={DASHBOARD_COLORS.accent}
								strokeWidth={2.5}
								strokeDasharray="5 4"
							/>
						)}
						<circle
							cx={x(i)}
							cy={y(p.value)}
							r={6}
							fill={theme.palette.background.paper}
							stroke={DASHBOARD_COLORS.accent}
							strokeWidth={2.5}
						/>
					</g>
				) : (
					<circle
						key={p.label}
						cx={x(i)}
						cy={y(p.value)}
						r={4.5}
						fill={DASHBOARD_COLORS.accent}
					/>
				)
			)}
			{showValueLabels &&
				points.map((p, i) => (
					<text
						key={`v-${p.label}`}
						x={x(i)}
						y={y(p.value) - 12}
						textAnchor="middle"
						fill={ink}
						fontSize={13}
						fontWeight={600}
					>
						{formatValue(p.value)}
					</text>
				))}
			{annotations.map((a) => (
				<g key={a.text}>
					<line
						x1={x(a.index)}
						x2={x(a.index)}
						y1={y(points[a.index].value) - 8}
						y2={frame.top - 4}
						stroke={muted}
						strokeDasharray="3 3"
					/>
					<text
						x={x(a.index)}
						y={frame.top - 10}
						textAnchor="middle"
						fill={ink}
						fontSize={12}
						fontWeight={600}
					>
						{a.text}
					</text>
				</g>
			))}
			{points.map((p, i) => (
				<g key={`x-${p.label}`}>
					<text
						x={x(i)}
						y={baseY + 18}
						textAnchor="middle"
						fill={muted}
						{...AXIS_TEXT}
					>
						{p.label}
					</text>
					{p.sublabel && (
						<text
							x={x(i)}
							y={baseY + 34}
							textAnchor="middle"
							fill={muted}
							{...AXIS_TEXT}
						>
							{p.sublabel}
						</text>
					)}
				</g>
			))}
		</Box>
	);
}

export default LineTrendChart;
