import { ReactElement } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber } from '../../theme/formatters';
import { AXIS_TEXT, CHART_MAX_HEIGHT, ChartFrame, linearY } from './chartScale';

/**
 * One row of `batch_weights`. CONTROL points are weighings of the same animals;
 * COMPOSITION points (MOVEMENT_IN / MOVEMENT_OUT) move the average without anyone gaining weight.
 */
export interface WeightCurvePoint {
	day: number;
	dateLabel: string;
	average: number;
	heads: number;
	kind: 'CONTROL' | 'COMPOSITION';
	/** Two-line annotation for composition steps. */
	note?: [string, string];
}

interface WeightCompositionChartProps {
	points: WeightCurvePoint[];
	totalDays: number;
	yMin: number;
	yMax: number;
	yTicks: number[];
	ariaLabel: string;
}

export function WeightCompositionChart({
	points,
	totalDays,
	yMin,
	yMax,
	yTicks,
	ariaLabel
}: WeightCompositionChartProps) {
	const theme = useTheme();
	const muted = theme.palette.text.secondary;
	const ink = theme.palette.text.primary;
	const frame: ChartFrame = { width: 860, height: 300, left: 64, right: 24, top: 36, bottom: 56 };
	const y = linearY(frame, yMin, yMax);
	const x = (day: number) => frame.left + (day / totalDays) * (frame.width - frame.left - frame.right);
	const baseY = frame.height - frame.bottom;
	const segments: ReactElement[] = [];

	points.forEach((point, i) => {
		if (i === 0) return;

		const prev = points[i - 1];

		if (point.kind === 'COMPOSITION') {
			segments.push(
				<line
					key={`carry-${i}`}
					x1={x(prev.day)}
					y1={y(prev.average)}
					x2={x(point.day)}
					y2={y(prev.average)}
					stroke={muted}
					strokeWidth={2}
					strokeDasharray="2 3"
				/>,
				<line
					key={`step-${i}`}
					x1={x(point.day)}
					y1={y(prev.average)}
					x2={x(point.day)}
					y2={y(point.average)}
					stroke={DASHBOARD_COLORS.ochreLine}
					strokeWidth={3}
					strokeDasharray="3 2"
				/>
			);
		} else {
			const unmeasured = prev.kind === 'COMPOSITION';
			segments.push(
				<line
					key={`seg-${i}`}
					x1={x(prev.day)}
					y1={y(prev.average)}
					x2={x(point.day)}
					y2={y(point.average)}
					stroke={unmeasured ? muted : DASHBOARD_COLORS.accent}
					strokeWidth={unmeasured ? 2 : 2.5}
					strokeDasharray={unmeasured ? '2 3' : undefined}
				/>
			);
		}
	});

	const last = points[points.length - 1];

	return (
		<Box
			component="svg"
			viewBox={`0 0 ${frame.width} ${frame.height}`}
			role="img"
			aria-label={ariaLabel}
			sx={{ width: '100%', height: 'auto', maxHeight: CHART_MAX_HEIGHT, display: 'block' }}
		>
			{yTicks.map((tick, i) => (
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
						{i === 0 ? `${tick} kg` : tick}
					</text>
				</g>
			))}
			{segments}
			{points.map((p) =>
				p.kind === 'CONTROL' ? (
					<circle
						key={`pt-${p.day}`}
						cx={x(p.day)}
						cy={y(p.average)}
						r={p === last ? 5.5 : 4.5}
						fill={DASHBOARD_COLORS.accent}
					/>
				) : (
					<g key={`comp-${p.day}`}>
						<rect
							x={x(p.day) - 4}
							y={y(p.average) - 1.5}
							width={8}
							height={3}
							fill={DASHBOARD_COLORS.ochreLine}
						/>
						{p.note && (
							<g>
								<line
									x1={x(p.day)}
									x2={x(p.day)}
									y1={y(p.average) + 6}
									y2={baseY - 64}
									stroke={DASHBOARD_COLORS.ochreLine}
								/>
								<rect
									x={x(p.day) - 136}
									y={baseY - 64}
									width={200}
									height={46}
									rx={6}
									fill={theme.palette.background.paper}
									stroke="#E0C48E"
								/>
								<text
									x={x(p.day) - 126}
									y={baseY - 45}
									fill={DASHBOARD_COLORS.ochreLine}
									fontSize={12}
									fontWeight={700}
								>
									{p.note[0]}
								</text>
								<text
									x={x(p.day) - 126}
									y={baseY - 27}
									fill={DASHBOARD_COLORS.ochreLine}
									fontSize={12}
								>
									{p.note[1]}
								</text>
							</g>
						)}
					</g>
				)
			)}
			<text
				x={x(last.day)}
				y={y(last.average) - 14}
				textAnchor="end"
				fill={DASHBOARD_COLORS.accent}
				fontSize={12}
				fontWeight={700}
			>
				{`${formatNumber(last.average)} kg · ${last.heads} cab.`}
			</text>
			{points
				.filter((p) => p.kind === 'CONTROL')
				.map((p) => (
					<text
						key={`x-${p.day}`}
						x={x(p.day)}
						y={baseY + 20}
						textAnchor="middle"
						fill={muted}
						{...AXIS_TEXT}
					>
						{p.dateLabel}
					</text>
				))}
			<text
				x={frame.left}
				y={baseY + 42}
				fill={ink}
				fontSize={11}
			>
				{`Cabezas: ${points[0].heads} → ${last.heads}`}
			</text>
		</Box>
	);
}

export default WeightCompositionChart;
