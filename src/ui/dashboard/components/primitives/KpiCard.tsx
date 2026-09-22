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
				p: '20px 22px',
				display: 'flex',
				flexDirection: 'column',
				gap: 1.5,
				border: 1,
				borderColor: 'divider',
				borderRadius: '10px'
			}}
		>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
				<Typography
					sx={{
						fontSize: '0.75rem',
						fontWeight: 600,
						letterSpacing: '0.06em',
						textTransform: 'uppercase',
						color: 'text.secondary'
					}}
				>
					{label}
				</Typography>
				{status}
			</Box>
			<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
				<Typography
					sx={{
						fontSize: '2.5rem',
						fontWeight: 600,
						letterSpacing: '-0.02em',
						lineHeight: 1,
						fontVariantNumeric: 'tabular-nums',
						color: 'text.primary'
					}}
				>
					{value}
				</Typography>
				{unit && (
					<Typography sx={{ fontSize: '1.125rem', fontWeight: 500, color: 'text.secondary' }}>
						{unit}
					</Typography>
				)}
			</Box>
			{visual}
			<Typography
				component="div"
				sx={{
					fontSize: '0.8125rem',
					color: 'text.secondary',
					lineHeight: 1.45,
					fontVariantNumeric: 'tabular-nums',
					'& strong': { color: 'text.primary', fontWeight: 600 }
				}}
			>
				{context}
			</Typography>
			{footnote && (
				<Typography
					component="div"
					sx={{
						mt: 'auto',
						pt: 1.25,
						// Room for the "Datos de ejemplo" tag of static widgets.
						pr: '104px',
						borderTop: 1,
						borderColor: 'divider',
						fontSize: '0.75rem',
						color: 'text.secondary'
					}}
				>
					{footnote}
				</Typography>
			)}
		</Paper>
	);
}

export default KpiCard;
