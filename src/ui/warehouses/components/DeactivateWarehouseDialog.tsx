import { useEffect, useState } from 'react';
import { Alert, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { Warehouse, WarehouseSummary } from '@/core/stock/domain/entities/ItemStock';
import { activeWarehouses, warehouseLabel } from '@/core/stock/domain/rules/warehouseRules';
import { useSetWarehouseActive, useWarehouses } from '@/features/stock/hooks/useWarehouses';
import CatalogDialogFrame from '@/ui/items/components/CatalogDialogFrame';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import WarehouseStatusSummary from './WarehouseStatusSummary';

const EMPTY_SUMMARY: WarehouseSummary = { itemsWithBalance: 0, valuedValue: '0', itemsWithUnvalued: 0, pendingLots: 0, negativeItems: 0, openIncidents: 0 };

/**
 * Deactivating is never refused for what the warehouse holds: the dialog shows it and the user
 * decides (DD4). The default leaves only naming the next one, in the same save (DD3).
 */
export default function DeactivateWarehouseDialog({ warehouse, onClose }: { warehouse: Warehouse | null; onClose: () => void }) {
	const { enqueueSnackbar } = useSnackbar();
	const { data: warehouses = [] } = useWarehouses();
	const { mutateAsync, isPending } = useSetWarehouseActive();
	const [nextDefault, setNextDefault] = useState<number | ''>('');
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [domain, setDomain] = useState<string | null>(null);
	// The next default is of the same kind; the last active tank leaves the tanks without one (S-0).
	const candidates = activeWarehouses(warehouses).filter((w) => w.id !== warehouse?.id && w.kind === warehouse?.kind);
	const isTank = warehouse?.kind === 'CRYO_TANK';

	useEffect(() => {
		setNextDefault('');
		setErrors({});
		setDomain(null);
	}, [warehouse]);

	const submit = async () => {
		if (!warehouse) return;
		try {
			await mutateAsync({ id: warehouse.id, active: false, newDefaultId: warehouse.isDefault && nextDefault !== '' ? nextDefault : null });
			enqueueSnackbar(`Almacén ${warehouse.code} desactivado.`, { variant: 'success' });
			onClose();
		} catch (error) {
			const { fields, domain: message } = readApiErrors(error, 'No se pudo desactivar el almacén.');
			setErrors(fields);
			setDomain(message);
		}
	};

	return (
		<CatalogDialogFrame open={!!warehouse} title={warehouse ? `Desactivar ${warehouseLabel(warehouse)}` : ''} onClose={onClose} onSubmit={submit}
			submitLabel="Desactivar" pending={isPending} error={domain}>
			<Stack spacing={2}>
				<WarehouseStatusSummary summary={warehouse?.summary ?? EMPTY_SUMMARY} />
				<Typography sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
					No va a aparecer para cargar ni como destino. Su saldo sigue a la vista y podés transferirlo a otro almacén o reactivarlo cuando quieras.
				</Typography>
				{warehouse?.isDefault && isTank && candidates.length === 0 && (
					<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
						Es el único termo activo: los termos quedan sin predeterminado hasta que actives o crees otro.
					</Alert>
				)}
				{warehouse?.isDefault && (!isTank || candidates.length > 0) && (
					<>
						<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
							{isTank
								? 'Es el termo predeterminado. Elegí cuál pasa a serlo.'
								: 'Es el almacén predeterminado: las facturas y remitos entran a él. Elegí cuál pasa a serlo.'}
						</Alert>
						<TextField select label={isTank ? 'Nuevo termo predeterminado' : 'Nuevo almacén predeterminado'} variant="filled" fullWidth value={nextDefault}
							InputProps={{ sx: { bgcolor: 'action.hover' } }} error={!!errors.new_default_id} helperText={errors.new_default_id}
							onChange={(e) => setNextDefault(Number(e.target.value))}>
							{candidates.map((w) => (
								<MenuItem key={w.id} value={w.id}>{warehouseLabel(w)}</MenuItem>
							))}
						</TextField>
					</>
				)}
			</Stack>
		</CatalogDialogFrame>
	);
}
