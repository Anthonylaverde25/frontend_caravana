import { useState } from 'react';
import { Alert, Button, Stack, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { ItemDetail, ItemPresentation } from '@/core/items/domain/entities/Item';
import { formatQuantity } from '@/core/items/domain/rules/presentationName';
import { useSetItemPresentationActive } from '@/features/items/hooks/useItemMutations';
import RowActionsMenu from '../settings/RowActionsMenu';
import ItemPresentationDialog from '../dialogs/ItemPresentationDialog';
import SetActiveDialog from '../dialogs/SetActiveDialog';

/** The packages the item is bought in, converted to its unit (D16). */
export default function ItemPresentationsTab({ item }: { item: ItemDetail }) {
	const { headSx, indexSx, textCellSx } = useGridCellStyles();
	const { mutateAsync: setActive } = useSetItemPresentationActive();
	const [editing, setEditing] = useState<ItemPresentation | null | undefined>(undefined);
	const [toggling, setToggling] = useState<ItemPresentation | null>(null);
	const symbol = item.unit?.symbol ?? '';

	return (
		<Stack spacing={2} sx={{ maxWidth: 860 }}>
			<Stack direction="row" alignItems="center" justifyContent="space-between">
				<Typography sx={{ fontWeight: 700 }}>Presentaciones</Typography>
				<Button size="small" variant="outlined" disabled={!item.isActive} onClick={() => setEditing(null)}
					startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}>
					Agregar presentación
				</Button>
			</Stack>
			<SheetGrid minWidth={560}>
				<TableHead>
					<TableRow>
						<TableCell sx={indexSx}>#</TableCell>
						<TableCell sx={headSx}>Nombre</TableCell>
						<TableCell sx={{ ...headSx, width: 160 }} align="right">Contiene</TableCell>
						<TableCell sx={{ ...headSx, width: 110 }}>Estado</TableCell>
						<TableCell sx={{ ...headSx, width: 48 }} />
					</TableRow>
				</TableHead>
				<TableBody>
					{item.presentations.length === 0 && (
						<SheetGridEmptyRow colSpan={5}>Sin presentaciones: se carga directamente en {symbol || 'su unidad'}.</SheetGridEmptyRow>
					)}
					{item.presentations.map((p, index) => {
						const muted = p.isActive ? {} : { color: 'text.disabled' };
						return (
							<TableRow key={p.id} hover>
								<TableCell sx={indexSx}>{index + 1}</TableCell>
								<TableCell sx={{ ...textCellSx, fontWeight: 600, ...muted }}>{p.name}</TableCell>
								<TableCell sx={{ ...textCellSx, ...muted }} align="right">{formatQuantity(p.factorToItemUnit)} {symbol}</TableCell>
								<TableCell sx={{ ...textCellSx, ...muted }}>{p.isActive ? 'Activa' : 'Desactivada'}</TableCell>
								<SheetGridStatusCell>
									<RowActionsMenu actions={[
										{ label: 'Editar', onClick: () => setEditing(p) },
										{ label: p.isActive ? 'Desactivar' : 'Reactivar', onClick: () => setToggling(p) }
									]} />
								</SheetGridStatusCell>
							</TableRow>
						);
					})}
				</TableBody>
			</SheetGrid>
			<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
				Al cargar una compra vas a poder poner, por ejemplo, "10 {item.presentations[0]?.name ?? `Frascos × 500 ${symbol}`}" y el sistema la registra en {symbol || 'la unidad del ítem'}.
			</Alert>

			<ItemPresentationDialog open={editing !== undefined} item={item} presentation={editing ?? undefined} onClose={() => setEditing(undefined)} />
			<SetActiveDialog
				open={!!toggling}
				onClose={() => setToggling(null)}
				subject={toggling ? `la presentación ${toggling.name}` : ''}
				activate={!toggling?.isActive}
				consequence={toggling?.isActive ? 'Deja de ofrecerse al cargar compras.' : 'Vuelve a ofrecerse al cargar compras.'}
				onConfirm={() => setActive({ itemId: item.id, presentationId: toggling!.id, active: !toggling!.isActive })}
			/>
		</Stack>
	);
}
