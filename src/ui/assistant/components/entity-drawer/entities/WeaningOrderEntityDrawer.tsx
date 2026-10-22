import { Divider, Stack } from '@mui/material';
import { useWeaningOrder } from '@/features/weaning-orders/hooks/useWeaningOrder';
import TransferOrderStatusChip from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import TransferOrderHistoryTimeline from '@/ui/transfer-orders/components/detail/TransferOrderHistoryTimeline';
import WeaningOrderDetailSummary from '@/ui/weaning-orders/components/detail/WeaningOrderDetailSummary';
import WeaningOrderRollTable from '@/ui/weaning-orders/components/detail/WeaningOrderRollTable';
import EntityDrawerShell from '../EntityDrawerShell';
import type { EntityDrawerProps } from './entityDrawerProps';

/** A weaning order's figures, calves and history. */
export function WeaningOrderEntityDrawer({ id, label, open, onClose, onNavigate }: EntityDrawerProps) {
	const { data: order, isLoading, isError } = useWeaningOrder(id);

	return (
		<EntityDrawerShell
			open={open}
			onClose={onClose}
			icon="heroicons-outline:clipboard-document-check"
			codeTitle
			title={order?.code ?? label ?? 'Orden de destete'}
			chip={order && <TransferOrderStatusChip status={order.status} />}
			subtitle={
				order
					? `Destete ${order.weaning_type_label?.toLowerCase() ?? 'sin tipo declarado'} · ${order.planned_head_count} cría(s) · ${order.kind_label}`
					: undefined
			}
			isLoading={isLoading}
			isError={isError}
			// The weaning list does not open an order from the URL yet.
			screen={{ route: '/weaning-orders', label: 'Abrir órdenes de destete' }}
			onNavigate={onNavigate}
		>
			{order && (
				<Stack spacing={2.5}>
					<WeaningOrderDetailSummary order={order} />
					<Divider />
					<WeaningOrderRollTable order={order} />
					<Divider />
					<TransferOrderHistoryTimeline history={order.history} />
				</Stack>
			)}
		</EntityDrawerShell>
	);
}

export default WeaningOrderEntityDrawer;
