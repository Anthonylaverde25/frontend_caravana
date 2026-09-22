import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';
import { toPercentOfRange } from '../../theme/formatters';

interface ReferenceBarProps {
	value: number;
	min: number;
	max: number;
	minLabel: string;
	maxLabel: string;
	/** Line marker: previous period or a stored target. */
	marker?: { value: number; label: string };
	/** Shaded band: a reference range (INTA, catalog target weight). Renders the value as a dot. */
	band?: { from: number; to: number; label: string };
	valueColor?: string;
	ariaLabel: string;
}

/**
 * Bullet bar used by KPI tiles. With `marker` it draws a filled bar plus a reference line;
 * with `band` it draws a range and the value as a dot.
 */
export function ReferenceBar({
	value,
	min,
	max,
	minLabel,
	maxLabel,
	marker,
	band,
	valueColor = DASHBOARD_COLORS.accent,
	ariaLabel
}: ReferenceBarProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const track = isDark ? 'rgba(255,255,255,0.10)' : DASHBOARD_COLORS.track;
	const valuePct = toPercentOfRange(value, min, max);
	const centerLabel = band?.label ?? marker?.label;
	const centerPct = band
		? (toPercentOfRange(band.from, min, max) + toPercentOfRange(band.to, min, max)) / 2
		: marker
			? toPercentOfRange(marker.value, min, max)
			: null;

	return (
		<Box
			role="img"
			aria-label={ariaLabel}
		>
			<Box sx={{ position: 'relative', height: 24, display: 'flex', alignItems: 'center' }}>
				<Box
					sx={{ position: 'absolute', left: 0, right: 0, height: 12, borderRadius: '3px', bgcolor: track }}
				/>
				{band && (
					<Box
						sx={{
							position: 'absolute',
							height: 12,
							left: `${toPercentOfRange(band.from, min, max)}%`,
							width: `${toPercentOfRange(band.to, min, max) - toPercentOfRange(band.from, min, max)}%`,
							bgcolor: isDark ? 'rgba(143,212,174,0.25)' : DASHBOARD_COLORS.band
						}}
					/>
				)}
				{!band && (
					<Box
						sx={{
							position: 'absolute',
							left: 0,
							height: 12,
							width: `${valuePct}%`,
							borderRadius: '3px',
							bgcolor: valueColor
						}}
					/>
				)}
				{marker && (
					<Box
						sx={{
							position: 'absolute',
							left: `calc(${toPercentOfRange(marker.value, min, max)}% - 1px)`,
							height: 24,
							width: '2.5px',
							bgcolor: 'text.primary'
						}}
					/>
				)}
				{band && (
					<Box
						sx={{
							position: 'absolute',
							left: `calc(${valuePct}% - 7px)`,
							width: 14,
							height: 14,
							borderRadius: '50%',
							bgcolor: valueColor,
							border: 2,
							borderColor: 'background.paper'
						}}
					/>
				)}
			</Box>
			<Box sx={{ position: 'relative', height: 16, mt: 0.25 }}>
				<Typography sx={{ position: 'absolute', left: 0, fontSize: '0.6875rem', color: 'text.secondary' }}>
					{minLabel}
				</Typography>
				{centerLabel && centerPct !== null && (
					<Typography
						sx={{
							position: 'absolute',
							left: `${centerPct}%`,
							transform: 'translateX(-50%)',
							fontSize: '0.6875rem',
							color: 'text.secondary',
							whiteSpace: 'nowrap'
						}}
					>
						{centerLabel}
					</Typography>
				)}
				<Typography sx={{ position: 'absolute', right: 0, fontSize: '0.6875rem', color: 'text.secondary' }}>
					{maxLabel}
				</Typography>
			</Box>
		</Box>
	);
}

export default ReferenceBar;
