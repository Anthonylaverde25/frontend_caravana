import { Divider, Stack } from '@mui/material';
import { useExitOrder } from '@/features/exit-orders/hooks/useExitOrders';
import ExitOrderStatusChip from '@/ui/exit-orders/components/ExitOrderStatusChip';
import ExitOrderCategoryBalance from '@/ui/exit-orders/components/detail/ExitOrderCategoryBalance';
import ExitOrderDetailSummary from '@/ui/exit-orders/components/detail/ExitOrderDetailSummary';
import ExitOrderDteList from '@/ui/exit-orders/components/detail/ExitOrderDteList';
import ExitOrderHistoryTimeline from '@/ui/exit-orders/components/detail/ExitOrderHistoryTimeline';
import ExitOrderRollTable from '@/ui/exit-orders/components/detail/ExitOrderRollTable';
import EntityDrawerShell from '../EntityDrawerShell';
import type { EntityDrawerProps } from './entityDrawerProps';

/** An exit order's figures, balance by category, animals, DTEs and history; read only. */
export function ExitOrderEntityDrawer({ id, label, open, onClose, onNavigate }: EntityDrawerProps) {
	const { data: order, isLoading, isError } = useExitOrder(id);

	return (
		<EntityDrawerShell
			open={open}
			onClose={onClose}
			icon="heroicons-outline:arrow-up-tray"
			codeTitle
			title={order?.code ?? label ?? 'Orden de egreso'}
			chip={order && <ExitOrderStatusChip status={order.status} />}
			subtitle={order ? `${order.reason_label} · ${order.buyer?.name ?? 'sin comprador'}` : undefined}
			isLoading={isLoading}
			isError={isError}
			screen={{
				route: `/exit-orders?orderId=${id}`,
				label: 'Abrir en órdenes de egreso'
			}}
			onNavigate={onNavigate}
		>
			{order && (
				<Stack spacing={2.5}>
					<ExitOrderDetailSummary order={order} />
					<ExitOrderCategoryBalance order={order} />
					<Divider />
					<ExitOrderRollTable order={order} />
					<Divider />
					<ExitOrderDteList order={order} />
					<Divider />
					<ExitOrderHistoryTimeline history={order.history} />
				</Stack>
			)}
		</EntityDrawerShell>
	);
}

export default ExitOrderEntityDrawer;
