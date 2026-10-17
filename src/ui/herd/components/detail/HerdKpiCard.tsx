import React from 'react';
import { Paper, Typography } from '@mui/material';

interface HerdKpiCardProps {
	label: string;
	value: React.ReactNode;
	hint?: React.ReactNode;
	tone?: 'default' | 'success' | 'warning' | 'error';
}

const TONE_COLOR: Record<NonNullable<HerdKpiCardProps['tone']>, string> = {
	default: 'text.primary',
	success: 'success.main',
	warning: 'warning.dark',
	error: 'error.main'
};

/** One figure of the batch page: a label, its value and an optional line of context. */
export function HerdKpiCard({ label, value, hint, tone = 'default' }: HerdKpiCardProps) {
	return (
		<Paper
			elevation={0}
			sx={{ p: 2, borderRadius: '8px', border: 1, borderColor: 'divider', height: '100%' }}
		>
			<Typography
				variant="caption"
				sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}
			>
				{label}
			</Typography>
			<Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: TONE_COLOR[tone], lineHeight: 1.3, mt: 0.5 }}>
				{value}
			</Typography>
			{hint && (
				<Typography
					variant="caption"
					component="div"
					sx={{ color: 'text.secondary', mt: 0.25 }}
				>
					{hint}
				</Typography>
			)}
		</Paper>
	);
}

export default HerdKpiCard;
