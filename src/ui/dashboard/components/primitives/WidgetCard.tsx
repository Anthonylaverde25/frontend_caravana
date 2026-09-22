import { ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface WidgetCardProps {
	title?: string;
	subtitle?: ReactNode;
	/** Right side of the header: filters, links, toggles. */
	actions?: ReactNode;
	footnote?: ReactNode;
	/** Removes body padding so tables can bleed to the card edges. */
	flush?: boolean;
	children: ReactNode;
}

/** Shared surface for every non-KPI widget: header, body, optional footnote. */
export function WidgetCard({ title, subtitle, actions, footnote, flush = false, children }: WidgetCardProps) {
	const hasHeader = Boolean(title || actions);

	return (
		<Paper
			elevation={0}
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				border: 1,
				borderColor: 'divider',
				borderRadius: '10px',
				overflow: 'hidden'
			}}
		>
			{hasHeader && (
				<Box
					sx={{
						px: 3,
						pt: 2.5,
						pb: flush ? 2 : 0,
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'flex-start',
						gap: 2,
						borderBottom: flush ? 1 : 0,
						borderColor: 'divider'
					}}
				>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
						{title && (
							<Typography
								component="h2"
								sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.primary' }}
							>
								{title}
							</Typography>
						)}
						{subtitle && (
							<Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.45 }}>
								{subtitle}
							</Typography>
						)}
					</Box>
					{actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
				</Box>
			)}
			<Box
				sx={{
					flex: '1 1 auto',
					px: flush ? 0 : 3,
					pt: flush ? 0 : 2,
					pb: flush ? 0 : 2.5,
					display: 'flex',
					flexDirection: 'column',
					gap: 2
				}}
			>
				{children}
			</Box>
			{footnote && (
				<Box sx={{ mx: 3, py: 1.5, pr: '104px', borderTop: 1, borderColor: 'divider' }}>
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{footnote}</Typography>
				</Box>
			)}
		</Paper>
	);
}

export default WidgetCard;
