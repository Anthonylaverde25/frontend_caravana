import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { useCompany } from '@/contexts/CompanyContext';
import type { CalfAtFoot, ExitOrder, ExitOrderSummary } from '../types';

export const EXIT_ORDERS_KEY = 'exit-orders';

/**
 * Every exit order of the company, newest first, without its roll. Filtering happens on screen:
 * the counts on the status pills need the whole list.
 */
export function useExitOrders() {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: [EXIT_ORDERS_KEY, activeCompanyId, 'list'],
		queryFn: async (): Promise<ExitOrderSummary[]> =>
			(await axiosInstance.get<ExitOrderSummary[]>('/exit-orders')).data,
		enabled: Boolean(activeCompanyId)
	});
}

/** One order with its roll, DTEs and history. Null id = nothing to load. */
export function useExitOrder(id: number | null) {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: [EXIT_ORDERS_KEY, activeCompanyId, 'detail', id],
		queryFn: async (): Promise<ExitOrder> => (await axiosInstance.get<ExitOrder>(`/exit-orders/${id}`)).data,
		enabled: Boolean(activeCompanyId) && id != null && id > 0
	});
}

/** The active exit batches: asked only when the company has more than one. */
export function useExitBatches(enabled = true) {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: [EXIT_ORDERS_KEY, activeCompanyId, 'exit-batches'],
		queryFn: async (): Promise<{ id: number; name: string }[]> =>
			(await axiosInstance.get<{ id: number; name: string }[]>('/exit-batches')).data,
		enabled: Boolean(activeCompanyId) && enabled
	});
}

/** The calves at foot of the cows of a load, so each cow can say whether hers leaves too (P1). */
export function useCalvesAtFoot(caravanIds: number[]) {
	const { activeCompanyId } = useCompany();
	const ids = [...caravanIds].sort((a, b) => a - b);

	return useQuery({
		queryKey: [EXIT_ORDERS_KEY, activeCompanyId, 'calves-at-foot', ids.join(',')],
		queryFn: async (): Promise<CalfAtFoot[]> =>
			(
				await axiosInstance.get<CalfAtFoot[]>('/exit-orders/calves-at-foot', {
					params: { caravan_ids: ids.join(',') }
				})
			).data,
		enabled: Boolean(activeCompanyId) && ids.length > 0,
		placeholderData: (previous) => previous
	});
}
