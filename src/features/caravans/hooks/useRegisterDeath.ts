import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import { BIRTH_ORDERS_KEY } from '@/features/birth-orders/hooks/useBirthOrders';
import type { RegisterDeathPayload } from '@/core/caravans/domain/entities/Death';

const caravanRepository = new ApiCaravanRepository();

/** The active causes of death of the company. */
export function useDeathCauses(enabled = true) {
	return useQuery({
		queryKey: ['death-causes'],
		queryFn: () => caravanRepository.listDeathCauses(),
		enabled,
		staleTime: 1000 * 60 * 10
	});
}

/** The active death batches: one goes by itself, several are chosen, none creates one. */
export function useDeathBatches(enabled = true) {
	return useQuery({
		queryKey: ['death-batches'],
		queryFn: () => caravanRepository.listDeathBatches(),
		enabled
	});
}

/**
 * Registers the death of one or several animals. A 422 is left to the caller: it carries the errors
 * by animal ("caravan_ids.2") for the list to mark.
 */
export function useRegisterDeath() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: RegisterDeathPayload) => caravanRepository.registerDeath(payload),
		onSuccess: (_, payload) => {
			[
				'caravans',
				'batches',
				'batch',
				'untagged-calves',
				'births-history',
				'death-batches',
				'service-orders',
				'activities',
				'caravan-movements'
			].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
			queryClient.invalidateQueries({ queryKey: [BIRTH_ORDERS_KEY] });
			toast.success(
				payload.caravan_ids.length === 1
					? 'Muerte registrada.'
					: `${payload.caravan_ids.length} muertes registradas.`
			);
		}
	});
}
