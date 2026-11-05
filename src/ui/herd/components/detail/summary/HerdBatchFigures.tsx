import React from 'react';
import { Box, Typography } from '@mui/material';

export type HerdFigureTone = 'default' | 'success' | 'warning' | 'error';

const TONE_COLOR: Record<HerdFigureTone, string> = {
	default: 'text.primary',
	success: 'success.main',
	warning: 'warning.dark',
	error: 'error.main'
};

interface HerdBatchFigureProps {
	label: string;
	value: React.ReactNode;
	hint?: React.ReactNode;
	tone?: HerdFigureTone;
}

/** One figure in a row: label, value and an optional line of context. No box: rows split them. */
export function HerdBatchFigure({ label, value, hint, tone = 'default' }: HerdBatchFigureProps) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, minWidth: 0 }}>
			<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{label}</Typography>
			<Typography sx={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.2, color: TONE_COLOR[tone] }}>
				{value}
			</Typography>
			{hint && <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{hint}</Typography>}
		</Box>
	);
}

/** Figures side by side, set apart by a thin vertical rule. */
export function HerdBatchFigureRow({ children }: { children: React.ReactNode }) {
	return (
		<Box
			sx={{
				display: 'flex',
				flexWrap: 'wrap',
				rowGap: 1.5,
				'& > *': { px: 3, borderLeft: 1, borderColor: 'divider' },
				'& > *:first-of-type': { pl: 0, borderLeft: 0 }
			}}
		>
			{children}
		</Box>
	);
}
