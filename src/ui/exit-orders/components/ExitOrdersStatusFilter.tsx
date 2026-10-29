import React from 'react';
import { Box, Button, alpha, useTheme } from '@mui/material';
import { EXIT_ORDER_STATUS_LABELS, ExitOrderStatus } from '@/features/exit-orders/types';
import { useExitOrderStatusColor } from './ExitOrderStatusChip';

export type ExitOrderFilterValue = ExitOrderStatus | 'ALL' | 'OPEN' | 'WITHOUT_DTE';

interface ExitOrdersStatusFilterProps {
	value: ExitOrderFilterValue;
	onChange: (value: ExitOrderFilterValue) => void;
	counts: Record<ExitOrderFilterValue, number>;
}

const ORDER: ExitOrderFilterValue[] = [
	'ALL',
	'OPEN',
	'ISSUED',
	'PARTIAL',
	'EXECUTED',
	'CLOSED_INCOMPLETE',
	'CANCELLED',
	'WITHOUT_DTE'
];

const labelOf = (id: ExitOrderFilterValue): string =>
	id === 'ALL'
		? 'Todas'
		: id === 'OPEN'
			? 'Abiertas'
			: id === 'WITHOUT_DTE'
				? 'Sin DTE'
				: EXIT_ORDER_STATUS_LABELS[id];

/**
 * Segmented pills with their counts. "Abiertas" are the orders still waiting for a load; "Sin DTE"
 * the ones whose animals left without the document loaded.
 */
export const ExitOrdersStatusFilter: React.FC<ExitOrdersStatusFilterProps> = ({ value, onChange, counts }) => {
	const theme = useTheme();
	const colors = useExitOrderStatusColor();
	const isDark = theme.palette.mode === 'dark';
	const neutral = isDark ? '#60a5fa' : '#0a6ed1';

	const colorOf = (id: ExitOrderFilterValue): string =>
		id === 'ALL' || id === 'OPEN' ? neutral : id === 'WITHOUT_DTE' ? theme.palette.warning.main : colors[id];

	return (
		<Box
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 0.25,
				p: 0.25,
				borderRadius: '8px',
				border: '1px solid',
				borderColor: 'divider',
				bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
				overflowX: 'auto',
				maxWidth: '100%'
			}}
		>
			{ORDER.map((id) => {
				const isSelected = value === id;
				const color = colorOf(id);

				return (
					<Button
						key={id}
						size="small"
						onClick={() => onChange(id)}
						sx={{
							minWidth: 0,
							px: 1.25,
							height: 26,
							borderRadius: '6px',
							fontSize: '0.72rem',
							fontWeight: isSelected ? 700 : 500,
							textTransform: 'none',
							whiteSpace: 'nowrap',
							color: isSelected ? color : isDark ? '#94a3b8' : '#64748b',
							bgcolor: isSelected ? alpha(color, 0.12) : 'transparent',
							'&:hover': {
								bgcolor: isSelected ? alpha(color, 0.16) : isDark ? 'rgba(255,255,255,0.07)' : '#edf1f5'
							}
						}}
					>
						{labelOf(id)} ({counts[id] ?? 0})
					</Button>
				);
			})}
		</Box>
	);
};

export default ExitOrdersStatusFilter;
