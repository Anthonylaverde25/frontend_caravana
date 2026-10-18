import { useMemo, useState } from 'react';
import { Button, FormControlLabel, InputAdornment, Stack, Switch, TextField } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { CategoryNode, buildTree } from '@/core/items/domain/rules/categoryTree';
import { useItemCategories, useSetItemCategoryActive } from '@/features/items/hooks/useItemCategories';
import CategoryTreeGrid from './CategoryTreeGrid';
import ItemCategoryDialog from './ItemCategoryDialog';
import SetActiveDialog from '../dialogs/SetActiveDialog';

interface Editing {
	category?: CategoryNode;
	parentId?: number | null;
}

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Rows of the visible tree: folded branches hidden; a search keeps every branch that leads to a match. */
function visibleRows(nodes: CategoryNode[], folded: Set<number>, term: string): CategoryNode[] {
	const matches = (n: CategoryNode): boolean => normalize(n.name).includes(term) || n.children.some(matches);

	return nodes.flatMap((n) => {
		if (term && !matches(n)) return [];
		const open = term !== '' || !folded.has(n.id);
		return [n, ...(open ? visibleRows(n.children, folded, term) : [])];
	});
}

/** The company's category tree: create, add a subcategory, move, rename, deactivate. */
export default function CategoriesTab() {
	const [includeInactive, setIncludeInactive] = useState(false);
	const { data: categories = [] } = useItemCategories(includeInactive);
	const { mutateAsync: setActive } = useSetItemCategoryActive();
	const [search, setSearch] = useState('');
	const [folded, setFolded] = useState<Set<number>>(new Set());
	const [editing, setEditing] = useState<Editing | null>(null);
	const [toggling, setToggling] = useState<CategoryNode | null>(null);

	const rows = useMemo(() => visibleRows(buildTree(categories), folded, normalize(search.trim())), [categories, folded, search]);
	const toggleFold = (id: number) =>
		setFolded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	return (
		<Stack spacing={2}>
			<Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
				<TextField size="small" placeholder="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 220 }}
					InputProps={{ startAdornment: <InputAdornment position="start"><FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon></InputAdornment> }} />
				<FormControlLabel control={<Switch size="small" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />}
					label="Desactivadas" sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }} />
				<Stack sx={{ flexGrow: 1 }} />
				<Button variant="contained" startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus-circle</FuseSvgIcon>} onClick={() => setEditing({ parentId: null })}
					sx={{ borderRadius: '6px', fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}>
					Nueva categoría
				</Button>
			</Stack>

			<CategoryTreeGrid
				rows={rows}
				folded={folded}
				onToggleFold={toggleFold}
				onAddChild={(c) => setEditing({ parentId: c.id })}
				onEdit={(c) => setEditing({ category: c })}
				onToggleActive={setToggling}
			/>

			<ItemCategoryDialog open={!!editing} category={editing?.category} parentId={editing?.parentId} onClose={() => setEditing(null)} />
			<SetActiveDialog
				open={!!toggling}
				onClose={() => setToggling(null)}
				subject={toggling ? `la categoría ${toggling.name}` : ''}
				activate={!toggling?.isActive}
				consequence={
					toggling?.isActive
						? 'Deja de ofrecerse para nuevos ítems. Sus subcategorías y sus ítems no cambian.'
						: 'Vuelve a ofrecerse para nuevos ítems.'
				}
				onConfirm={() => setActive({ id: toggling!.id, active: !toggling!.isActive })}
			/>
		</Stack>
	);
}
