import { useState } from 'react';
import { Alert, Button, Link, Stack, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { ItemDetail } from '@/core/items/domain/entities/Item';
import { formatDate, formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import ItemProvidersDialog from '../dialogs/ItemProvidersDialog';

/** Who sells the item, and the price and date of its last purchase to each one (derived, DS2). */
export default function ItemProvidersTab({ item }: { item: ItemDetail }) {
	const { headSx, indexSx, textCellSx } = useGridCellStyles();
	const [editing, setEditing] = useState(false);

	return (
		<Stack spacing={2} sx={{ maxWidth: 960 }}>
			<Stack direction="row" alignItems="center" justifyContent="space-between">
				<Typography sx={{ fontWeight: 700 }}>Proveedores que lo venden</Typography>
				<Button size="small" variant="outlined" onClick={() => setEditing(true)}
					startIcon={<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}>
					Editar proveedores
				</Button>
			</Stack>
			<SheetGrid minWidth={900}>
				<TableHead>
					<TableRow>
						<TableCell sx={indexSx}>#</TableCell>
						<TableCell sx={headSx}>Proveedor</TableCell>
						<TableCell sx={{ ...headSx, width: 150 }}>CUIT</TableCell>
						<TableCell sx={{ ...headSx, width: 130 }} align="right">Demora (días)</TableCell>
						<TableCell sx={{ ...headSx, width: 100 }} align="center">Preferido</TableCell>
						<TableCell sx={{ ...headSx, width: 300 }}>Última compra</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{item.providers.length === 0 && <SheetGridEmptyRow colSpan={6}>Todavía no hay proveedores vinculados.</SheetGridEmptyRow>}
					{item.providers.map((p, index) => (
						<TableRow key={p.providerId} hover>
							<TableCell sx={indexSx}>{index + 1}</TableCell>
							<TableCell sx={{ ...textCellSx, fontWeight: 600 }}>{p.name}</TableCell>
							<TableCell sx={{ ...textCellSx, fontFamily: 'monospace' }}>{p.cuit}</TableCell>
							<TableCell sx={textCellSx} align="right">{p.leadTimeDays ?? '—'}</TableCell>
							<TableCell sx={{ ...textCellSx, color: 'warning.main' }} align="center">
								{p.isPreferred ? <FuseSvgIcon size={18}>heroicons-solid:star</FuseSvgIcon> : ''}
							</TableCell>
							<TableCell sx={{ ...textCellSx, fontSize: '0.8rem' }}>
								{p.lastPurchase ? (
									<>
										{formatDate(p.lastPurchase.issuedAt)} · {formatMoney(p.lastPurchase.unitPrice)} por {p.lastPurchase.inputLabel} ·{' '}
										<Link component={RouterLink} to={`/fiscal-documents/${p.lastPurchase.fiscalDocumentId}`} onClick={(e) => e.stopPropagation()}>
											{p.lastPurchase.label}
										</Link>
									</>
								) : (
									<Typography component="span" variant="body2" color="text.secondary">Sin compras cargadas</Typography>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</SheetGrid>
			<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
				La última compra sale del último comprobante registrado de cada proveedor; uno anulado no cuenta.
			</Alert>

			<ItemProvidersDialog open={editing} item={item} onClose={() => setEditing(false)} />
		</Stack>
	);
}
