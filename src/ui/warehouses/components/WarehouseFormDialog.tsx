import { useEffect, useState } from 'react';
import { Stack, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { Warehouse } from '@/core/stock/domain/entities/ItemStock';
import { useNextWarehouseCode, useSaveWarehouse } from '@/features/stock/hooks/useWarehouses';
import CatalogDialogFrame from '@/ui/items/components/CatalogDialogFrame';
import { readApiErrors } from '@/ui/items/components/apiErrors';

interface WarehouseFormDialogProps {
	open: boolean;
	onClose: () => void;
	/** Edit mode when given. */
	warehouse?: Warehouse;
}

const inputSx = { bgcolor: 'action.hover' };

/** Code (the next ALM-NN proposed, editable) and name, unique per company (DD1). */
export default function WarehouseFormDialog({ open, onClose, warehouse }: WarehouseFormDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { data: nextCode } = useNextWarehouseCode(open && !warehouse);
	const { mutateAsync, isPending } = useSaveWarehouse();
	const [draft, setDraft] = useState({ code: '', name: '' });
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [domain, setDomain] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setDraft({ code: warehouse?.code ?? '', name: warehouse?.name ?? '' });
		setErrors({});
		setDomain(null);
	}, [open, warehouse]);

	useEffect(() => {
		if (open && !warehouse && nextCode) setDraft((d) => (d.code ? d : { ...d, code: nextCode }));
	}, [open, warehouse, nextCode]);

	const set = (key: 'code' | 'name', value: string) => {
		setDraft((d) => ({ ...d, [key]: value }));
		setErrors(({ [key]: _cleared, ...rest }) => rest);
	};

	const submit = async () => {
		try {
			const saved = await mutateAsync({ id: warehouse?.id ?? null, code: draft.code, name: draft.name });
			enqueueSnackbar(warehouse ? `Almacén ${saved.code} actualizado.` : `Almacén ${saved.code} creado.`, { variant: 'success' });
			onClose();
		} catch (error) {
			const { fields, domain: message } = readApiErrors(error, 'No se pudo guardar el almacén.');
			setErrors(fields);
			setDomain(message);
		}
	};

	return (
		<CatalogDialogFrame open={open} title={warehouse ? `Editar ${warehouse.code}` : 'Nuevo almacén'} onClose={onClose} onSubmit={submit}
			submitLabel={warehouse ? 'Guardar' : 'Crear almacén'} pending={isPending} error={domain}>
			<Stack spacing={2}>
				<TextField label="Código" variant="filled" fullWidth value={draft.code} onChange={(e) => set('code', e.target.value)}
					InputProps={{ sx: inputSx }} error={!!errors.code} helperText={errors.code ?? 'Letras, números y guiones. Se guarda en mayúsculas.'} />
				<TextField label="Nombre" variant="filled" fullWidth value={draft.name} onChange={(e) => set('name', e.target.value)} autoFocus={!!warehouse}
					InputProps={{ sx: inputSx }} error={!!errors.name} helperText={errors.name ?? 'Por ejemplo: Galpón de sanidad, Tanque de gasoil.'} />
			</Stack>
		</CatalogDialogFrame>
	);
}
