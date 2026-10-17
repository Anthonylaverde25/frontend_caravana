import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { toast } from 'sonner';
import type { OpenExposuresByFemale, SanitaryExposureAlert } from '@/core/veterinary/domain/SanitaryExposure';

const KEY = 'sanitary-exposure-alerts';

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
	queryClient.invalidateQueries({ queryKey: [KEY] });
	queryClient.invalidateQueries({ queryKey: ['batches', 'overview'] });
}

export function useSanitaryExposureAlerts(status?: 'OPEN' | 'RESOLVED') {
	return useQuery<SanitaryExposureAlert[]>({
		queryKey: [KEY, 'list', status ?? 'ALL'],
		queryFn: async () => (await axiosInstance.get('/sanitary-exposure-alerts', { params: { status } })).data
	});
}

export function useSanitaryExposureAlert(alertId: number | null) {
	return useQuery<SanitaryExposureAlert>({
		queryKey: [KEY, 'detail', alertId],
		queryFn: async () => (await axiosInstance.get(`/sanitary-exposure-alerts/${alertId}`)).data,
		enabled: alertId !== null
	});
}

/** Open exposures of the given females, keyed by female id (pregnancy check grid). */
export function useOpenExposuresForFemales(femaleIds: number[]) {
	const sorted = [...femaleIds].sort((a, b) => a - b);

	return useQuery<OpenExposuresByFemale>({
		queryKey: [KEY, 'open-for-females', sorted],
		queryFn: async () =>
			(await axiosInstance.post('/sanitary-exposure-alerts/open-for-females', { female_caravan_ids: sorted })).data,
		enabled: sorted.length > 0
	});
}

export function useReviewExposedFemales() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ alertId, femaleIds, note }: { alertId: number; femaleIds: number[]; note?: string | null }) =>
			(
				await axiosInstance.post(`/sanitary-exposure-alerts/${alertId}/review-females`, {
					female_caravan_ids: femaleIds,
					note: note?.trim() || null
				})
			).data as { reviewed: number },
		onSuccess: (data) => {
			invalidate(queryClient);
			toast.success(data.reviewed === 1 ? '1 vientre marcado como revisado' : `${data.reviewed} vientres marcados como revisados`);
		},
		onError: (error: any) => toast.error(error.response?.data?.message || 'Error al marcar los vientres')
	});
}

export function useResolveSanitaryExposureAlert() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ alertId, resolution }: { alertId: number; resolution: string }) =>
			(await axiosInstance.post(`/sanitary-exposure-alerts/${alertId}/resolve`, { resolution })).data as SanitaryExposureAlert,
		onSuccess: () => {
			invalidate(queryClient);
			toast.success('Novedad sanitaria resuelta');
		},
		onError: (error: any) => toast.error(error.response?.data?.message || 'Error al resolver la novedad')
	});
}

export interface RetireServiceBullPayload {
	serviceOrderId: number;
	maleCaravanId: number;
	retirementDate: string;
	reason: string;
	destinationBatchId?: number | null;
	notes?: string | null;
}

/** Takes a bull out of a running service without a replacement. */
export function useRetireServiceBull() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: RetireServiceBullPayload) =>
			(
				await axiosInstance.post(`/service-orders/${payload.serviceOrderId}/retire-bull`, {
					male_caravan_id: payload.maleCaravanId,
					retirement_date: payload.retirementDate,
					reason: payload.reason,
					destination_batch_id: payload.destinationBatchId ?? null,
					notes: payload.notes?.trim() || null
				})
			).data as { remaining_active_bulls: number; warning: string | null },
		onSuccess: (data) => {
			invalidate(queryClient);
			queryClient.invalidateQueries({ queryKey: ['service-orders'] });
			queryClient.invalidateQueries({ queryKey: ['caravans'] });
			queryClient.invalidateQueries({ queryKey: ['batches'] });
			queryClient.invalidateQueries({ queryKey: ['batch'] });
			toast.success('Toro retirado del servicio');
			if (data.warning) toast.warning(data.warning);
		},
		onError: (error: any) => toast.error(error.response?.data?.message || 'Error al retirar el toro')
	});
}
