import { FormControlLabel, InputAdornment, MenuItem, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ITEM_BEHAVIORS, ItemBehavior } from '@/core/items/domain/rules/itemBehavior';
import { CategoryNode } from '@/core/items/domain/rules/categoryTree';

export type BehaviorFilter = ItemBehavior | 'ALL';

interface ItemsToolbarProps {
	search: string;
	onSearch: (value: string) => void;
	behavior: BehaviorFilter;
	onBehavior: (value: BehaviorFilter) => void;
	counts: Record<BehaviorFilter, number>;
	categoryId: number | '';
	onCategory: (value: number | '') => void;
	categories: CategoryNode[];
	includeInactive: boolean;
	onIncludeInactive: (value: boolean) => void;
	onlyAlerts: boolean;
	onOnlyAlerts: (value: boolean) => void;
	alertsCount: number;
}

/** Search, the behavior filter with its counts, the category (with its descendants) and the state. */
export default function ItemsToolbar(props: ItemsToolbarProps) {
	const { search, onSearch, behavior, onBehavior, counts, categoryId, onCategory, categories, includeInactive, onIncludeInactive, onlyAlerts, onOnlyAlerts, alertsCount } = props;

	return (
		<Stack spacing={1.5}>
			<Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
				<TextField
					size="small"
					placeholder="Buscar por código o nombre"
					value={search}
					onChange={(e) => onSearch(e.target.value)}
					sx={{ minWidth: 280 }}
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
			<Stack direction="row" spacing={2} alignItems="center">
				<TextField
					select
					size="small"
					label="Categoría"
					value={categoryId}
					onChange={(e) => onCategory(e.target.value === '' ? '' : Number(e.target.value))}
					sx={{ minWidth: 260 }}
					SelectProps={{ displayEmpty: true }}
					InputLabelProps={{ shrink: true }}
				>
					<MenuItem value="">Todas</MenuItem>
					{categories.map((c) => (
						<MenuItem key={c.id} value={c.id} sx={{ pl: 2 + c.depth * 2 }}>
							{c.name}
						</MenuItem>
					))}
				</TextField>
				<FormControlLabel
					control={<Switch size="small" checked={includeInactive} onChange={(e) => onIncludeInactive(e.target.checked)} />}
					label="Mostrar desactivados"
					sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}
				/>
				<FormControlLabel
					control={<Switch size="small" color="warning" checked={onlyAlerts} onChange={(e) => onOnlyAlerts(e.target.checked)} />}
					label={`Con alertas de stock (${alertsCount})`}
					sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}
				/>
			</Stack>
		</Stack>
	);
}
