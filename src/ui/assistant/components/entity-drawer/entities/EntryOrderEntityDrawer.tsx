import { Divider, Stack } from '@mui/material';
import { useEntryOrder } from '@/features/entry-orders/hooks/useEntryOrders';
import EntryOrderStatusChip from '@/ui/entry-orders/components/EntryOrderStatusChip';
import EntryTroopSummaryCard from '@/ui/entry-orders/components/EntryTroopSummaryCard';
import EntryOrderHistoryTimeline from '@/ui/entry-orders/components/detail/EntryOrderHistoryTimeline';
import EntryOrderReceiptSheetList from '@/ui/entry-orders/components/detail/EntryOrderReceiptSheetList';
import { troopItemsOf } from '@/ui/entry-orders/components/troopItems';
import EntityDrawerShell from '../EntityDrawerShell';
import type { EntityDrawerProps } from './entityDrawerProps';

/** An entry order's troop, receipt sheets and history; DTEs and reception are worked on its screen. */
export function EntryOrderEntityDrawer({ id, label, open, onClose, onNavigate }: EntityDrawerProps) {
	const { data: order, isLoading, isError } = useEntryOrder(id);

	return (
		<EntityDrawerShell
			open={open}
			onClose={onClose}
			icon="heroicons-outline:truck"
			codeTitle
			title={order?.code ?? label ?? 'Orden de ingreso'}
			chip={
				order && (
					<EntryOrderStatusChip
						status={order.status}
						progress={order}
					/>
				)
			}
			subtitle={order ? `N° ${order.number} · ${order.kind_label}` : undefined}
			isLoading={isLoading}
			isError={isError}
			screen={{
				route: `/entry-orders?orderId=${id}`,
				label: 'Abrir en órdenes de ingreso'
			}}
			onNavigate={onNavigate}
		>
			{order && (
				<Stack spacing={2.5}>
					<EntryTroopSummaryCard
						title="Tropa comprada"
						subtitle={order.observations ?? undefined}
						items={troopItemsOf(order)}
					/>
					<EntryOrderReceiptSheetList order={order} />
					<Divider />
					<EntryOrderHistoryTimeline history={order.history} />
				</Stack>
			)}
		</EntityDrawerShell>
	);
}

export default EntryOrderEntityDrawer;
