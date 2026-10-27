import { SemenInventoryFilters } from '@/core/semen/domain/repositories/ISemenRepository';

/** Semen stock hangs from the 'items' prefix: every stock invalidation refreshes it too. */
export const semenKeys = {
	all: (companyId: number | null) => ['items', companyId, 'semen'] as const,
	inventory: (companyId: number | null, filters: SemenInventoryFilters) => ['items', companyId, 'semen', 'inventory', filters] as const,
	lots: (companyId: number | null, itemId: number, warehouseId: number) => ['items', companyId, 'semen', 'lots', itemId, warehouseId] as const,
	lot: (companyId: number | null, id: number) => ['items', companyId, 'semen', 'lot', id] as const,
	unidentified: (companyId: number | null, itemId?: number, warehouseId?: number) =>
		['items', companyId, 'semen', 'unidentified', itemId ?? null, warehouseId ?? null] as const,
	sires: (companyId: number | null) => ['semen-sires', companyId] as const
};
