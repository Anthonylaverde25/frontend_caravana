import { useEffect, useMemo, useState } from 'react';
import { MenuItem, Stack, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ItemCategory } from '@/core/items/domain/entities/ItemCategory';
import { buildTree, descendantIds, flattenTree } from '@/core/items/domain/rules/categoryTree';
import { useItemCategories, useSaveItemCategory } from '@/features/items/hooks/useItemCategories';
import CatalogDialogFrame from '../CatalogDialogFrame';
import { readApiErrors } from '../apiErrors';

const ROOT = 0;

interface ItemCategoryDialogProps {
	open: boolean;
	onClose: () => void;
	/** Edit mode when given. */
	category?: ItemCategory;
	/** "Agregar subcategoría": the parent comes chosen. */
	parentId?: number | null;
	onSaved?: (category: ItemCategory) => void;
}

/**
 * Name and "Dentro de". The code is derived from the name (C1). The parent select leaves out the
 * category and its descendants; the backend checks the cycle again (C3).
 */
export default function ItemCategoryDialog({ open, onClose, category, parentId = null, onSaved }: ItemCategoryDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { data: categories = [] } = useItemCategories();
	const { mutate, isPending } = useSaveItemCategory();
	const [name, setName] = useState('');
	const [parent, setParent] = useState<number>(ROOT);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [domainError, setDomainError] = useState<string | null>(null);

	const options = useMemo(() => {
		const excluded = category ? descendantIds(categories, category.id) : new Set<number>();
		return flattenTree(buildTree(categories.filter((c) => c.isActive && !excluded.has(c.id))));
	}, [categories, category]);

	useEffect(() => {
		if (!open) return;
		setName(category?.name ?? '');
		setParent((category ? category.parentId : parentId) ?? ROOT);
		setErrors({});
		setDomainError(null);
	}, [open, category, parentId]);

	const submit = () => {
		if (!name.trim()) {
			setErrors({ name: 'El nombre es obligatorio.' });
			return;
		}
		setErrors({});
		setDomainError(null);
		mutate(
			{ id: category?.id, payload: { name, parent_id: parent === ROOT ? null : parent } },
			{
				onSuccess: (saved) => {
					enqueueSnackbar(category ? `${saved.name} actualizada` : `Categoría ${saved.name} creada`, { variant: 'success' });
					onSaved?.(saved);
					onClose();
				},
				onError: (error) => {
					const { fields, domain } = readApiErrors(error);
					setErrors(fields);
					setDomainError(domain);
				}
			}
		);
	};

	return (
		<CatalogDialogFrame
			open={open}
			title={category ? `Editar ${category.name}` : 'Nueva categoría'}
			onClose={onClose}
			onSubmit={submit}
			submitLabel={category ? 'Guardar' : 'Crear'}
			pending={isPending}
			error={domainError}
		>
			<Stack spacing={2}>
				<TextField label="Nombre *" variant="filled" fullWidth autoFocus value={name} onChange={(e) => setName(e.target.value)}
					error={!!errors.name} helperText={errors.name} sx={{ bgcolor: 'action.hover' }} />
				<TextField select label="Dentro de" variant="filled" fullWidth value={parent} onChange={(e) => setParent(Number(e.target.value))}
					error={!!errors.parent_id} helperText={errors.parent_id ?? 'Vacío: categoría principal.'} sx={{ bgcolor: 'action.hover' }}>
					<MenuItem value={ROOT}><em>Ninguna (categoría principal)</em></MenuItem>
					{options.map((c) => (
						<MenuItem key={c.id} value={c.id} sx={{ pl: 2 + c.depth * 2, fontWeight: c.depth === 0 ? 600 : 400 }}>{c.name}</MenuItem>
					))}
				</TextField>
			</Stack>
		</CatalogDialogFrame>
	);
}
