import { useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';

export interface CategoryWeightItem {
	key: string;
	name: string;
	sex: 'H' | 'M' | 'BOTH';
	headCount: number;
	weighedCount: number;
	avgWeight: number;
	totalBiomass: number;
	minWeight: number;
	maxWeight: number;
	coveragePct: number;
	order: number;
}

export interface HerdWeightSummary {
	categories: CategoryWeightItem[];
	totalHeads: number;
	totalWeighed: number;
	totalBiomass: number;
	overallAvgWeight: number;
	overallCoveragePct: number;
	isLoading: boolean;
	hasData: boolean;
}

const CATEGORY_ORDER_MAP: Record<string, number> = {
	TERNERO: 1,
	TERNERA: 1,
	VAQUILLONA: 2,
	NOVILLITO: 3,
	NOVILLO: 4,
	VACA: 5,
	TORO: 6,
	TORITO: 6,
	BUEY: 7
};

function resolveCategoryOrder(name: string): number {
	const upper = name.toUpperCase();
	for (const [key, order] of Object.entries(CATEGORY_ORDER_MAP)) {
		if (upper.includes(key)) return order;
	}
	return 99;
}

export function useCategoryWeightsData(): HerdWeightSummary {
	const { activeCompanyId } = useCompany();
	const { data: caravans = [], isLoading } = useCaravans(activeCompanyId, 'all');

	return useMemo(() => {
		const activeCaravans = caravans.filter((c) => !c.isDead() && !c.hasLeft());

		if (activeCaravans.length === 0) {
			return {
				categories: [],
				totalHeads: 0,
				totalWeighed: 0,
				totalBiomass: 0,
				overallAvgWeight: 0,
				overallCoveragePct: 0,
				isLoading,
				hasData: false
			};
		}

		interface Accumulator {
			name: string;
			sex: 'H' | 'M' | 'BOTH';
			headCount: number;
			weights: number[];
		}

		const grouped = new Map<string, Accumulator>();

		activeCaravans.forEach((c) => {
			const catName = c.category_name || c.category || 'Sin categoría';
			const sex = (c.sex || '').toUpperCase() as 'H' | 'M';
			const weight = c.current_weight ?? c.entry_weight ?? null;

			const existing = grouped.get(catName);
			if (!existing) {
				grouped.set(catName, {
					name: catName,
					sex: sex || 'BOTH',
					headCount: 1,
					weights: weight !== null && weight > 0 ? [weight] : []
				});
			} else {
				existing.headCount++;
				if (weight !== null && weight > 0) {
					existing.weights.push(weight);
				}
			}
		});

		let totalHeads = 0;
		let totalWeighed = 0;
		let totalBiomass = 0;

		const categories: CategoryWeightItem[] = Array.from(grouped.entries()).map(([catName, acc]) => {
			totalHeads += acc.headCount;
			const weighedCount = acc.weights.length;
			totalWeighed += weighedCount;

			const biomass = acc.weights.reduce((sum, w) => sum + w, 0);
			totalBiomass += biomass;

			const avgWeight = weighedCount > 0 ? Number((biomass / weighedCount).toFixed(1)) : 0;
			const minWeight = weighedCount > 0 ? Math.min(...acc.weights) : 0;
			const maxWeight = weighedCount > 0 ? Math.max(...acc.weights) : 0;
			const coveragePct = acc.headCount > 0 ? Number(((weighedCount / acc.headCount) * 100).toFixed(1)) : 0;

			return {
				key: catName.toLowerCase().replace(/\s+/g, '_'),
				name: catName,
				sex: acc.sex,
				headCount: acc.headCount,
				weighedCount,
				avgWeight,
				totalBiomass: Math.round(biomass),
				minWeight: Math.round(minWeight),
				maxWeight: Math.round(maxWeight),
				coveragePct,
				order: resolveCategoryOrder(catName)
			};
		});

		// Sort by biological zootechnical progression
		categories.sort((a, b) => {
			if (a.order !== b.order) return a.order - b.order;
			return a.avgWeight - b.avgWeight;
		});

		const overallAvgWeight = totalWeighed > 0 ? Number((totalBiomass / totalWeighed).toFixed(1)) : 0;
		const overallCoveragePct = totalHeads > 0 ? Number(((totalWeighed / totalHeads) * 100).toFixed(1)) : 0;

		return {
			categories,
			totalHeads,
			totalWeighed,
			totalBiomass,
			overallAvgWeight,
			overallCoveragePct,
			isLoading,
			hasData: categories.length > 0
		};
	}, [caravans, isLoading]);
}
