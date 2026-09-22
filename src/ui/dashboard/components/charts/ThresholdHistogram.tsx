import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { AXIS_TEXT, CHART_MAX_HEIGHT, ChartFrame, bandX, linearY } from './chartScale';

export interface HistogramBin {
	label: string;
	count: number;
}

interface ThresholdHistogramProps {
	bins: HistogramBin[];
	/** Bins from this index on meet the target and are drawn in the accent color. */
	thresholdIndex: number;
	thresholdLabel: string;
	ariaLabel: string;
}

/** Distribution against a catalog target: the shaded side is "reaches the target". */
export function ThresholdHistogram({ bins, thresholdIndex, thresholdLabel, ariaLabel }: ThresholdHistogramProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const frame: ChartFrame = { width: 620, height: 210, left: 24, right: 8, top: 28, bottom: 26 };
	const max = Math.max(...bins.map((b) => b.count), 1);
	const y = linearY(frame, 0, max * 1.12);
	const { step, center } = bandX(frame, bins.length);
	const barWidth = step * 0.86;
	const baseY = frame.height - frame.bottom;
	const thresholdX = frame.left + step * thresholdIndex;

	return (
		<Box
			component="svg"
			viewBox={`0 0 ${frame.width} ${frame.height}`}
			role="img"
			aria-label={ariaLabel}
			sx={{ width: '100%', height: 'auto', maxHeight: CHART_MAX_HEIGHT, display: 'block' }}
		>
			<rect
				x={thresholdX}
				y={frame.top - 18}
				width={frame.width - frame.right - thresholdX}
				height={baseY - frame.top + 18}
				fill={isDark ? 'rgba(143,212,174,0.10)' : '#E3F1E8'}
				fillOpacity={isDark ? 1 : 0.55}
			/>
			<line
				x1={thresholdX}
				x2={thresholdX}
				y1={frame.top - 18}
				y2={baseY + 6}
				stroke={theme.palette.text.primary}
				strokeWidth={1.5}
				strokeDasharray="5 4"
			/>
			<text
				x={frame.width - frame.right - 4}
				y={frame.top - 4}
				textAnchor="end"
				fill={isDark ? '#8FD4AE' : '#17613B'}
				fontSize={12}
				fontWeight={600}
			>
				{thresholdLabel}
			</text>
			<line
				x1={frame.left}
				x2={frame.width - frame.right}
				y1={baseY}
				y2={baseY}
				stroke={theme.palette.divider}
			/>
			{bins.map((bin, i) => (
				<g key={bin.label}>
					<rect
						x={center(i) - barWidth / 2}
						y={y(bin.count)}
						width={barWidth}
						height={baseY - y(bin.count)}
						rx={2}
						fill={i >= thresholdIndex ? DASHBOARD_COLORS.accent : DASHBOARD_COLORS.neutral}
					/>
					<text
						x={center(i)}
						y={y(bin.count) - 6}
						textAnchor="middle"
						fill={theme.palette.text.primary}
						fontSize={12}
						fontWeight={600}
					>
						{bin.count}
					</text>
					<text
						x={center(i)}
						y={baseY + 18}
						textAnchor="middle"
						fill={theme.palette.text.secondary}
						{...AXIS_TEXT}
					>
						{bin.label}
					</text>
				</g>
			))}
		</Box>
	);
}

export default ThresholdHistogram;
