import { Box, Typography } from '@mui/material';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';

export interface BarRow {
	label: string;
	value: number;
	/** Text shown at the right; defaults to the raw value. */
	display?: string;
	color?: string;
}

interface HorizontalBarListProps {
	rows: BarRow[];
	labelWidth?: number;
	valueWidth?: number;
	barHeight?: number;
}

/** Ranked single-series bars. All bars share the scale of the largest value. */
export function HorizontalBarList({ rows, labelWidth = 150, valueWidth = 48, barHeight = 14 }: HorizontalBarListProps) {
	const max = Math.max(...rows.map((r) => r.value), 1);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.125 }}>
			{rows.map((row) => (
				<Box
					key={row.label}
					sx={{
						display: 'grid',
						gridTemplateColumns: `${labelWidth}px 1fr ${valueWidth}px`,
						gap: 1.25,
						alignItems: 'center'
					}}
				>
					<Typography sx={{ fontSize: '0.8125rem', color: 'text.primary' }}>{row.label}</Typography>
					<Box sx={{ height: barHeight }}>
						<Box
							sx={{
								width: `${(row.value / max) * 100}%`,
								height: barHeight,
								borderRadius: '3px',
								bgcolor: row.color ?? DASHBOARD_COLORS.accent
							}}
						/>
					</Box>
					<Typography
						sx={{
							fontSize: '0.8125rem',
							fontWeight: 600,
							textAlign: 'right',
							fontVariantNumeric: 'tabular-nums'
						}}
					>
						{row.display ?? row.value}
					</Typography>
				</Box>
			))}
		</Box>
	);
}

export default HorizontalBarList;
