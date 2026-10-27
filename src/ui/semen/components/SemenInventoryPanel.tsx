import { useMemo, useState } from 'react';
import { Alert, Stack } from '@mui/material';
import { useSemenInventory } from '@/features/semen/hooks/useSemen';
import { useWarehouses } from '@/features/stock/hooks/useWarehouses';
import SemenInventoryToolbar from './inventory/SemenInventoryToolbar';
import SemenInventoryGrid from './inventory/SemenInventoryGrid';
import SemenLotDrawer from './lot/SemenLotDrawer';
import SemenReceiptDialog from './receipt/SemenReceiptDialog';
import IdentifySemenLotDialog, { IdentifyTarget } from './identify/IdentifySemenLotDialog';

interface SemenInventoryPanelProps {
	receiving: boolean;
	onOpenReceipt: () => void;
	onCloseReceipt: () => void;
}

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * The semen tab of the catalog (plan 4.7): one group per sire and type with its lots per tank and its
 * straws without lot. Thin container: filters, the entry dialog, the lot drawer and the identification.
 */
export default function SemenInventoryPanel({ receiving, onOpenReceipt, onCloseReceipt }: SemenInventoryPanelProps) {
	const [search, setSearch] = useState('');
	const [warehouseId, setWarehouseId] = useState<number | null>(null);
	const [withBalance, setWithBalance] = useState(true);
	const [lotId, setLotId] = useState<number | null>(null);
	const [identifying, setIdentifying] = useState<IdentifyTarget | null>(null);
	const { data: rows = [], isLoading } = useSemenInventory({ warehouseId, withBalance });
	const { data: warehouses = [] } = useWarehouses();
	const tanks = warehouses.filter((w) => w.kind === 'CRYO_TANK');

	const visible = useMemo(() => {
		const term = normalize(search.trim());
		if (!term) return rows;
		return rows.filter((r) =>
			normalize(`${r.sire.name} ${r.sire.registryCode ?? ''} ${r.sire.breed ?? ''} ${r.item.code} ${r.lots.map((l) => l.code).join(' ')}`).includes(term)
		);
	}, [rows, search]);

	return (
		<Stack spacing={2} component="main">
			{tanks.length === 0 && (
				<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
					El semen se guarda en termos. Creá el primero desde Ingresar semen o en Configuración › Almacenes (tipo Termo).
				</Alert>
			)}
			<SemenInventoryToolbar search={search} onSearch={setSearch} tanks={tanks} warehouseId={warehouseId} onWarehouse={setWarehouseId}
				withBalance={withBalance} onWithBalance={setWithBalance} />
			<SemenInventoryGrid rows={visible} loading={isLoading} warehouseId={warehouseId} onOpenLot={setLotId} onIdentify={setIdentifying} onReceive={onOpenReceipt}
				emptyMessage={rows.length === 0 ? 'Todavía no hay semen. Ingresá el primero.' : 'Ningún semen coincide con la búsqueda.'} />
			<SemenLotDrawer lotId={lotId} onClose={() => setLotId(null)} />
			{receiving && <SemenReceiptDialog onClose={onCloseReceipt} />}
			{identifying && <IdentifySemenLotDialog target={identifying} onClose={() => setIdentifying(null)} />}
		</Stack>
	);
}
