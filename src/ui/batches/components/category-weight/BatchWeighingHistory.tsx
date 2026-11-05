import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { WeighingHistoryRow } from './weighingHistoryModel';

interface BatchWeighingHistoryProps {
	rows: WeighingHistoryRow[];
	activeDay?: string | null;
	onHoverDay?: (day: string | null) => void;
}

/** The weights measured, newest first: a list ruled by hairlines, with no box around it. */
export function BatchWeighingHistory({ rows, activeDay = null, onHoverDay }: BatchWeighingHistoryProps) {
	return (
		<Box>
			<Typography
				component="h3"
				sx={{ fontSize: '0.75rem', lineHeight: '20px', fontWeight: 400, color: 'text.secondary', pb: 0.75 }}
			>
				Historial de pesajes
			</Typography>
			{rows.length === 0 && (
				<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>Todavía no hay pesajes.</Typography>
			)}
			{rows.map((row) => (
				<Box
					key={row.key}
					onMouseEnter={row.day ? () => onHoverDay?.(row.day) : undefined}
					onMouseLeave={row.day ? () => onHoverDay?.(null) : undefined}
					sx={{
						px: 0.75,
						py: 1,
						borderTop: 1,
						borderColor: 'divider',
						bgcolor: (theme) =>
							row.day && row.day === activeDay ? alpha(theme.palette.primary.main, 0.06) : 'transparent'
					}}
				>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1.5 }}>
						<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{row.label}</Typography>
						{row.kilos ? (
							<Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
								{row.kilos}
							</Typography>
						) : (
							<Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
								{row.note}
							</Typography>
						)}
					</Box>
					{row.lines.map((line) => (
						<Box
							key={line.key}
							sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: '3px', fontSize: '0.75rem' }}
						>
							<Box
								sx={{ width: 10, height: 3, borderRadius: '2px', bgcolor: line.color, flexShrink: 0 }}
							/>
							<Typography
								className="truncate"
								sx={{ flex: 1, minWidth: 0, fontSize: 'inherit', color: 'text.secondary' }}
							>
								{line.name}
							</Typography>
							<Typography sx={{ fontSize: 'inherit', color: 'text.secondary', whiteSpace: 'nowrap' }}>
								{line.cover}
							</Typography>
							<Typography
								sx={{
									width: 52,
									flexShrink: 0,
									textAlign: 'right',
									fontSize: 'inherit',
									fontWeight: 500
								}}
							>
								{line.value}
							</Typography>
						</Box>
					))}
				</Box>
			))}
		</Box>
	);
}

export default BatchWeighingHistory;
