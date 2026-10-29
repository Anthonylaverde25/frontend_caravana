import React from 'react';
import { LinearProgress, Stack, TableCell, TableRow, Typography, alpha } from '@mui/material';
import type { ExitOrderSummary } from '@/features/exit-orders/types';
import { useTransferOrderTableStyles } from '@/ui/transfer-orders/components/transferOrderFormat';
import ExitOrderStatusChip, {
	ExitOrderRegisteredChip,
	WithoutDteChip,
	useExitOrderStatusColor
} from './ExitOrderStatusChip';
import { formatDate, formatDateTime, formatKg, formatMoney } from './exitOrderFormat';

interface ExitOrdersTableRowProps {
	order: ExitOrderSummary;
	position: number;
	isZebra: boolean;
	onOpen: (order: ExitOrderSummary) => void;
}

/** One order, in two-line cells: the fact in bold, what qualifies it underneath. */
export const ExitOrdersTableRow: React.FC<ExitOrdersTableRowProps> = ({ order, position, isZebra, onOpen }) => {
	const colors = useExitOrderStatusColor();
	const { bodyCell, primaryText, captionText, zebraBg, isDark } = useTransferOrderTableStyles();
	const color = colors[order.status];
	const progress = order.planned_head_count > 0 ? (order.exited_count / order.planned_head_count) * 100 : 0;

	return (
		<TableRow
			hover
			onClick={() => onOpen(order)}
			sx={{
				cursor: 'pointer',
				bgcolor: isZebra ? zebraBg : 'inherit',
				transition: 'background-color 0.15s ease'
			}}
		>
			<TableCell
				sx={{ ...bodyCell, textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}
			>
				{position}
			</TableCell>
			<TableCell sx={bodyCell}>
				<Typography
					sx={{
						fontFamily: 'monospace',
						fontWeight: 800,
						color: 'primary.main',
						fontSize: '0.85rem',
						lineHeight: 1.1
					}}
				>
					{order.code}
				</Typography>
				<Typography
					variant="caption"
					sx={captionText}
				>
					{order.kind === 'REGISTERED' ? 'Venta registrada' : `Emitida ${formatDateTime(order.emitted_at)}`}
				</Typography>
			</TableCell>
			<TableCell sx={{ ...bodyCell, maxWidth: 240 }}>
				<Typography
					sx={primaryText}
					noWrap
					title={order.buyer?.name ?? undefined}
				>
					{order.buyer?.name ?? '—'}
				</Typography>
				<Typography
					variant="caption"
					sx={captionText}
				>
					{order.reason_label}
				</Typography>
			</TableCell>
			<TableCell sx={{ ...bodyCell, whiteSpace: 'nowrap' }}>{formatDate(order.exit_date)}</TableCell>
			<TableCell sx={bodyCell}>
				<Stack
					direction="row"
					spacing={0.5}
					alignItems="center"
					flexWrap="wrap"
					useFlexGap
				>
					<ExitOrderStatusChip status={order.status} />
					{order.kind === 'REGISTERED' && <ExitOrderRegisteredChip />}
					{order.without_dte && <WithoutDteChip />}
				</Stack>
			</TableCell>
			<TableCell sx={bodyCell}>
				<Typography sx={primaryText}>
					{order.exited_count} / {order.planned_head_count} cab.
				</Typography>
				<LinearProgress
					variant="determinate"
					value={progress}
					sx={{
						my: 0.5,
						height: 5,
						borderRadius: 3,
						bgcolor: alpha(color, isDark ? 0.2 : 0.12),
						'& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 }
					}}
				/>
				{order.skipped_count > 0 && (
					<Typography
						variant="caption"
						sx={captionText}
					>
						{order.skipped_count} no salieron
					</Typography>
				)}
			</TableCell>
			<TableCell sx={{ ...bodyCell, textAlign: 'right', whiteSpace: 'nowrap' }}>
				{formatKg(order.total_weight_kg || null)}
			</TableCell>
			<TableCell sx={{ ...bodyCell, textAlign: 'right', whiteSpace: 'nowrap', borderRight: 0 }}>
				<Typography sx={primaryText}>{formatMoney(order.total_amount || null)}</Typography>
			</TableCell>
		</TableRow>
	);
};

export default ExitOrdersTableRow;
