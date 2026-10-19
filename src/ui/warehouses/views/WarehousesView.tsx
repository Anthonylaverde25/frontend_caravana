import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Alert, Button, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import ViewLayout from 'src/components/ViewLayout';
import { Warehouse } from '@/core/stock/domain/entities/ItemStock';
import { useSetDefaultWarehouse, useSetWarehouseActive, useWarehouses } from '@/features/stock/hooks/useWarehouses';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import TransferDialog from '@/ui/stock/components/transfer/TransferDialog';
import WarehousesGrid from '../components/WarehousesGrid';
import WarehouseFormDialog from '../components/WarehouseFormDialog';
import DeactivateWarehouseDialog from '../components/DeactivateWarehouseDialog';

const TEXT_BUTTON = { fontWeight: 600, color: 'primary.main', textTransform: 'none' } as const;

/** `/warehouses`: where the company keeps its stock (delivery D). `?new=1` opens the form. */
export default function WarehousesView() {
	const { enqueueSnackbar } = useSnackbar();
	const [params, setParams] = useSearchParams();
	const { data: warehouses = [], isLoading } = useWarehouses();
	const { mutateAsync: makeDefault } = useSetDefaultWarehouse();
	const { mutateAsync: setActive } = useSetWarehouseActive();
	const [editing, setEditing] = useState<Warehouse | null | undefined>(params.get('new') ? null : undefined);
	const [deactivating, setDeactivating] = useState<Warehouse | null>(null);
	const [transferFrom, setTransferFrom] = useState<number | null | undefined>(undefined);

	const run = async (action: () => Promise<unknown>, done: string) => {
		try {
			await action();
			enqueueSnackbar(done, { variant: 'success' });
		} catch (error) {
			enqueueSnackbar(readApiErrors(error).domain ?? Object.values(readApiErrors(error).fields)[0], { variant: 'error' });
		}
	};

	const closeForm = () => {
		setEditing(undefined);
		if (params.get('new')) setParams({}, { replace: true });
	};

	return (
		<ViewLayout
			title="Almacenes"
			subtitle="Dónde se guarda el stock de la empresa."
			actions={
				<Stack direction="row" spacing={1.5}>
					<Button variant="text" onClick={() => setTransferFrom(null)} startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrows-right-left</FuseSvgIcon>} sx={TEXT_BUTTON}>
						Transferir
					</Button>
					<Button variant="contained" onClick={() => setEditing(null)} startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>}
						sx={{ bgcolor: 'primary.main', borderRadius: '6px', px: 3, fontWeight: 700, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}>
						Nuevo almacén
					</Button>
				</Stack>
			}
		>
			<Stack spacing={2} component="main">
				<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
					Las facturas, remitos y tickets entran al almacén predeterminado. Para reubicar mercadería, usá Transferir.
				</Alert>
				{!isLoading && (
					<WarehousesGrid warehouses={warehouses} onEdit={setEditing} onDeactivate={setDeactivating} onTransfer={(w) => setTransferFrom(w.id)}
						onMakeDefault={(w) => run(() => makeDefault(w.id), `${w.code} es ahora el almacén predeterminado.`)}
						onReactivate={(w) => run(() => setActive({ id: w.id, active: true }), `Almacén ${w.code} reactivado.`)} />
				)}
			</Stack>
			<WarehouseFormDialog open={editing !== undefined} warehouse={editing ?? undefined} onClose={closeForm} />
			<DeactivateWarehouseDialog warehouse={deactivating} onClose={() => setDeactivating(null)} />
			{transferFrom !== undefined && <TransferDialog fromWarehouseId={transferFrom} onClose={() => setTransferFrom(undefined)} />}
		</ViewLayout>
	);
}
