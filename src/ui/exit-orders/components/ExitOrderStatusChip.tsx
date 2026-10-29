import React from 'react';
import { Chip, alpha, useTheme } from '@mui/material';
import { EXIT_ORDER_STATUS_LABELS, ExitOrderStatus } from '@/features/exit-orders/types';

/** One color per state, the same in the tray, the drawer and the herd. */
export const useExitOrderStatusColor = (): Record<ExitOrderStatus, string> => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	return {
		ISSUED: isDark ? '#60a5fa' : '#0a6ed1',
		PARTIAL: isDark ? '#fb923c' : '#e6600d',
		EXECUTED: isDark ? '#34d399' : '#107e3e',
		CLOSED_INCOMPLETE: isDark ? '#fbbf24' : '#a16207',
		CANCELLED: isDark ? '#94a3b8' : '#64748b'
	};
};

const chipSx = (color: string) => ({
	fontWeight: 700,
	fontSize: '0.7rem',
	letterSpacing: '0.3px',
	textTransform: 'uppercase',
	color,
	bgcolor: alpha(color, 0.1),
	border: `1px solid ${alpha(color, 0.3)}`,
	borderRadius: '6px'
});

export const ExitOrderStatusChip: React.FC<{ status: ExitOrderStatus }> = ({ status }) => (
	<Chip
		size="small"
		label={EXIT_ORDER_STATUS_LABELS[status]}
		sx={chipSx(useExitOrderStatusColor()[status])}
	/>
);

/** Loaded after the animals already left: it never went through "Emitida". */
export const ExitOrderRegisteredChip: React.FC = () => (
	<Chip
		size="small"
		variant="outlined"
		label="Registrada"
		sx={{ fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.3px', textTransform: 'uppercase' }}
	/>
);

/** Animals left and no DTE was loaded: a reminder, never a block. */
export const WithoutDteChip: React.FC = () => {
	const theme = useTheme();

	return (
		<Chip
			size="small"
			label="Sin DTE"
			sx={chipSx(theme.palette.warning.main)}
		/>
	);
};

export default ExitOrderStatusChip;
