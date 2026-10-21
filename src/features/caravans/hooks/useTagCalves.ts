import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import { BIRTH_ORDERS_KEY } from '@/features/birth-orders/hooks/useBirthOrders';
import type { TagCalvesPayload } from '@/core/caravans/domain/entities/UntaggedCalf';

const caravanRepository = new ApiCaravanRepository();

/** The calves of a batch still waiting for their tag ("Caravanear crías"). */
export function useUntaggedCalves(batchId: number | null | undefined) {
	return useQuery({
		queryKey: ['untagged-calves', batchId],
		queryFn: () => caravanRepository.listUntaggedCalves(batchId as number),
		enabled: batchId != null
	});
}

/**
 * Puts the tags on calves born without one. A 422 is left to the caller: it carries the errors
 * by row ("items.3.identification") for the sheet to mark.
 */
export function useTagCalves() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: TagCalvesPayload) => caravanRepository.tagCalves(payload),
		onSuccess: (_, payload) => {
			queryClient.invalidateQueries({ queryKey: ['untagged-calves'] });
			queryClient.invalidateQueries({ queryKey: ['caravans'] });
			queryClient.invalidateQueries({ queryKey: ['batches'] });
			queryClient.invalidateQueries({ queryKey: ['batch'] });
			queryClient.invalidateQueries({ queryKey: [BIRTH_ORDERS_KEY] });
			queryClient.invalidateQueries({ queryKey: ['births-history'] });
			toast.success(
				payload.items.length === 1 ? 'Cría caravaneada.' : `${payload.items.length} crías caravaneadas.`
			);
		}
	});
}
