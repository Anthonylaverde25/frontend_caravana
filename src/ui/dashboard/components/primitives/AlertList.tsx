import { Box, Link, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { StatusTone, toneColors } from '../../theme/dashboardTokens';
import { StatusPill } from './StatusPill';

export interface AlertItem {
	id: string;
	tone: Extract<StatusTone, 'bad' | 'warn' | 'info'>;
	title: string;
	detail: string;
	/** Board the alert comes from, shown as a tag in cross-board summaries. */
	sourceLabel?: string;
	href?: string;
}

const ICON: Record<AlertItem['tone'], string> = {
	bad: 'heroicons-outline:exclamation-circle',
	warn: 'heroicons-outline:exclamation-triangle',
	info: 'heroicons-outline:clock'
};

const ORDER: Record<AlertItem['tone'], number> = { bad: 0, warn: 1, info: 2 };

/** Alerts sorted critical → warning → scheduled. Each one names what happened and the figure behind it. */
export function AlertList({ items }: { items: AlertItem[] }) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const sorted = [...items].sort((a, b) => ORDER[a.tone] - ORDER[b.tone]);

	return (
		<Box
			component="ul"
			sx={{ listStyle: 'none', m: 0, p: 0 }}
		>
			{sorted.map((item, index) => {
				const colors = toneColors(item.tone, isDark);

				return (
					<Box
						component="li"
						key={item.id}
						sx={{
							display: 'grid',
							gridTemplateColumns: item.sourceLabel ? '28px 1fr auto' : '28px 1fr',
							gap: 1.5,
							py: 1.5,
							borderBottom: index === sorted.length - 1 ? 0 : 1,
							borderColor: 'divider',
							alignItems: 'start'
						}}
					>
						<Box
							sx={{
								width: 28,
								height: 28,
								borderRadius: '50%',
								bgcolor: colors.bg,
								color: colors.fg,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
							<FuseSvgIcon size={16}>{ICON[item.tone]}</FuseSvgIcon>
						</Box>
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, minWidth: 0 }}>
							<Link
								href={item.href ?? '#'}
								underline="hover"
								sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}
							>
								{item.title}
							</Link>
							<Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
								{item.detail}
							</Typography>
						</Box>
						{item.sourceLabel && (
							<StatusPill
								tone="neutral"
								label={item.sourceLabel}
							/>
						)}
					</Box>
				);
			})}
		</Box>
	);
}

export default AlertList;
