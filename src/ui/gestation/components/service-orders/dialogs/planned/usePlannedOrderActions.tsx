import { useState } from 'react';
import { toast } from 'sonner';
import { useUpdateServiceOrderStatus, type ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import EditPlannedOrderDialog from './EditPlannedOrderDialog';
import StartPlannedOrderDialog from './StartPlannedOrderDialog';

/** What a planned order can do, wherever it is listed: start, change or cancel. */
export function usePlannedOrderActions(order: ServiceOrder) {
	const [dialog, setDialog] = useState<'start' | 'edit' | null>(null);
	const updateStatus = useUpdateServiceOrderStatus();

	const cancel = async () => {
		if (!window.confirm(`¿Cancelar la orden planificada ${order.code}?`)) return;

		try {
			await updateStatus.mutateAsync({ id: order.id, status: 'CANCELLED' });
			toast.success(`Orden ${order.code} cancelada`);
		} catch (error) {
			const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
			toast.error(message ?? 'No se pudo cancelar la orden.');
		}
	};

	return {
		openStart: () => setDialog('start'),
		openEdit: () => setDialog('edit'),
		cancel,
		isCancelling: updateStatus.isPending,
		dialogs:
			dialog === null ? null : (
				<>
					<StartPlannedOrderDialog
						order={order}
						open={dialog === 'start'}
						onClose={() => setDialog(null)}
					/>
					<EditPlannedOrderDialog
						order={order}
						open={dialog === 'edit'}
						onClose={() => setDialog(null)}
					/>
				</>
			)
	};
}
