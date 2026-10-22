import React, { useMemo, useState } from 'react';
import { Box, Tab, Tabs, Menu, MenuItem, ListItemText, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ItemCategory } from '@/core/items/domain/entities/ItemCategory';

interface ItemsCategorySubheaderProps {
	categories: ItemCategory[];
	activeCategoryId: number | '';
	onSelectCategory: (id: number | '') => void;
}

interface FeaturedTabDef {
	key: string;
	label: string;
	isMatch: (c: ItemCategory) => boolean;
}

const FEATURED_DEFS: FeaturedTabDef[] = [
	{
		key: 'livestock_treatment',
		label: 'Tratamientos de ganado',
		isMatch: (c) => c.code === 'LIVESTOCK_TREATMENT' || c.code === 'HEALTH' || /tratamiento.*ganado|sanidad/i.test(c.name)
	},
	{
		key: 'feed',
		label: 'Alimentación',
		isMatch: (c) => c.code === 'FEED' || c.code === 'NUTRITION' || /alimento|nutrici|alimentaci/i.test(c.name)
	},
	{
		key: 'paddock_treatment',
		label: 'Tratamientos de potreros',
		isMatch: (c) => c.code === 'PADDOCK_TREATMENT' || /potrero/i.test(c.name)
	},
	{
		key: 'semen',
		label: 'Semen',
		isMatch: (c) => c.code === 'SEMEN' || /semen/i.test(c.name)
	},
	{
		key: 'embryo',
		label: 'Embrión',
		isMatch: (c) => c.code === 'EMBRYO' || /embri/i.test(c.name)
	}
];

