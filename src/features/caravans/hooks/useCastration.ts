import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import type { CastrationCandidates, RegisterCastrationPayload } from '@/core/caravans/domain/entities/Castration';

const caravanRepository = new ApiCaravanRepository();

/**
 * Castration candidates in a batch.
 */
export function useCastrationCandidates(batchId: number | null | undefined) {
	return useQuery<CastrationCandidates>({
		queryKey: ['castration-candidates', batchId],
		queryFn: () => caravanRepository.listCastrationCandidates(batchId as number),
		enabled: batchId != null
	});
}

/**
 * Registers castration for one or several animals.
 * A 422 carries field errors (items.N.*) for the dialog to mark.
 */
export function useRegisterCastration() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: RegisterCastrationPayload) => caravanRepository.registerCastration(payload),
		onSuccess: (_, payload) => {
			[
				'castration-candidates',
				'caravans',
				'caravans-summary',
				'batches',
				'batch',
				'batch-overview',
				'caravan-detail',
				'caravan-category-changes',
				'activities'
			].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));

			toast.success(
				payload.items.length === 1
					? 'Castración registrada.'
					: `${payload.items.length} castraciones registradas.`
			);
		}
	});
}

/**
 * Voids an active castration record.
 */
export function useVoidCastration() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, reason }: { id: number; reason?: string | null }) =>
			caravanRepository.voidCastration(id, reason),
		onSuccess: () => {
			[
				'castration-candidates',
				'caravans',
				'caravans-summary',
				'batches',
				'batch',
				'batch-overview',
				'caravan-detail',
				'caravan-category-changes',
				'activities'
			].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));

			toast.success('Castración anulada con éxito.');
		}
	});
}
