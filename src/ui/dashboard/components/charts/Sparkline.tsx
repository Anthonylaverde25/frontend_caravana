import { Box } from '@mui/material';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';

interface SparklineProps {
	values: number[];
	ariaLabel: string;
}

/** Shape-only trend for KPI tiles; the exact figures live in the tile text. */
export function Sparkline({ values, ariaLabel }: SparklineProps) {
	const width = 294;
	const height = 44;
	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min || 1;
	const x = (i: number) => 2 + ((width - 4) * i) / Math.max(values.length - 1, 1);
	const y = (v: number) => height - 4 - ((v - min) / range) * (height - 10);
	const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
	const last = values.length - 1;

	return (
		<Box
			component="svg"
			viewBox={`0 0 ${width} ${height}`}
			preserveAspectRatio="none"
			role="img"
			aria-label={ariaLabel}
			sx={{ width: '100%', height: 44, display: 'block' }}
		>
			<polyline
				points={points}
				fill="none"
				stroke={DASHBOARD_COLORS.accent}
				strokeWidth={2}
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
			/>
			<circle
				cx={x(last)}
				cy={y(values[last])}
				r={3}
				fill={DASHBOARD_COLORS.accent}
			/>
		</Box>
	);
}

export default Sparkline;
