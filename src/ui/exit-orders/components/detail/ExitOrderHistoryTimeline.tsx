import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { EXIT_ORDER_STATUS_LABELS, ExitOrderHistoryEntry } from '@/features/exit-orders/types';
import { useExitOrderStatusColor } from '../ExitOrderStatusChip';
import { formatDateTime } from '../exitOrderFormat';

const describe = (entry: ExitOrderHistoryEntry): string => {
	const to = EXIT_ORDER_STATUS_LABELS[entry.to_status];

	if (entry.from_status === null) return to;

	return entry.from_status === entry.to_status ? to : `${EXIT_ORDER_STATUS_LABELS[entry.from_status]} → ${to}`;
};

/** What happened to the order, oldest first. The reason says what the state alone does not. */
export const ExitOrderHistoryTimeline: React.FC<{ history: ExitOrderHistoryEntry[] }> = ({ history }) => {
	const colors = useExitOrderStatusColor();

	return (
		<Box>
			<Typography
				variant="overline"
				sx={{ fontWeight: 800, color: 'text.secondary' }}
			>
				Historial
			</Typography>
			<Stack
				spacing={0}
				sx={{ mt: 0.5 }}
			>
				{history.map((entry, index) => (
					<Box
						key={entry.id}
						sx={{ display: 'flex', gap: 1.5 }}
					>
						<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.6 }}>
							<Box
								sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: colors[entry.to_status] }}
							/>
							{index < history.length - 1 && (
								<Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', my: 0.5 }} />
							)}
						</Box>
						<Box sx={{ pb: 1.5 }}>
							<Typography
								variant="body2"
								sx={{ fontWeight: 700 }}
							>
								{entry.reason && entry.from_status === entry.to_status ? entry.reason : describe(entry)}
							</Typography>
							<Typography
								variant="caption"
								color="text.secondary"
							>
								{formatDateTime(entry.created_at)}
								{entry.user ? ` · ${entry.user}` : ''}
							</Typography>
							{entry.reason && entry.from_status !== entry.to_status && (
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ fontStyle: 'italic' }}
								>
									«{entry.reason}»
								</Typography>
							)}
						</Box>
					</Box>
				))}
			</Stack>
		</Box>
	);
};

export default ExitOrderHistoryTimeline;
