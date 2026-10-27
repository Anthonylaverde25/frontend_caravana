import { useEffect, useState } from 'react';
import { MenuItem, Stack, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { Warehouse, WarehouseKind } from '@/core/stock/domain/entities/ItemStock';
import { useNextWarehouseCode, useSaveWarehouse } from '@/features/stock/hooks/useWarehouses';
import CatalogDialogFrame from '@/ui/items/components/CatalogDialogFrame';
import { readApiErrors } from '@/ui/items/components/apiErrors';

interface WarehouseFormDialogProps {
	open: boolean;
	onClose: () => void;
	/** Edit mode when given. */
	warehouse?: Warehouse;
	/** Kind preselected for a new one ("+ Nuevo termo" from the semen entry). */
	defaultKind?: WarehouseKind;
	onSaved?: (warehouse: Warehouse) => void;
}

const inputSx = { bgcolor: 'action.hover' };

const KIND_HELP: Record<WarehouseKind, string> = {
	GENERAL: 'Las facturas y remitos entran al almacén predeterminado.',
	CRYO_TANK: 'El semen sólo se guarda en un termo; el termo también admite otros artículos.'
};

/**
 * Code (the next ALM-NN proposed, editable), name, unique per company (DD1), and kind (S-0). The kind
 * only changes while nothing moved through the warehouse: the backend answers on the field.
 */
export default function WarehouseFormDialog({ open, onClose, warehouse, defaultKind = 'GENERAL', onSaved }: WarehouseFormDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { data: nextCode } = useNextWarehouseCode(open && !warehouse);
	const { mutateAsync, isPending } = useSaveWarehouse();
	const [draft, setDraft] = useState<{ code: string; name: string; kind: WarehouseKind }>({ code: '', name: '', kind: 'GENERAL' });
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [domain, setDomain] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setDraft({ code: warehouse?.code ?? '', name: warehouse?.name ?? '', kind: warehouse?.kind ?? defaultKind });
		setErrors({});
		setDomain(null);
	}, [open, warehouse, defaultKind]);

	useEffect(() => {
		if (open && !warehouse && nextCode) setDraft((d) => (d.code ? d : { ...d, code: nextCode }));
	}, [open, warehouse, nextCode]);

	const set = (key: 'code' | 'name' | 'kind', value: string) => {
		setDraft((d) => ({ ...d, [key]: value }));
		setErrors(({ [key]: _cleared, ...rest }) => rest);
	};

	const submit = async () => {
		try {
			const saved = await mutateAsync({ id: warehouse?.id ?? null, code: draft.code, name: draft.name, kind: draft.kind });
			const noun = saved.kind === 'CRYO_TANK' ? 'Termo' : 'Almacén';
			enqueueSnackbar(warehouse ? `${noun} ${saved.code} actualizado.` : `${noun} ${saved.code} creado.`, { variant: 'success' });
			onSaved?.(saved);
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
					InputProps={{ sx: inputSx }} error={!!errors.name} helperText={errors.name ?? 'Por ejemplo: Galpón de sanidad, Tanque de gasoil, Termo 1.'} />
				<TextField select label="Tipo" variant="filled" fullWidth value={draft.kind} onChange={(e) => set('kind', e.target.value)}
					InputProps={{ sx: inputSx }} error={!!errors.kind} helperText={errors.kind ?? KIND_HELP[draft.kind]}>
					<MenuItem value="GENERAL">Almacén general</MenuItem>
					<MenuItem value="CRYO_TANK">Termo (semen)</MenuItem>
				</TextField>
			</Stack>
		</CatalogDialogFrame>
	);
}
