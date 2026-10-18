import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ItemDetail } from '@/core/items/domain/entities/Item';
import { buildTree, flattenTree } from '@/core/items/domain/rules/categoryTree';
import { useSaveItem } from '@/features/items/hooks/useItemMutations';
import { useUnitsOfMeasure } from '@/features/items/hooks/useUnitsOfMeasure';
import { useItemCategories } from '@/features/items/hooks/useItemCategories';
import CatalogDialogFrame from '../CatalogDialogFrame';
import { readApiErrors } from '../apiErrors';
import { EMPTY_ITEM_FORM, ItemFormValues, itemFormSchema } from './item-form/ItemFormSchema';
import ItemBehaviorPicker from './item-form/ItemBehaviorPicker';
import ItemGeneralFields, { ItemNameField } from './item-form/ItemGeneralFields';
import ItemUnitField from './item-form/ItemUnitField';
import ItemCategoryField from './item-form/ItemCategoryField';
import UnitOfMeasureDialog from '../settings/UnitOfMeasureDialog';
import ItemCategoryDialog from '../settings/ItemCategoryDialog';

interface ItemFormDialogProps {
	open: boolean;
	onClose: () => void;
	/** Edit mode when given. */
	item?: ItemDetail;
	onSaved?: (item: ItemDetail) => void;
}

const toForm = (item: ItemDetail): ItemFormValues => ({
	behavior: item.behavior,
	name: item.name,
	code: item.code,
	unit_of_measure_id: item.unit?.id ?? 0,
	item_category_id: item.category?.id ?? null,
	description: item.description ?? ''
});

/**
 * Create or edit an item's general data (DB3). A unit or a category can be created on the spot
 * without losing the form; it comes back selected.
 */
export default function ItemFormDialog({ open, onClose, item, onSaved }: ItemFormDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { mutate, isPending } = useSaveItem();
	const { data: units = [] } = useUnitsOfMeasure();
	const { data: categories = [] } = useItemCategories();
	const tree = useMemo(() => flattenTree(buildTree(categories.filter((c) => c.isActive))), [categories]);
	const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
	const [domainError, setDomainError] = useState<string | null>(null);
	const [creatingUnit, setCreatingUnit] = useState(false);
	const [creatingCategory, setCreatingCategory] = useState(false);

	const { register, control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ItemFormValues>({
		resolver: zodResolver(itemFormSchema),
		defaultValues: EMPTY_ITEM_FORM
	});
	const behavior = watch('behavior');

	useEffect(() => {
		if (open) {
			reset(item ? toForm(item) : EMPTY_ITEM_FORM);
			setServerErrors({});
			setDomainError(null);
		}
	}, [open, item, reset]);

	const submit = handleSubmit((values) => {
		setServerErrors({});
		setDomainError(null);
		mutate(
			{
				id: item?.id,
				payload: {
					name: values.name,
					behavior: values.behavior,
					unit_of_measure_id: values.unit_of_measure_id,
					item_category_id: values.item_category_id,
					code: values.code || null,
					description: values.description.trim() || null
				}
			},
			{
				onSuccess: (saved) => {
					enqueueSnackbar(item ? `${saved.name} actualizado` : `${saved.name} creado como ${saved.code}`, { variant: 'success' });
					onClose();
					onSaved?.(saved);
				},
				onError: (error) => {
					const { fields, domain } = readApiErrors(error);
					setServerErrors(fields);
					setDomainError(domain);
				}
			}
		);
	});

	return (
		<>
			<CatalogDialogFrame
				open={open}
				title={item ? `Editar ${item.name}` : 'Nuevo artículo o servicio'}
				onClose={onClose}
				onSubmit={submit}
				submitLabel={item ? 'Guardar' : 'Crear'}
				pending={isPending}
				error={domainError}
			>
				<Stack spacing={2.5}>
					<Controller name="behavior" control={control} render={({ field }) => <ItemBehaviorPicker value={field.value} onChange={field.onChange} />} />
					<ItemNameField register={register} errors={errors} serverErrors={serverErrors} />
					<Controller
						name="item_category_id"
						control={control}
						render={({ field }) => (
							<ItemCategoryField value={field.value} onChange={field.onChange} onCreate={() => setCreatingCategory(true)} categories={tree} />
						)}
					/>
					<Controller
						name="unit_of_measure_id"
						control={control}
						render={({ field }) => (
							<ItemUnitField
								value={field.value}
								onChange={field.onChange}
								onCreate={() => setCreatingUnit(true)}
								units={units}
								behavior={behavior}
								error={errors.unit_of_measure_id?.message ?? serverErrors.unit_of_measure_id}
							/>
						)}
					/>
					<ItemGeneralFields
						register={register}
						errors={errors}
						serverErrors={serverErrors}
						codeHint={item ? 'Se puede cambiar mientras no se repita.' : `Vacío = el siguiente ${behavior === 'SERVICE' ? 'SRV' : 'ART'} de la empresa.`}
					/>
				</Stack>
			</CatalogDialogFrame>

			<UnitOfMeasureDialog
				open={creatingUnit}
				onClose={() => setCreatingUnit(false)}
				onSaved={(unit) => setValue('unit_of_measure_id', unit.id, { shouldValidate: true })}
			/>
			<ItemCategoryDialog
				open={creatingCategory}
				onClose={() => setCreatingCategory(false)}
				onSaved={(category) => setValue('item_category_id', category.id)}
			/>
		</>
	);
}
