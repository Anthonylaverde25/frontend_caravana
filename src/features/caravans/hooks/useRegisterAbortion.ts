import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';

const caravanRepository = new ApiCaravanRepository();

export interface RegisterAbortionPayload {
	caravanId: number;
	aborted_on: string;
	notes?: string | null;
	becomes_cow?: boolean;
}

/**
 * Registers an abortion for a pregnant female, optionally promoting a vaquillona to cow.
 */
export function useRegisterAbortion() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: RegisterAbortionPayload) =>
			caravanRepository.registerAbortion(payload.caravanId, {
				aborted_on: payload.aborted_on,
				notes: payload.notes,
				becomes_cow: payload.becomes_cow
			}),
		onSuccess: (_, payload) => {
			[
				'caravans',
				'caravans-summary',
				'caravan-detail',
				'caravan-category-changes',
				'batches',
				'batch',
				'batch-overview',
				'gestation-list',
				'birth-orders'
			].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));

			toast.success(
				payload.becomes_cow
					? 'Aborto registrado. La vaquillona pasó a Vaca de Rodeo General.'
					: 'Aborto registrado correctamente.'
			);
		}
	});
}

