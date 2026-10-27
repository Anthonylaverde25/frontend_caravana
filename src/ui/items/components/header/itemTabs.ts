import { ItemCategory } from '@/core/items/domain/entities/ItemCategory';

/** The featured tabs of the catalog and their URL slug (`/items/{slug}`, semen S-A DA1). */
export interface FeaturedTabDef {
	key: string;
	slug: string;
	label: string;
	isMatch: (c: ItemCategory) => boolean;
}

export const FEATURED_TABS: FeaturedTabDef[] = [
	{
		key: 'livestock_treatment',
		slug: 'livestock-treatment',
		label: 'Tratamientos de ganado',
		isMatch: (c) => c.code === 'LIVESTOCK_TREATMENT' || c.code === 'HEALTH' || /tratamiento.*ganado|sanidad/i.test(c.name)
	},
	{
		key: 'feed',
		slug: 'feed',
		label: 'Alimentación',
		isMatch: (c) => c.code === 'FEED' || c.code === 'NUTRITION' || /alimento|nutrici|alimentaci/i.test(c.name)
	},
	{
		key: 'paddock_treatment',
		slug: 'paddock-treatment',
		label: 'Tratamientos de potreros',
		isMatch: (c) => c.code === 'PADDOCK_TREATMENT' || /potrero/i.test(c.name)
	},
	{ key: 'semen', slug: 'semen', label: 'Semen', isMatch: (c) => c.code === 'SEMEN' || /semen/i.test(c.name) },
	{ key: 'embryo', slug: 'embryo', label: 'Embrión', isMatch: (c) => c.code === 'EMBRYO' || /embri/i.test(c.name) }
];

export const SEMEN_TAB = 'semen';

export interface ResolvedTab extends FeaturedTabDef {
	/** The root that backs the tab: when several match, the one with more items. */
	category: ItemCategory | null;
	allMatchedIds: number[];
}

/** Featured tabs with their root category, and the roots no tab claims ("Otras categorías"). */
export function resolveFeaturedTabs(categories: ItemCategory[]): { featured: ResolvedTab[]; others: ItemCategory[] } {
	const roots = categories.filter((c) => c.parentId === null);
	const claimed = new Set<number>();
	const featured = FEATURED_TABS.map((def) => {
		const matching = roots.filter((r) => def.isMatch(r));
		matching.forEach((m) => claimed.add(m.id));
		const primary = [...matching].sort((a, b) => (b.itemsCount ?? 0) - (a.itemsCount ?? 0))[0] ?? null;
		return { ...def, category: primary, allMatchedIds: matching.map((m) => m.id) };
	});

	return { featured, others: roots.filter((r) => !claimed.has(r.id)) };
}

export const tabKeyFromSlug = (slug: string | undefined): string => FEATURED_TABS.find((t) => t.slug === slug)?.key ?? 'all';

export const pathOfTab = (key: string): string => {
	const tab = FEATURED_TABS.find((t) => t.key === key);
	return tab ? `/items/${tab.slug}` : '/items';
};
