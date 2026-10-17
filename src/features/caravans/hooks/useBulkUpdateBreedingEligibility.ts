import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { toast } from 'sonner';
import type { BreedingExclusionReasonCode } from '@/core/caravans/domain/entities/BreedingExclusionReason';

export interface BulkUpdateBreedingEligibilityPayload {
	caravanIds: number[];
	isEligible: boolean;
	reason?: BreedingExclusionReasonCode | null;
	note?: string | null;
}

export interface BreedingEligibilityWarning {
	caravan_id: number;
	caravana: string;
	message: string;
}

export interface BulkUpdateBreedingEligibilityResponse {
	updated: number;
	/** Animals still working in an active service: the decision applies from the next one. */
	warnings: BreedingEligibilityWarning[];
}

/**
 * useBulkUpdateBreedingEligibility
 *
 * The owner marks or unmarks one or many animals as fit for breeding.
 * Sends a POST request to /caravans/bulk-breeding-eligibility.
 */
export function useBulkUpdateBreedingEligibility() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: BulkUpdateBreedingEligibilityPayload): Promise<BulkUpdateBreedingEligibilityResponse> => {
			const response = await axiosInstance.post('/caravans/bulk-breeding-eligibility', {
				caravan_ids: payload.caravanIds,
				is_eligible: payload.isEligible,
				reason: payload.isEligible ? null : (payload.reason ?? null),
				note: payload.isEligible ? null : payload.note?.trim() || null
			});
			return response.data;
		},
		onSuccess: (data, payload) => {
			queryClient.invalidateQueries({ queryKey: ['caravans'] });
			queryClient.invalidateQueries({ queryKey: ['batch'] });
			const what = data.updated === 1 ? '1 animal' : `${data.updated} animales`;
			toast.success(payload.isEligible ? `${what} habilitado(s) para reproducción` : `${what} excluido(s) de reproducción`);
			data.warnings.forEach((warning) => toast.warning(warning.message));
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Error al actualizar la aptitud reproductiva');
		}
	});
}
