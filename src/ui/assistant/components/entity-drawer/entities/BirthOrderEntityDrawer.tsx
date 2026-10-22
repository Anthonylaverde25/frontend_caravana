import { Divider, Stack } from '@mui/material';
import { useBirthOrder } from '@/features/birth-orders/hooks/useBirthOrder';
import BirthOrderDetailSummary from '@/ui/birth-orders/components/detail/BirthOrderDetailSummary';
import BirthOrderRollTable from '@/ui/birth-orders/components/detail/BirthOrderRollTable';
import TransferOrderStatusChip from '@/ui/transfer-orders/components/TransferOrderStatusChip';
import TransferOrderHistoryTimeline from '@/ui/transfer-orders/components/detail/TransferOrderHistoryTimeline';
import EntityDrawerShell from '../EntityDrawerShell';
import type { EntityDrawerProps } from './entityDrawerProps';

/** A birth order's figures, females and history. */
export function BirthOrderEntityDrawer({ id, label, open, onClose, onNavigate }: EntityDrawerProps) {
	const { data: order, isLoading, isError } = useBirthOrder(id);

	return (
		<EntityDrawerShell
			open={open}
			onClose={onClose}
			icon="heroicons-outline:sparkles"
			codeTitle
			title={order?.code ?? label ?? 'Orden de parición'}
			chip={order && <TransferOrderStatusChip status={order.status} />}
			subtitle={
				order
					? `${order.head_count} vientre(s) · ${order.resolved_head_count} resuelto(s) · ${order.kind_label}`
					: undefined
			}
			isLoading={isLoading}
			isError={isError}
			screen={{
				route: `/birth-orders?orderId=${id}`,
				label: 'Abrir en órdenes de parición'
			}}
			onNavigate={onNavigate}
		>
			{order && (
				<Stack spacing={2.5}>
					<BirthOrderDetailSummary order={order} />
					<Divider />
					<BirthOrderRollTable order={order} />
					<Divider />
					<TransferOrderHistoryTimeline history={order.history} />
				</Stack>
			)}
		</EntityDrawerShell>
	);
}

export default BirthOrderEntityDrawer;
