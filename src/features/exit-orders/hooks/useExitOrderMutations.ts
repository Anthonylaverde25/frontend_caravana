import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/utils/axios';
import { BIRTH_ORDERS_KEY } from '@/features/birth-orders/hooks/useBirthOrders';
import {
	ExecuteExitOrderPayload,
	ExitDtePayload,
	ExitLineDeathPayload,
	ExitOrder,
	IssueExitOrderPayload,
	RegisterExitPayload,
	exitOrderErrorMessage
} from '../types';
import { EXIT_ORDERS_KEY } from './useExitOrders';

/** What an animal leaving the herd changes besides the order itself. */
const HERD_KEYS = [
	'caravans',
	'batches',
	'batch',
	'activities',
	'batch-weight-history',
	'caravan-movements',
	'service-orders',
	'untagged-calves',
	'death-batches',
	'partners'
];

const useInvalidate = () => {
	const queryClient = useQueryClient();

	return (alsoHerd = false) => {
		queryClient.invalidateQueries({ queryKey: [EXIT_ORDERS_KEY] });

		if (alsoHerd) {
			HERD_KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
			queryClient.invalidateQueries({ queryKey: [BIRTH_ORDERS_KEY] });
		}
	};
};

/**
 * "Emitir orden": commits the animals to the buyer until the load. A 422 is left to the caller
 * too, because its errors name rows of the grid.
 */
export function useIssueExitOrder() {
	const invalidate = useInvalidate();

	return useMutation({
		mutationFn: async (payload: IssueExitOrderPayload): Promise<ExitOrder> =>
			(await axiosInstance.post<ExitOrder>('/exit-orders', payload)).data,
		onSuccess: (order) => {
			invalidate();
			toast.success(`Orden ${order.code} emitida: ${order.planned_head_count} animales`);
		}
	});
}

/** "Guardar cambios" on an issued order nothing left with yet: the roll is replaced. */
export function useUpdateExitOrder() {
	const invalidate = useInvalidate();

	return useMutation({
		mutationFn: async ({ id, payload }: { id: number; payload: IssueExitOrderPayload }): Promise<ExitOrder> =>
			(await axiosInstance.put<ExitOrder>(`/exit-orders/${id}`, payload)).data,
		onSuccess: (order) => {
			invalidate();
			toast.success(`Orden ${order.code} actualizada`);
		}
	});
}

/** "Registrar egreso" and "Vender": the order is born executed. */
export function useRegisterExit() {
	const invalidate = useInvalidate();

	return useMutation({
		mutationFn: async (payload: RegisterExitPayload): Promise<ExitOrder> =>
			(await axiosInstance.post<ExitOrder>('/exit-orders/register', payload)).data,
		onSuccess: (order) => {
			invalidate(true);
			toast.success(`Egreso ${order.code} registrado: ${order.exited_count} animal(es)`);
		}
	});
}

/** One load of an issued order: the animals that went up on the truck. */
export function useExecuteExitOrder() {
	const invalidate = useInvalidate();

	return useMutation({
		mutationFn: async ({ id, payload }: { id: number; payload: ExecuteExitOrderPayload }): Promise<ExitOrder> =>
			(await axiosInstance.post<ExitOrder>(`/exit-orders/${id}/execute`, payload)).data,
		onSuccess: (order) => {
			invalidate(true);
			toast.success(
				order.status === 'EXECUTED'
					? `Orden ${order.code} ejecutada: salieron ${order.exited_count} animales`
					: `Salida registrada en ${order.code}: quedan ${order.pending_count} pendientes`
			);
		}
	});
}

export function useCloseExitOrder() {
	const invalidate = useInvalidate();

	return useMutation({
		mutationFn: async ({ id, reason }: { id: number; reason: string }): Promise<ExitOrder> =>
			(await axiosInstance.post<ExitOrder>(`/exit-orders/${id}/close`, { reason })).data,
		onSuccess: (order) => {
			invalidate();
			toast.success(`Orden ${order.code} cerrada incompleta`);
		},
		onError: (error) => toast.error(exitOrderErrorMessage(error, 'No se pudo cerrar la orden'))
	});
}

export function useCancelExitOrder() {
	const invalidate = useInvalidate();

	return useMutation({
		mutationFn: async ({ id, reason }: { id: number; reason: string }): Promise<ExitOrder> =>
			(await axiosInstance.post<ExitOrder>(`/exit-orders/${id}/cancel`, { reason })).data,
		onSuccess: (order) => {
			invalidate();
			toast.success(`Orden ${order.code} anulada`);
		},
		onError: (error) => toast.error(exitOrderErrorMessage(error, 'No se pudo anular la orden'))
	});
}

/** A DTE loaded later, at any time but on a cancelled order. The 422 goes to the dialog. */
export function useAddExitOrderDte() {
	const invalidate = useInvalidate();

	return useMutation({
		mutationFn: async ({ id, payload }: { id: number; payload: ExitDtePayload }): Promise<ExitOrder> =>
			(await axiosInstance.post<ExitOrder>(`/exit-orders/${id}/dtes`, payload)).data,
		onSuccess: (_, { payload }) => {
			invalidate();
			toast.success(`DTE ${payload.dte_number} cargado`);
		}
	});
}

export function useRemoveExitOrderDte() {
	const invalidate = useInvalidate();

	return useMutation({
		mutationFn: async ({ id, dteId }: { id: number; dteId: number }): Promise<void> => {
			await axiosInstance.delete(`/exit-orders/${id}/dtes/${dteId}`);
		},
		onSuccess: () => {
			invalidate();
			toast.success('DTE quitado');
		},
		onError: (error) => toast.error(exitOrderErrorMessage(error, 'No se pudo quitar el DTE'))
	});
}

/**
 * The death of an animal still pending in an order (01 §5.1): it leaves the roll and goes to the
 * death batch in one step. The 422 goes to the death dialog.
 */
export function useRegisterDeathOnExitLine() {
	const invalidate = useInvalidate();

	return useMutation({
		mutationFn: async ({
			id,
			caravanId,
			payload
		}: {
			id: number;
			caravanId: number;
			payload: ExitLineDeathPayload;
		}): Promise<ExitOrder> =>
			(await axiosInstance.post<ExitOrder>(`/exit-orders/${id}/animals/${caravanId}/death`, payload)).data,
		onSuccess: (order) => {
			invalidate(true);
			toast.success(
				order.status === 'CLOSED_INCOMPLETE'
					? `Muerte registrada. La orden ${order.code} se cerró: no le quedan pendientes`
					: 'Muerte registrada: el animal salió de la orden'
			);
		}
	});
}
