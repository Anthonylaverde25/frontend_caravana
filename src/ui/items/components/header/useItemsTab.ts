import { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { ItemCategory } from '@/core/items/domain/entities/ItemCategory';
import { pathOfTab, resolveFeaturedTabs, tabKeyFromSlug } from './itemTabs';

/**
 * The catalog's tab lives in the URL (semen S-A, DA1): `/items/{slug}` for a featured tab and
 * `/items?category={id}` for any other root. Returns the tab and the root category it filters by.
 */
export function useItemsTab(categories: ItemCategory[]) {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const [searchParams] = useSearchParams();
	const tabKey = tabKeyFromSlug(pathname.split('/')[2]);
	const otherId = tabKey === 'all' && searchParams.get('category') ? Number(searchParams.get('category')) : null;
	const resolved = useMemo(() => resolveFeaturedTabs(categories), [categories]);

	const rootCategoryId: number | '' =
		tabKey === 'all' ? (otherId ?? '') : (resolved.featured.find((t) => t.key === tabKey)?.category?.id ?? '');

	return {
		tabKey: otherId !== null ? 'other' : tabKey,
		otherId,
		rootCategoryId,
		resolved,
		selectTab: (key: string) => navigate(pathOfTab(key)),
		selectOther: (id: number) => navigate(`/items?category=${id}`)
	};
}
