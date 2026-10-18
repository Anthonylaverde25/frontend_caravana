import { MenuItem, TextField } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { CategoryNode } from '@/core/items/domain/rules/categoryTree';

const CREATE = -1;
const NONE = 0;

interface ItemCategoryFieldProps {
	value: number | null;
	onChange: (categoryId: number | null) => void;
	onCreate: () => void;
	/** Active categories, depth-first. */
	categories: CategoryNode[];
}

/** Indented by level, "Sin categoría" first and "Crear categoría…" at the end. */
export default function ItemCategoryField({ value, onChange, onCreate, categories }: ItemCategoryFieldProps) {
	return (
		<TextField
			select
			label="Categoría"
			variant="filled"
			fullWidth
			value={value ?? NONE}
			onChange={(e) => {
				const id = Number(e.target.value);
				if (id === CREATE) {
					onCreate();
				} else {
					onChange(id === NONE ? null : id);
				}
			}}
			sx={{ bgcolor: 'action.hover' }}
		>
			<MenuItem value={NONE}>
				<em>Sin categoría</em>
			</MenuItem>
			{categories.map((c) => (
				<MenuItem key={c.id} value={c.id} sx={{ pl: 2 + c.depth * 2, fontWeight: c.depth === 0 ? 600 : 400 }}>
					{c.name}
				</MenuItem>
			))}
			<MenuItem value={CREATE} sx={{ color: 'primary.main', fontWeight: 600, borderTop: 1, borderColor: 'divider' }}>
				<FuseSvgIcon size={16} sx={{ mr: 1 }}>
					heroicons-outline:plus
				</FuseSvgIcon>
				Crear categoría…
			</MenuItem>
		</TextField>
	);
}
