import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { formatNumber, toPercentOfRange } from '../../theme/formatters';

export interface RangeRow {
	label: string;
	min: number;
	avg: number;
	max: number;
}

interface RangeRowsProps {
	rows: RangeRow[];
	domainMin: number;
	domainMax: number;
	unit: string;
}

/** Min–avg–max per group on a shared axis, to compare uniformity between groups. */
export function RangeRows({ rows, domainMin, domainMax, unit }: RangeRowsProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const pos = (v: number) => toPercentOfRange(v, domainMin, domainMax);

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
			{rows.map((row) => (
				<Box
					key={row.label}
					sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
				>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
						<Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>{row.label}</Typography>
						<Typography
							sx={{ fontSize: '0.75rem', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
						>
							{`${formatNumber(row.min)}–${formatNumber(row.max)} ${unit} · prom. ${formatNumber(row.avg)}`}
						</Typography>
					</Box>
					<Box
						role="img"
						aria-label={`${row.label}: mínimo ${row.min}, promedio ${row.avg}, máximo ${row.max} ${unit}`}
						sx={{ position: 'relative', height: 14 }}
					>
						<Box sx={{ position: 'absolute', left: 0, right: 0, top: 6, height: 2, bgcolor: 'divider' }} />
						<Box
							sx={{
								position: 'absolute',
								top: 3,
								height: 8,
								borderRadius: 4,
								left: `${pos(row.min)}%`,
								width: `${pos(row.max) - pos(row.min)}%`,
								bgcolor: isDark ? 'rgba(143,212,174,0.3)' : DASHBOARD_COLORS.accentLight
							}}
						/>
						<Box
							sx={{
								position: 'absolute',
								top: 1,
								left: `calc(${pos(row.avg)}% - 6px)`,
								width: 12,
								height: 12,
								borderRadius: '50%',
								bgcolor: DASHBOARD_COLORS.accent,
								border: 2,
								borderColor: 'background.paper'
							}}
						/>
					</Box>
				</Box>
			))}
			<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
				<Typography
					sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}
				>{`${formatNumber(domainMin)} ${unit}`}</Typography>
				<Typography
					sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}
				>{`${formatNumber(domainMax)} ${unit}`}</Typography>
			</Box>
		</Box>
	);
}

export interface DivergingItem {
	label: string;
	value: number;
	display: string;
	caption: string;
	favorable: boolean;
}

/** Signed contributions around a zero axis (real growth vs. composition effect). */
export function DivergingRows({ items, halfScale }: { items: DivergingItem[]; halfScale: number }) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
			{items.map((item) => {
				const width = `${Math.min(100, (Math.abs(item.value) / halfScale) * 100)}%`;
				const color = item.favorable ? DASHBOARD_COLORS.accent : DASHBOARD_COLORS.ochre;

				return (
					<Box
						key={item.label}
						sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}
					>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
							<Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.label}</Typography>
							<Typography
								sx={{ fontSize: '0.875rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
							>
								{item.display}
							</Typography>
						</Box>
						<Box
							role="img"
							aria-label={`${item.label} ${item.display}`}
							sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 18 }}
						>
							<Box
								sx={{
									display: 'flex',
									justifyContent: 'flex-end',
									borderRight: 1.5,
									borderColor: 'text.secondary'
								}}
							>
								{item.value < 0 && (
									<Box sx={{ width, height: 18, bgcolor: color, borderRadius: '3px 0 0 3px' }} />
								)}
							</Box>
							<Box>
								{item.value > 0 && (
									<Box sx={{ width, height: 18, bgcolor: color, borderRadius: '0 3px 3px 0' }} />
								)}
							</Box>
						</Box>
						<Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>{item.caption}</Typography>
					</Box>
				);
			})}
		</Box>
	);
}

export default RangeRows;
