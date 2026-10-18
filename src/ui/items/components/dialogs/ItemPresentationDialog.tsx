import { useEffect, useState } from 'react';
import { InputAdornment, Stack, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { ItemDetail, ItemPresentation } from '@/core/items/domain/entities/Item';
import { suggestPresentationName } from '@/core/items/domain/rules/presentationName';
import { useSaveItemPresentation } from '@/features/items/hooks/useItemMutations';
import CatalogDialogFrame from '../CatalogDialogFrame';
import { readApiErrors } from '../apiErrors';

interface ItemPresentationDialogProps {
	open: boolean;
	onClose: () => void;
	item: ItemDetail;
	/** Edit mode when given. */
	presentation?: ItemPresentation;
}

const inputSx = { bgcolor: 'action.hover' };

/** Package + how much it holds; the name is suggested ("Frasco × 500 ml") and stays editable. */
export default function ItemPresentationDialog({ open, onClose, item, presentation }: ItemPresentationDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { mutate, isPending } = useSaveItemPresentation();
	const symbol = item.unit?.symbol ?? '';
	const [packaging, setPackaging] = useState('');
	const [factor, setFactor] = useState('');
	const [name, setName] = useState('');
	const [nameTouched, setNameTouched] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [domainError, setDomainError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setPackaging('');
		setFactor(presentation ? String(presentation.factorToItemUnit) : '');
		setName(presentation?.name ?? '');
		setNameTouched(!!presentation);
		setErrors({});
		setDomainError(null);
	}, [open, presentation]);

	const factorValue = Number(factor.replace(',', '.'));
	useEffect(() => {
		if (!nameTouched) setName(suggestPresentationName(packaging, factorValue, symbol));
	}, [packaging, factorValue, symbol, nameTouched]);

	const submit = () => {
		const local: Record<string, string> = {};
		if (!(factorValue > 0)) local.factor_to_item_unit = `Tiene que contener más de cero ${symbol}.`;
		if (!name.trim()) local.name = 'Poné un nombre, por ejemplo "Frasco × 500 ml".';
		setErrors(local);
		setDomainError(null);
		if (Object.keys(local).length) return;

		mutate(
			{ itemId: item.id, name, factor: factorValue, presentationId: presentation?.id },
			{
				onSuccess: (saved) => {
					enqueueSnackbar(`Presentación ${saved.name} guardada`, { variant: 'success' });
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
			title={presentation ? `Editar ${presentation.name}` : `Nueva presentación de ${item.name}`}
			onClose={onClose}
			onSubmit={submit}
			submitLabel={presentation ? 'Guardar' : 'Agregar'}
			pending={isPending}
			error={domainError}
		>
			<Stack spacing={2}>
				{!presentation && (
					<TextField label="Envase" variant="filled" fullWidth autoFocus value={packaging} onChange={(e) => setPackaging(e.target.value)}
						helperText={item.unit?.isConvertible === false ? 'Ej.: Caja' : 'Ej.: Frasco, Bolsa, Bidón'} sx={inputSx} />
				)}
				<TextField label="Contiene *" variant="filled" fullWidth value={factor} onChange={(e) => { setFactor(e.target.value); setErrors(({ factor_to_item_unit: _cleared, ...rest }) => rest); }}
					error={!!errors.factor_to_item_unit} helperText={errors.factor_to_item_unit ?? `Cuántos ${symbol} trae una.`}
					InputProps={{ endAdornment: <InputAdornment position="end">{symbol}</InputAdornment> }} sx={inputSx} />
				<TextField label="Nombre *" variant="filled" fullWidth value={name}
					onChange={(e) => { setName(e.target.value); setNameTouched(true); setErrors(({ name: _cleared, ...rest }) => rest); }}
					error={!!errors.name} helperText={errors.name ?? (item.unit?.isConvertible === false ? `Ej.: Caja × 250 ${symbol}` : `Ej.: Frasco × 500 ${symbol}`)} sx={inputSx} />
			</Stack>
		</CatalogDialogFrame>
	);
}
