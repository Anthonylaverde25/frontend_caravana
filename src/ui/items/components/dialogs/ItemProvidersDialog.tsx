import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { Alert, Button, Link, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { ItemDetail } from '@/core/items/domain/entities/Item';
import { useSyncItemProviders } from '@/features/items/hooks/useItemMutations';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import CreateSupplierDialog from '@/ui/suppliers/components/CreateSupplierDialog';
import CatalogDialogFrame from '../CatalogDialogFrame';
import { readApiErrors } from '../apiErrors';
import ItemProvidersGrid, { ProviderRow } from './item-providers/ItemProvidersGrid';

interface ItemProvidersDialogProps {
	open: boolean;
	onClose: () => void;
	item: ItemDetail;
}

const ITEMS_ROLE = { supplies_livestock: false, supplies_items: true };
let rowSeq = 0;
const newKey = () => `row-${++rowSeq}`;

/**
 * The whole list of the item's providers, saved at once (DB4). Only providers that sell articles
 * or services are offered (I9); a new one can be created on the spot with that role already set.
 */
export default function ItemProvidersDialog({ open, onClose, item }: ItemProvidersDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { data: suppliers = [] } = useSuppliers('items');
	const { mutate, isPending } = useSyncItemProviders();
	const [rows, setRows] = useState<ProviderRow[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [domainError, setDomainError] = useState<string | null>(null);
	const [creatingSupplier, setCreatingSupplier] = useState(false);
	const options = useMemo(() => suppliers.filter((s) => s.id).map((s) => ({ id: s.id as number, name: s.name, cuit: s.cuit })), [suppliers]);

	useEffect(() => {
		if (!open) return;
		setRows(item.providers.map((p) => ({ key: newKey(), providerId: p.providerId, leadTimeDays: p.leadTimeDays?.toString() ?? '', isPreferred: p.isPreferred })));
		setErrors({});
		setDomainError(null);
	}, [open, item]);

	const change = (key: string, changes: Partial<ProviderRow>) => {
		// The row's notice belonged to what it held before: a correction clears it.
		setErrors(({ [key]: _cleared, ...rest }) => rest);
		setRows((prev) =>
			prev.map((r) => {
				if (r.key === key) return { ...r, ...changes };
				// Marking one as preferred unmarks the previous one (I6).
				return changes.isPreferred ? { ...r, isPreferred: false } : r;
			})
		);
	};
	const addRow = () => setRows((prev) => [...prev, { key: newKey(), providerId: 0, leadTimeDays: '', isPreferred: prev.length === 0 }]);

	const submit = () => {
		const local: Record<string, string> = {};
		rows.forEach((r) => {
			if (!r.providerId) local[r.key] = 'Elegí el proveedor o quitá la fila.';
			else if (r.leadTimeDays && Number(r.leadTimeDays) > 365) local[r.key] = 'La demora va de 0 a 365 días.';
		});
		setErrors(local);
		setDomainError(null);
		if (Object.keys(local).length) return;

		mutate(
			{
				itemId: item.id,
				links: rows.map((r) => ({ provider_id: r.providerId, lead_time_days: r.leadTimeDays === '' ? null : Number(r.leadTimeDays), is_preferred: r.isPreferred }))
			},
			{
				onSuccess: () => {
					enqueueSnackbar('Proveedores guardados', { variant: 'success' });
					onClose();
				},
				onError: (error) => {
					const { fields, domain } = readApiErrors(error);
					const byRow: Record<string, string> = {};
					Object.entries(fields).forEach(([field, message]) => {
						const index = Number(field.match(/^providers\.(\d+)\./)?.[1]);
						if (rows[index]) byRow[rows[index].key] = message;
					});
					setErrors(byRow);
					setDomainError(domain ?? (Object.keys(byRow).length ? null : 'No se pudo guardar.'));
				}
			}
		);
	};

	return (
		<>
			<CatalogDialogFrame open={open} title={`Proveedores de ${item.name}`} onClose={onClose} onSubmit={submit} submitLabel="Guardar" pending={isPending} error={domainError} maxWidth="md">
				<Stack spacing={2}>
					{options.length === 0 && (
						<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
							Ningún proveedor de la empresa está marcado como vendedor de artículos o servicios. Creá uno abajo, o marcá el rol en uno existente desde{' '}
							<Link component={RouterLink} to="/providers">Proveedores</Link>.
						</Alert>
					)}
					<ItemProvidersGrid rows={rows} options={options} onChange={change} onRemove={(key) => setRows((prev) => prev.filter((r) => r.key !== key))} errors={errors} />
					<Stack direction="row" spacing={1}>
						<Button size="small" onClick={addRow} startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>} sx={{ textTransform: 'none', fontWeight: 600 }}>
							Agregar proveedor
						</Button>
						<Button size="small" onClick={() => setCreatingSupplier(true)} startIcon={<FuseSvgIcon size={16}>heroicons-outline:user-plus</FuseSvgIcon>} sx={{ textTransform: 'none', fontWeight: 600 }}>
							Nuevo proveedor…
						</Button>
					</Stack>
				</Stack>
			</CatalogDialogFrame>

			<CreateSupplierDialog
				open={creatingSupplier}
				onClose={() => setCreatingSupplier(false)}
				defaultRoles={ITEMS_ROLE}
				onSuccess={(created) => {
					if (created?.id) setRows((prev) => [...prev, { key: newKey(), providerId: created.id, leadTimeDays: '', isPreferred: prev.length === 0 }]);
				}}
			/>
		</>
	);
}
