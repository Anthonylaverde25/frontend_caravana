import { useBatch } from '@/features/batches/hooks/useBatch';
import { useServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import ServiceOrderDiagnosisPanel from '@/ui/gestation/components/service-order-drawer/ServiceOrderDiagnosisPanel';
import ServiceOrderObservations from '@/ui/gestation/components/service-order-drawer/ServiceOrderObservations';
import { ServiceOrderStatusCard } from '@/ui/gestation/components/service-order-drawer/ServiceOrderStatusCard';
import EntityDrawerShell from '../EntityDrawerShell';
import type { EntityDrawerProps } from './entityDrawerProps';

/** A service order's status and tacto progress; bulls and rounds are worked from its own drawer. */
export function ServiceOrderEntityDrawer({ id, label, open, onClose, onNavigate }: EntityDrawerProps) {
	const { data: order, isLoading, isError } = useServiceOrder(id);
	const { data: batch } = useBatch(order?.batch_id);

	return (
		<EntityDrawerShell
			open={open}
			onClose={onClose}
			icon="lucide:clipboard-check"
			codeTitle
			title={order?.code ?? label ?? 'Orden de servicio'}
			subtitle={
				order ? `Orden de servicio · lote ${batch?.name ?? order.batch_name ?? order.batch_id}` : undefined
			}
			isLoading={isLoading}
			isError={isError}
			screen={{
				route: `/gestation/service-orders?orderId=${id}`,
				label: 'Abrir en órdenes de servicio'
			}}
			onNavigate={onNavigate}
		>
			{order && (
				<>
					<ServiceOrderStatusCard
						order={order}
						batch={batch ?? null}
					/>
					<ServiceOrderDiagnosisPanel
						order={order}
						readOnly
					/>
					<ServiceOrderObservations observations={order.observations} />
				</>
			)}
		</EntityDrawerShell>
	);
}

export default ServiceOrderEntityDrawer;