export default function ItemsCategorySubheader({
	categories,
	activeCategoryId,
	onSelectCategory
}: ItemsCategorySubheaderProps) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	// Root categories (parent_id === null)
	const rootCategories = useMemo(() => categories.filter((c) => c.parentId === null), [categories]);

	// Ancestor map: for any category ID, find its root ancestor
	const rootOfCategory = useMemo(() => {
		const byId = new Map(categories.map((c) => [c.id, c]));
		const map = new Map<number, ItemCategory>();

		for (const cat of categories) {
			let curr: ItemCategory | undefined = cat;
			while (curr && curr.parentId !== null) {
				curr = byId.get(curr.parentId);
			}
			if (curr) {
				map.set(cat.id, curr);
			}
		}
		return map;
	}, [categories]);

	// Resolve the 5 featured categories:
	// If multiple roots match a tab (e.g. HEALTH and LIVESTOCK_TREATMENT, or FEED and NUTRITION),
	// pick the one with highest itemsCount, but mark ALL matching IDs as handled so they don't leak into "Others".
	const { resolvedFeatured, allFeaturedRootIds } = useMemo(() => {
		const allMatchedIds = new Set<number>();

		const tabs = FEATURED_DEFS.map((def) => {
			const matching = rootCategories.filter((r) => def.isMatch(r));
			matching.forEach((m) => allMatchedIds.add(m.id));

			// Sort by items count descending so the populated category is primary
			const sorted = [...matching].sort((a, b) => (b.itemsCount ?? 0) - (a.itemsCount ?? 0));
			const primary = sorted[0] ?? null;

			return {
				key: def.key,
				label: def.label,
				category: primary,
				allMatchedIds: matching.map((m) => m.id)
			};
		});

		return { resolvedFeatured: tabs, allFeaturedRootIds: allMatchedIds };
	}, [rootCategories]);

	// "Other" root categories that were not matched by any featured tab
	const otherRootCategories = useMemo(() => {
		return rootCategories.filter((r) => !allFeaturedRootIds.has(r.id));
	}, [rootCategories, allFeaturedRootIds]);

	// Find active root category from current activeCategoryId
	const activeRootCat = activeCategoryId === '' ? null : rootOfCategory.get(activeCategoryId);

	// Determine active tab key
	const activeTabKey = useMemo(() => {
		if (activeCategoryId === '' || !activeRootCat) {
			return 'all';
		}
		// Check if activeRootCat matches any featured tab's matched IDs
		const foundFeatured = resolvedFeatured.find((f) => f.allMatchedIds.includes(activeRootCat.id));
		if (foundFeatured) {
			return foundFeatured.key;
		}
		// Otherwise in "others"
		return 'other';
	}, [activeCategoryId, activeRootCat, resolvedFeatured]);

	const isOtherActive = activeTabKey === 'other';
	const selectedOtherLabel = isOtherActive && activeRootCat ? activeRootCat.name : null;

	const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
		if (newValue === 'all') {
			onSelectCategory('');
			return;
		}
		if (newValue === 'other') {
			return;
		}
		const tab = resolvedFeatured.find((f) => f.key === newValue);
		if (tab?.category) {
			onSelectCategory(tab.category.id);
		} else {
			// Tab exists in UI but not in DB yet (e.g. Embrión)
			onSelectCategory('');
		}
	};

	return (
		<Box
			sx={{
				width: '100%',
				borderBottom: 1,
				borderColor: 'divider',
				mb: '-1px'
			}}
		>
			<Tabs
				value={activeTabKey}
				onChange={handleTabChange}
				variant="scrollable"
				scrollButtons="auto"
				allowScrollButtonsMobile
				sx={{
					minHeight: 44,
					width: '100% !important',
					backgroundColor: 'transparent !important',
					padding: '0 !important',
					borderRadius: '0 !important',
					boxShadow: 'none !important',
					'& .MuiTabs-scroller': {
						overflow: 'auto !important'
					},
					'& .MuiTabs-flexContainer': {
						gap: { xs: 1, sm: 3 }
					},
					// Explicitly override Fuse theme's pill indicator
					'& .MuiTabs-indicator': {
						top: 'auto !important',
						bottom: '0 !important',
						height: '3px !important',
						minHeight: '3px !important',
						maxHeight: '3px !important',
						backgroundColor: '#16a34a !important', // Vibrant green from user screenshot
						borderRadius: '3px 3px 0 0 !important',
						boxShadow: 'none !important',
						border: 'none !important',
						zIndex: 2
					},
					// Explicitly override Fuse theme's button-like Tab styles
					'& .MuiTab-root': {
						minHeight: '44px !important',
						minWidth: 'auto !important',
						py: '10px !important',
						px: { xs: '12px !important', sm: '16px !important' },
						borderRadius: '0 !important',
						backgroundColor: 'transparent !important',
						border: 'none !important',
						boxShadow: 'none !important',
						textTransform: 'none',
						fontSize: '0.9rem',
						fontWeight: '500 !important',
						color: (theme) => (theme.palette.mode === 'dark' ? '#94a3b8 !important' : '#64748b !important'),
						letterSpacing: '0.01em',
						transition: 'color 0.15s ease-in-out',
						'&:hover': {
							color: (theme) => (theme.palette.mode === 'dark' ? '#f8fafc !important' : '#0f172a !important'),
							backgroundColor: 'transparent !important'
						},
						'&.Mui-selected': {
							color: (theme) => (theme.palette.mode === 'dark' ? '#ffffff !important' : '#0f172a !important'),
							fontWeight: '700 !important',
							backgroundColor: 'transparent !important'
						}
					}
				}}
			>
				<Tab value="all" label="Todos" />

				{resolvedFeatured.map((tab) => (
					<Tab key={tab.key} value={tab.key} label={tab.label} />
				))}

				{otherRootCategories.length > 0 && (
					<Tab
						value="other"
						label={
							<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
								<Typography
									component="span"
									sx={{
										fontSize: 'inherit',
										fontWeight: isOtherActive ? 700 : 500,
										color: 'inherit'
									}}
								>
									{selectedOtherLabel ? `Otras: ${selectedOtherLabel}` : 'Otras categorías'}
								</Typography>
								<FuseSvgIcon size={16}>heroicons-mini:chevron-down</FuseSvgIcon>
							</Box>
						}
						onClick={(e) => setAnchorEl(e.currentTarget)}
					/>
				)}
			</Tabs>

			{/* Dropdown Menu for Other Categories */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => setAnchorEl(null)}
				PaperProps={{
					sx: {
						mt: 0.5,
						minWidth: 220,
						boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
						borderRadius: '8px'
					}
				}}
			>
				{otherRootCategories.map((cat) => (
					<MenuItem
						key={cat.id}
						selected={activeRootCat?.id === cat.id}
						onClick={() => {
							onSelectCategory(cat.id);
							setAnchorEl(null);
						}}
						sx={{ py: 1 }}
					>
						<ListItemText
							primary={cat.name}
							primaryTypographyProps={{
								fontSize: '0.875rem',
								fontWeight: activeRootCat?.id === cat.id ? 700 : 500
							}}
						/>
					</MenuItem>
				))}
			</Menu>
		</Box>
	);
}
