import { ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface KpiCardProps {
	/** Full indicator name, never abbreviated. */
	label: string;
	status?: ReactNode;
	value: string;
	unit?: string;
	/** Reference visual: ReferenceBar, StackedBar or a sparkline. */
	visual?: ReactNode;
	/** "x de y" context line with the denominator and the deltas. */
	context: ReactNode;
	/** Data freshness and coverage. */
	footnote?: ReactNode;
}

/**
 * Canonical KPI tile. Answers, in order: how much, over what total,
 * against what reference, is it good or bad, and how fresh is the data.
 */
export function KpiCard({ label, status, value, unit, visual, context, footnote }: KpiCardProps) {
	return (
		<Paper
			elevation={0}
			component="article"
			sx={{
				height: '100%',
				p: { xs: 2, sm: 2.5 },
				display: 'flex',
				flexDirection: 'column',
				gap: 1.5,
				border: 1,
				borderColor: 'divider',
				borderRadius: '10px',
				bgcolor: 'background.paper',
				transition: 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)',
				'&:hover': {
					borderColor: 'divider',
					boxShadow: (theme) =>
						theme.palette.mode === 'dark'
							? '0 6px 20px rgba(0,0,0,0.35)'
							: '0 6px 18px rgba(0,0,0,0.04)',
					transform: 'translateY(-1px)'
				}
			}}
		>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
				<Typography
					sx={{
						fontSize: '0.8125rem',
						fontWeight: 600,
						letterSpacing: '-0.01em',
						color: 'text.secondary',
						lineHeight: 1.2
					}}
				>
					{label}
				</Typography>
				{status}
			</Box>
			<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
				<Typography
					sx={{
						fontSize: { xs: '1.875rem', sm: '2.15rem' },
						fontWeight: 700,
						letterSpacing: '-0.03em',
						lineHeight: 1.1,
						fontVariantNumeric: 'tabular-nums',
						color: 'text.primary'
					}}
				>
					{value}
				</Typography>
				{unit && (
					<Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'text.secondary' }}>
						{unit}
					</Typography>
				)}
			</Box>
			{visual}
			<Box
				sx={{
					fontSize: '0.8125rem',
					color: 'text.secondary',
					lineHeight: 1.45,
					fontVariantNumeric: 'tabular-nums',
					'& strong': { color: 'text.primary', fontWeight: 600 }
				}}
			>
				{context}
			</Box>
			{footnote && (
				<Box
					sx={{
						mt: 'auto',
						pt: 1.25,
						borderTop: 1,
						borderColor: 'divider',
						fontSize: '0.71875rem',
						color: 'text.secondary',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 1
					}}
				>
					{footnote}
				</Box>
			)}
		</Paper>
	);
}

export default KpiCard;
