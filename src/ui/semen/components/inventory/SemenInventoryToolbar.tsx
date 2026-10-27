import { FormControlLabel, InputAdornment, MenuItem, Stack, Switch, TextField } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Warehouse } from '@/core/stock/domain/entities/ItemStock';
import { warehouseLabel } from '@/core/stock/domain/rules/warehouseRules';

interface SemenInventoryToolbarProps {
	search: string;
	onSearch: (value: string) => void;
	tanks: Warehouse[];
	warehouseId: number | null;
	onWarehouse: (id: number | null) => void;
	withBalance: boolean;
	onWithBalance: (value: boolean) => void;
}

/** Search by sire, registry, breed, item code or lot; filter by tank and by balance. */
export default function SemenInventoryToolbar({ search, onSearch, tanks, warehouseId, onWarehouse, withBalance, onWithBalance }: SemenInventoryToolbarProps) {
	return (
		<Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
			<TextField size="small" placeholder="Buscar padre, registro, raza o partida…" value={search} onChange={(e) => onSearch(e.target.value)}
				sx={{ width: { xs: '100%', md: 320 }, bgcolor: 'background.paper' }}
				InputProps={{ startAdornment: <InputAdornment position="start"><FuseSvgIcon size={18}>heroicons-outline:magnifying-glass</FuseSvgIcon></InputAdornment> }} />
			<TextField select size="small" label="Termo" value={warehouseId ?? ''} onChange={(e) => onWarehouse(e.target.value === '' ? null : Number(e.target.value))}
				sx={{ width: { xs: '100%', md: 240 }, bgcolor: 'background.paper' }}>
				<MenuItem value="">Todos los termos</MenuItem>
				{tanks.map((t) => (
					<MenuItem key={t.id} value={t.id}>{warehouseLabel(t)}{t.isActive ? '' : ' (inactivo)'}</MenuItem>
				))}
			</TextField>
			<FormControlLabel control={<Switch size="small" checked={withBalance} onChange={(e) => onWithBalance(e.target.checked)} />}
				label="Sólo con saldo" sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }} />
		</Stack>
	);
}
