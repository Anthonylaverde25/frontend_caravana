import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import type { ServiceMethod, ServiceOrder } from './useServiceOrders';

export interface IssueLotPayload {
	batch_id: number;
	service_type: 'single' | 'multi' | 'rotation';
	is_controlled_service: boolean;
	male_caravan_ids: number[];
	/** Absent in a natural service: every empty female of the batch. */
	selected_female_caravan_ids?: number[];
	planned_semen?: { female_caravan_id: number; item_id: number }[];
}

export interface IssueServiceOrdersPayload {
	service_method: ServiceMethod;
	start_date: string;
	end_date?: string | null;
	observations?: string | null;
	lots: IssueLotPayload[];
}

export interface RegisterBullStayPayload {
	male_caravan_id: number;
	origin_batch_id: number | '';
	joined_at: string;
	retired_at: string;
	destination_batch_id: number | '';
}

export interface RegisterServiceOrdersPayload {
	service_method: ServiceMethod;
	start_date: string;
	end_date: string;
	observations?: string | null;
	lots: { batch_id: number; female_caravan_ids: number[]; bulls: RegisterBullStayPayload[] }[];
}

export interface BullLocation {
	caravan_id: number;
	/** Where its movements put it on the day asked. */
	batch_id: number | null;
	current_batch_id: number | null;
	/** It moved after the service: the batch it is in today does not change. */
	moved_after: boolean;
}

export interface UpdatePlannedPayload {
	start_date: string;
	end_date: string | null;
	observations: string | null;
	male_caravan_ids: number[];
}

function useRefreshOrders() {
	const queryClient = useQueryClient();

	return () => {
		queryClient.invalidateQueries({ queryKey: ['service-orders'] });
		queryClient.invalidateQueries({ queryKey: ['batches'] });
		queryClient.invalidateQueries({ queryKey: ['caravans'] });
		queryClient.invalidateQueries({ queryKey: ['gestation'] });
	};
}

/** "Nueva orden": one order per batch; today or earlier starts it, a future day leaves it planned. */
export function useIssueServiceOrders() {
	const refresh = useRefreshOrders();

	return useMutation({
		mutationFn: async (payload: IssueServiceOrdersPayload) => {
			const response = await axiosInstance.post('/service-orders/issue', payload);
			return response.data as { orders: ServiceOrder[]; planned: boolean; warnings: string[] };
		},
		onSuccess: refresh
	});
}

/** "Registrar orden": services that already ended in the field. */
export function useRegisterServiceOrders() {
	const refresh = useRefreshOrders();

	return useMutation({
		mutationFn: async (payload: RegisterServiceOrdersPayload) => {
			const response = await axiosInstance.post('/service-orders/register', payload);
			return response.data as { orders: ServiceOrder[] };
		},
		onSuccess: refresh
	});
}

export function useStartPlannedServiceOrder() {
	const refresh = useRefreshOrders();

	return useMutation({
		mutationFn: async ({ id, startDate }: { id: number; startDate: string }) => {
			const response = await axiosInstance.post(`/service-orders/${id}/start`, { start_date: startDate });
			return response.data as { order: ServiceOrder; warnings: string[] };
		},
		onSuccess: refresh
	});
}

export function useUpdatePlannedServiceOrder() {
	const refresh = useRefreshOrders();

	return useMutation({
		mutationFn: async ({ id, payload }: { id: number; payload: UpdatePlannedPayload }) => {
			const response = await axiosInstance.patch(`/service-orders/${id}/planned`, payload);
			return response.data as { order: ServiceOrder; warnings: string[] };
		},
		onSuccess: refresh
	});
}

/** Where a bull was on a day, to fill in its trip through a registered service. */
export async function fetchBullLocation(
	caravanId: number,
	onDay: string,
	movedAfter: string
): Promise<BullLocation | null> {
	const response = await axiosInstance.get('/service-orders/bull-locations', {
		params: { caravan_ids: [caravanId], on_day: onDay, moved_after: movedAfter }
	});
	return (response.data.locations as BullLocation[])[0] ?? null;
}

/** A female that still owes her tacto to an open order. */
export interface PendingTactoFemale {
	caravan_id: number;
	order_id: number;
	order_code: string;
}

/** Who owes a tacto, by female: picked one by one she waits for it; in a natural service the sheet warns. */
export function usePendingTactoFemales(enabled: boolean) {
	return useQuery({
		queryKey: ['service-orders', 'pending-tacto-females'],
		enabled,
		queryFn: async () => {
			const response = await axiosInstance.get('/service-orders/pending-tacto-females');
			return new Map(
				(response.data.females as PendingTactoFemale[]).map((female) => [female.caravan_id, female])
			);
		}
	});
}
