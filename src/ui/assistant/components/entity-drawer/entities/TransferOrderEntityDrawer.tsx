import { Divider, Stack } from '@mui/material';
import { useTransferOrder } from '@/features/transfer-orders/hooks/useTransferOrder';
import TransferOrderStatusChip from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import TransferOrderDetailSummary from '@/ui/transfer-orders/components/detail/TransferOrderDetailSummary';
import TransferOrderHistoryTimeline from '@/ui/transfer-orders/components/detail/TransferOrderHistoryTimeline';
import TransferOrderRollTable from '@/ui/transfer-orders/components/detail/TransferOrderRollTable';
import EntityDrawerShell from '../EntityDrawerShell';
import type { EntityDrawerProps } from './entityDrawerProps';

/** A transfer order's figures, animals and history. */
export function TransferOrderEntityDrawer({ id, label, open, onClose, onNavigate }: EntityDrawerProps) {
	const { data: order, isLoading, isError } = useTransferOrder(id);

	return (
		<EntityDrawerShell
			open={open}
			onClose={onClose}
			icon="heroicons-outline:clipboard-document-check"
			codeTitle
			title={order?.code ?? label ?? 'Orden de transferencia'}
			chip={order && <TransferOrderStatusChip status={order.status} />}
			subtitle={
				order
					? `${order.source_activity_name} → ${order.destination_activity.name} · lote ${order.source_batch.name}`
					: undefined
			}
			isLoading={isLoading}
			isError={isError}
			screen={{
				route: `/transfer-orders?orderId=${id}`,
				label: 'Abrir en órdenes de transferencia'
			}}
			onNavigate={onNavigate}
		>
			{order && (
				<Stack spacing={2.5}>
					<TransferOrderDetailSummary order={order} />
					<Divider />
					<TransferOrderRollTable order={order} />
					<Divider />
					<TransferOrderHistoryTimeline history={order.history} />
				</Stack>
			)}
		</EntityDrawerShell>
	);
}

export default TransferOrderEntityDrawer;
