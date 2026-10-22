import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Box, Button, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useItems } from '@/features/items/hooks/useItems';
import { useItemCategories } from '@/features/items/hooks/useItemCategories';
import { buildTree, CategoryNode } from '@/core/items/domain/rules/categoryTree';
import ItemsToolbar, { BehaviorFilter } from '../components/list/ItemsToolbar';
import ItemsGrid from '../components/list/ItemsGrid';
import ItemFormDialog from '../components/dialogs/ItemFormDialog';
import ItemsCategorySubheader from '../components/header/ItemsCategorySubheader';
import { settingsSectionPath } from '@/ui/settings/config/settingsNavigation';

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * The company's catalog of articles and services. Search and behavior filter run on the loaded
 * list so the toggle counts stay right; category and state go to the backend.
 */
export default function ItemsView() {
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const { activeCompanyId, companies } = useCompany();
	const [search, setSearch] = useState('');
	const [behavior, setBehavior] = useState<BehaviorFilter>('ALL');
	const [rootCategoryId, setRootCategoryId] = useState<number | ''>('');
	const [subcategoryId, setSubcategoryId] = useState<number | ''>('');
	const [includeInactive, setIncludeInactive] = useState(false);
	const [onlyAlerts, setOnlyAlerts] = useState(false);
	const [creating, setCreating] = useState(false);

	const effectiveCategoryId = subcategoryId !== '' ? subcategoryId : (rootCategoryId !== '' ? rootCategoryId : undefined);

	const { data: items = [], isLoading } = useItems({ categoryId: effectiveCategoryId, includeInactive });
	const { data: categories = [] } = useItemCategories();
	const categoryTree = useMemo(() => buildTree(categories), [categories]);

	// Find active root category node to discover direct subcategories
	const activeRootNode = useMemo<CategoryNode | null>(() => {
		if (rootCategoryId === '') return null;
		return categoryTree.find((node) => node.id === rootCategoryId) ?? null;
	}, [categoryTree, rootCategoryId]);

	const directSubcategories = useMemo(() => {
		return activeRootNode ? activeRootNode.children : [];
	}, [activeRootNode]);

	useEffect(() => {
		if (searchParams.get('new') === '1') {
			setCreating(true);
			const next = new URLSearchParams(searchParams);
			next.delete('new');
			setSearchParams(next, { replace: true });
		}
	}, [searchParams, setSearchParams]);

	const hasAlert = (i: (typeof items)[number]) => !!i.stock && (i.stock.hasNegative || i.stock.hasCritical);
	const alertsCount = items.filter(hasAlert).length;
	const searched = useMemo(() => {
		const term = normalize(search.trim());
		const alerted = onlyAlerts ? items.filter(hasAlert) : items;
		return term ? alerted.filter((i) => normalize(`${i.code} ${i.name}`).includes(term)) : alerted;
	}, [items, search, onlyAlerts]);

	const counts = useMemo(
		() => ({
			ALL: searched.length,
			STOCKED_ARTICLE: searched.filter((i) => i.behavior === 'STOCKED_ARTICLE').length,
			EXPENSE_ARTICLE: searched.filter((i) => i.behavior === 'EXPENSE_ARTICLE').length,
			SERVICE: searched.filter((i) => i.behavior === 'SERVICE').length
		}),
		[searched]
	);
	const visible = behavior === 'ALL' ? searched : searched.filter((i) => i.behavior === behavior);
	const companyName = companies.find((c) => c.id === activeCompanyId)?.name;

	return (
		<ViewLayout
			title="Artículos y servicios"
			subtitle={`Catálogo de lo que la empresa compra o usa${companyName ? ` · ${companyName}` : ''}.`}
			subHeader={
				<ItemsCategorySubheader
					categories={categories}
					activeCategoryId={rootCategoryId}
					onSelectCategory={(id) => {
						setRootCategoryId(id);
						setSubcategoryId('');
					}}
				/>
			}
			actions={
				<Stack direction="row" spacing={1.5}>
					<Button
						variant="text"
						startIcon={<FuseSvgIcon size={20}>heroicons-outline:adjustments-horizontal</FuseSvgIcon>}
						onClick={() => navigate(settingsSectionPath('item-units'))}
						sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
					>
						Unidades y categorías
					</Button>
					<Button
						variant="contained"
						startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>}
						onClick={() => setCreating(true)}
						sx={{ bgcolor: 'primary.main', borderRadius: '6px', px: 3, fontWeight: 700, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
					>
						Nuevo ítem
					</Button>
				</Stack>
			}
		>
			<Stack spacing={2} component="main">
				<ItemsToolbar
					search={search}
					onSearch={setSearch}
					behavior={behavior}
					onBehavior={setBehavior}
					counts={counts}
					includeInactive={includeInactive}
					onIncludeInactive={setIncludeInactive}
					onlyAlerts={onlyAlerts}
					onOnlyAlerts={setOnlyAlerts}
					alertsCount={alertsCount}
					subcategories={directSubcategories}
					parentCategoryName={activeRootNode?.name ?? ''}
					activeSubcategoryId={subcategoryId}
					onSelectSubcategory={setSubcategoryId}
				/>
				<Box>
					<ItemsGrid
						items={visible}
						loading={isLoading}
						emptyMessage={items.length === 0 ? 'Todavía no cargaste artículos ni servicios.' : 'Ningún ítem coincide con los filtros.'}
						onOpen={(item) => navigate(`/items/${item.id}`)}
					/>
				</Box>
			</Stack>

			<ItemFormDialog
				open={creating}
				onClose={() => setCreating(false)}
				onSaved={(item) => navigate(`/items/${item.id}`)}
			/>
		</ViewLayout>
	);
}
