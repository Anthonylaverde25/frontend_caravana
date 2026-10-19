import { Chip, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridTagCell } from 'src/components/sheet-grid/SheetGridTagCell';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { Warehouse } from '@/core/stock/domain/entities/ItemStock';
import { formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import RowActionsMenu from '@/ui/items/components/settings/RowActionsMenu';

interface WarehousesGridProps {
	warehouses: Warehouse[];
	onEdit: (w: Warehouse) => void;
	onMakeDefault: (w: Warehouse) => void;
	onTransfer: (w: Warehouse) => void;
	onDeactivate: (w: Warehouse) => void;
	onReactivate: (w: Warehouse) => void;
}

const COLUMNS = 8;

/** One row per warehouse with what it holds; an inactive one shows in grey and only gives stock out. */
export default function WarehousesGrid({ warehouses, onEdit, onMakeDefault, onTransfer, onDeactivate, onReactivate }: WarehousesGridProps) {
	const { headSx, indexSx, textCellSx } = useGridCellStyles();

	return (
		<SheetGrid minWidth={900} maxHeight={{ xs: 520, lg: 'calc(100vh - 340px)' }}>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={{ ...headSx, width: 120 }}>Código</TableCell>
					<TableCell sx={headSx}>Nombre</TableCell>
					<TableCell sx={{ ...headSx, width: 150 }} align="right">Artículos con saldo</TableCell>
					<TableCell sx={{ ...headSx, width: 150 }} align="right">Valor</TableCell>
					<TableCell sx={{ ...headSx, width: 170 }}>Pendiente de valorizar</TableCell>
					<TableCell sx={{ ...headSx, width: 100 }} align="right">Novedades</TableCell>
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{warehouses.length === 0 && <SheetGridEmptyRow colSpan={COLUMNS}>Sin almacenes.</SheetGridEmptyRow>}
				{warehouses.map((w, index) => {
					const muted = w.isActive ? {} : { color: 'text.disabled' };
					const s = w.summary;
					return (
						<TableRow key={w.id} hover>
							<TableCell sx={indexSx}>{index + 1}</TableCell>
							<SheetGridTagCell tag={w.code} caption={w.isActive ? undefined : 'inactivo'} />
							<TableCell sx={{ ...textCellSx, fontWeight: 600, ...muted }}>
								{w.name}
								{w.isDefault && <Chip size="small" label="Predeterminado" color="primary" variant="outlined" sx={{ ml: 1, height: 20, fontSize: '0.7rem', fontWeight: 700 }} />}
							</TableCell>
							<TableCell sx={{ ...textCellSx, ...muted }} align="right">{s?.itemsWithBalance ?? 0}</TableCell>
							<TableCell sx={{ ...textCellSx, ...muted }} align="right">{formatMoney(s?.valuedValue ?? '0')}</TableCell>
							<TableCell sx={{ ...textCellSx, ...muted, color: s?.itemsWithUnvalued ? 'warning.dark' : muted.color }}>
								{s?.itemsWithUnvalued ? `${s.itemsWithUnvalued} ${s.itemsWithUnvalued === 1 ? 'artículo' : 'artículos'}` : '—'}
							</TableCell>
							<TableCell sx={{ ...textCellSx, ...muted }} align="right">{s?.openIncidents || '—'}</TableCell>
							{/* The row action stays reachable on an inactive row: "Reactivar" lives in it. */}
							<SheetGridStatusCell>
								<RowActionsMenu
									actions={[
										{ label: 'Editar', onClick: () => onEdit(w) },
										...(w.isActive && !w.isDefault ? [{ label: 'Hacer predeterminado', onClick: () => onMakeDefault(w) }] : []),
										{ label: 'Transferir desde aquí', onClick: () => onTransfer(w) },
										w.isActive ? { label: 'Desactivar', onClick: () => onDeactivate(w) } : { label: 'Reactivar', onClick: () => onReactivate(w) }
									]}
								/>
							</SheetGridStatusCell>
						</TableRow>
					);
				})}
			</TableBody>
		</SheetGrid>
	);
}
