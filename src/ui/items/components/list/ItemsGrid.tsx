import { Box, Chip, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridTagCell } from 'src/components/sheet-grid/SheetGridTagCell';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { Item } from '@/core/items/domain/entities/Item';
import { behaviorInfo } from '@/core/items/domain/rules/itemBehavior';
import { formatQuantity } from '@/core/stock/domain/rules/quantityFormat';
import { dec, isNegative } from '@/core/stock/domain/rules/decimal';

interface ItemsGridProps {
	items: Item[];
	loading: boolean;
	emptyMessage: string;
	onOpen: (item: Item) => void;
}

const COLUMNS = 9;

/** Balance of a stock-tracked article: red when negative, an amber chip when critical; "—" otherwise. */
function StockCell({ item }: { item: Item }) {
	const { textCellSx } = useGridCellStyles();
	const quantity = dec(item.stock?.quantity);
	const negative = quantity !== null && isNegative(quantity);

	return (
		<TableCell sx={{ ...textCellSx, fontWeight: item.stock ? 600 : 400, color: negative ? 'error.main' : 'text.primary' }} align="right">
			{item.stock ? formatQuantity(item.stock.quantity, item.unit?.symbol) : '—'}
			{item.stock?.hasCritical && (
				<Chip label="Crítico" size="small" color="warning" variant="outlined" sx={{ ml: 0.75, height: 18, fontSize: '0.66rem', fontWeight: 700 }} />
			)}
		</TableCell>
	);
}

/** The catalog as a read-only grid; a row opens the item's file. */
export default function ItemsGrid({ items, loading, emptyMessage, onOpen }: ItemsGridProps) {
	const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();

	return (
		<SheetGrid minWidth={1020} maxHeight={{ xs: 520, lg: 'calc(100vh - 330px)' }}>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={{ ...headSx, width: 140 }}>Código</TableCell>
					<TableCell sx={headSx}>Nombre</TableCell>
					<TableCell sx={{ ...headSx, width: 240 }}>Categoría</TableCell>
					<TableCell sx={{ ...headSx, width: 90 }}>Unidad</TableCell>
					<TableCell sx={{ ...headSx, width: 140 }} align="right">Saldo</TableCell>
					<TableCell sx={{ ...headSx, width: 110 }} align="right">Presentaciones</TableCell>
					<TableCell sx={{ ...headSx, width: 100 }} align="right">Proveedores</TableCell>
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{!loading && items.length === 0 && <SheetGridEmptyRow colSpan={COLUMNS}>{emptyMessage}</SheetGridEmptyRow>}
				{loading && <SheetGridEmptyRow colSpan={COLUMNS}>Cargando catálogo…</SheetGridEmptyRow>}
				{items.map((item, index) => {
					const muted = !item.isActive ? { color: 'text.disabled' } : {};
					return (
						<TableRow
							key={item.id}
							hover
							onClick={() => onOpen(item)}
							sx={{ cursor: 'pointer', bgcolor: index % 2 === 1 ? zebraBg : undefined }}
						>
							<TableCell sx={indexSx}>{index + 1}</TableCell>
							<SheetGridTagCell tag={item.code} caption={behaviorInfo(item.behavior).caption} />
							<TableCell sx={{ ...textCellSx, fontWeight: 600, ...muted }}>{item.name}</TableCell>
							<TableCell sx={{ ...textCellSx, ...muted }}>
								<Tooltip title={item.category?.path ?? ''}>
									<Box component="span" sx={{ display: 'block', maxWidth: 230, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
										{item.category?.path ?? '—'}
									</Box>
								</Tooltip>
							</TableCell>
							<TableCell sx={{ ...textCellSx, ...muted }}>{item.unit?.symbol ?? '—'}</TableCell>
							<StockCell item={item} />
							<TableCell sx={{ ...textCellSx, ...muted }} align="right">{item.presentationsCount || '—'}</TableCell>
							<TableCell sx={{ ...textCellSx, ...muted }} align="right">{item.providersCount || '—'}</TableCell>
							<SheetGridStatusCell info={item.isActive ? undefined : 'Desactivado'}>
								<FuseSvgIcon size={16} color="action">heroicons-outline:chevron-right</FuseSvgIcon>
							</SheetGridStatusCell>
						</TableRow>
					);
				})}
			</TableBody>
		</SheetGrid>
	);
}
