import { FormControlLabel, InputAdornment, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ITEM_BEHAVIORS, ItemBehavior } from '@/core/items/domain/rules/itemBehavior';
import { CategoryNode } from '@/core/items/domain/rules/categoryTree';
import ItemsSubcategoryChips from './ItemsSubcategoryChips';

export type BehaviorFilter = ItemBehavior | 'ALL';

interface ItemsToolbarProps {
	search: string;
	onSearch: (value: string) => void;
	behavior: BehaviorFilter;
	onBehavior: (value: BehaviorFilter) => void;
	counts: Record<BehaviorFilter, number>;
	includeInactive: boolean;
	onIncludeInactive: (value: boolean) => void;
	onlyAlerts: boolean;
	onOnlyAlerts: (value: boolean) => void;
	alertsCount: number;
	// Subcategory chips
	subcategories?: CategoryNode[];
	parentCategoryName?: string;
	activeSubcategoryId?: number | '';
	onSelectSubcategory?: (id: number | '') => void;
}

/** Search, behavior filter with counts, state switches and subcategory chips when available. */
export default function ItemsToolbar(props: ItemsToolbarProps) {
	const {
		search,
		onSearch,
		behavior,
		onBehavior,
		counts,
		includeInactive,
		onIncludeInactive,
		onlyAlerts,
		onOnlyAlerts,
		alertsCount,
		subcategories = [],
		parentCategoryName = '',
		activeSubcategoryId = '',
		onSelectSubcategory
	} = props;

	return (
		<Stack spacing={1.5}>
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				spacing={1.5}
				alignItems={{ md: 'center' }}
				justifyContent="space-between"
				sx={{ flexWrap: 'wrap', gap: 1.5 }}
			>
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ flex: 1 }}>
					<TextField
						size="small"
						placeholder="Buscar por código o nombre"
						value={search}
						onChange={(e) => onSearch(e.target.value)}
						sx={{ minWidth: { xs: '100%', sm: 280 } }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon>
								</InputAdornment>
							)
						}}
					/>
					<ToggleButtonGroup
						size="small"
						exclusive
						value={behavior}
						onChange={(_, value) => value && onBehavior(value)}
						sx={{ flexWrap: 'wrap', '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, px: 1.5 } }}
					>
						<ToggleButton value="ALL">Todos {counts.ALL}</ToggleButton>
						{ITEM_BEHAVIORS.map((b) => (
							<ToggleButton key={b.value} value={b.value}>
								{b.filterLabel} {counts[b.value]}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				</Stack>

				<Stack direction="row" spacing={1.5} alignItems="center">
					<FormControlLabel
						control={<Switch size="small" checked={includeInactive} onChange={(e) => onIncludeInactive(e.target.checked)} />}
						label="Desactivados"
						sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.825rem', color: 'text.secondary' } }}
					/>
					<FormControlLabel
						control={<Switch size="small" color="warning" checked={onlyAlerts} onChange={(e) => onOnlyAlerts(e.target.checked)} />}
						label={`Con alertas (${alertsCount})`}
						sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.825rem', color: alertsCount > 0 ? 'warning.main' : 'text.secondary' } }}
					/>
				</Stack>
			</Stack>

			{/* Render subcategory chips if the active root category has children */}
			{subcategories.length > 0 && onSelectSubcategory && (
				<ItemsSubcategoryChips
					subcategories={subcategories}
					parentName={parentCategoryName}
					activeSubcategoryId={activeSubcategoryId}
					onSelectSubcategory={onSelectSubcategory}
				/>
			)}
		</Stack>
	);
}
