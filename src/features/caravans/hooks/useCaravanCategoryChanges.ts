import { useQuery } from '@tanstack/react-query';
import { ApiCaravanRepository } from '@/core/caravans/infrastructure/repositories/ApiCaravanRepository';
import type { CategoryChange } from '@/core/caravans/domain/entities/Castration';

const caravanRepository = new ApiCaravanRepository();

/**
 * Historical category changes of a caravan.
 */
export function useCaravanCategoryChanges(caravanId: number | null | undefined, enabled = true) {
	return useQuery<CategoryChange[]>({
		queryKey: ['caravan-category-changes', caravanId],
		queryFn: () => caravanRepository.listCategoryChanges(caravanId as number),
		enabled: Boolean(enabled && caravanId != null)
	});
}

