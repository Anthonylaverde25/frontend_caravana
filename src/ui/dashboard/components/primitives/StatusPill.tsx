import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { StatusTone, toneColors } from '../../theme/dashboardTokens';

const TONE_ICON: Record<StatusTone, string | null> = {
	ok: 'heroicons-outline:check-circle',
	warn: 'heroicons-outline:exclamation-triangle',
	bad: 'heroicons-outline:exclamation-circle',
	info: 'heroicons-outline:clock',
	neutral: null
};

export type TrendDirection = 'up' | 'down';

interface StatusPillProps {
	tone: StatusTone;
	label: string;
	/** Replaces the tone icon with a trend arrow when the status expresses a direction, not a judgement. */
	trend?: TrendDirection;
	hideIcon?: boolean;
}

/** Status always carries an icon and a word: color alone never conveys meaning. */
export function StatusPill({ tone, label, trend, hideIcon = false }: StatusPillProps) {
	const theme = useTheme();
	const colors = toneColors(tone, theme.palette.mode === 'dark');
	const icon = trend ? `heroicons-outline:arrow-trending-${trend}` : TONE_ICON[tone];

	return (
		<Box
			component="span"
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 0.75,
				px: 1,
				py: 0.375,
				borderRadius: 999,
				bgcolor: colors.bg,
				color: colors.fg,
				fontSize: '0.75rem',
				fontWeight: 600,
				lineHeight: 1.3,
				whiteSpace: 'nowrap'
			}}
		>
			{icon && !hideIcon && <FuseSvgIcon size={14}>{icon}</FuseSvgIcon>}
			{label}
		</Box>
	);
}

export default StatusPill;
