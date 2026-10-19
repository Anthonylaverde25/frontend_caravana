import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Pagination, Stack, TableBody, TableCell, TableHead, TableRow, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { isPositiveText } from '@/core/stock/domain/rules/decimal';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { useItemKardex } from '@/features/stock/hooks/useItemStock';
import { useWarehouses } from '@/features/stock/hooks/useWarehouses';
import { ItemDetail } from '@/core/items/domain/entities/Item';
import { formatDate, formatMoney, formatQuantity, formatUnitCost } from '@/core/stock/domain/rules/quantityFormat';

/** The Kardex tab: every movement in load order, newest first (D4), with the balance and average after it. */
export default function ItemKardexTab({ item }: { item: ItemDetail }) {
	const navigate = useNavigate();
	const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();
	const [page, setPage] = useState(1);
	const [warehouseId, setWarehouseId] = useState<number | 'ALL'>('ALL');
	const { data: warehouses = [] } = useWarehouses();
	const { data, isLoading } = useItemKardex(item.id, { page, warehouseId: warehouseId === 'ALL' ? undefined : warehouseId });
	const symbol = item.unit?.symbol ?? null;
	const pages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;
	const head = (label: string, width?: number, align?: 'right') => (
		<TableCell
			sx={{ ...headSx, ...(width ? { width } : {}) }}
			align={align}
		>
			{label}
		</TableCell>
	);

	return (
		<Stack spacing={1.5}>
			{warehouses.length > 1 && (
				<ToggleButtonGroup size="small" exclusive value={warehouseId} onChange={(_, v) => { if (v !== null) { setWarehouseId(v); setPage(1); } }}
					sx={{ flexWrap: 'wrap', '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, px: 1.5 } }}>
					<ToggleButton value="ALL">Todos los almacenes</ToggleButton>
					{warehouses.map((w) => (
						<ToggleButton key={w.id} value={w.id}>{w.code}</ToggleButton>
					))}
				</ToggleButtonGroup>
			)}
			<SheetGrid
				minWidth={1100}
				maxHeight={{ xs: 520, lg: 'calc(100vh - 380px)' }}
			>
				<TableHead>
					<TableRow>
						<TableCell sx={indexSx}>#</TableCell>
						{head('Fecha', 100)}
						{head('Movimiento', 170)}
						{head('Origen')}
						{head('Entrada', 120, 'right')}
						{head('Salida', 120, 'right')}
						{head('Saldo', 120, 'right')}
						{head('Costo u.', 110, 'right')}
						{head('Promedio', 110, 'right')}
					</TableRow>
				</TableHead>
				<TableBody>
					{isLoading && <SheetGridEmptyRow colSpan={9}>Cargando kardex…</SheetGridEmptyRow>}
					{!isLoading && data?.data.length === 0 && (
						<SheetGridEmptyRow colSpan={9}>Todavía no tuvo movimientos.</SheetGridEmptyRow>
					)}
					{data?.data.map((row, index) => (
						<TableRow
							key={row.id}
							hover
							onClick={() => navigate(`/item-documents/${row.documentId}`)}
							sx={{ cursor: 'pointer', bgcolor: index % 2 === 1 ? zebraBg : undefined }}
						>
							<TableCell sx={indexSx}>{index + 1 + (page - 1) * (data?.perPage ?? 0)}</TableCell>
							<TableCell sx={textCellSx}>{formatDate(row.occurredAt)}</TableCell>
							<TableCell sx={{ ...textCellSx, fontWeight: 600 }}>
								{row.documentTypeLabel} N.º {row.documentNumber}
							</TableCell>
							<TableCell sx={{ ...textCellSx, color: 'text.secondary' }}>
								{row.fiscalDocument
									? `${row.fiscalDocument.label} · ${row.fiscalDocument.provider}`
									: (row.transfer ?? row.batch ?? '—')}
							</TableCell>
							<TableCell
								sx={{ ...textCellSx, color: 'success.main' }}
								align="right"
							>
								{row.direction > 0
									? formatQuantity(row.quantity, symbol)
									: row.direction === 0
										? `+ ${formatMoney(row.totalCost)}`
										: ''}
							</TableCell>
							<TableCell
								sx={{ ...textCellSx, color: 'error.main' }}
								align="right"
							>
								{row.direction < 0 ? formatQuantity(row.quantity, symbol) : ''}
							</TableCell>
							<TableCell
								sx={{ ...textCellSx, fontWeight: 700 }}
								align="right"
							>
								{formatQuantity(row.balanceAfter, symbol)}
								{isPositiveText(row.unvaluedBalanceAfter) && (
									<Typography
										component="div"
										variant="caption"
										sx={{ color: 'warning.dark' }}
									>
										{formatQuantity(row.unvaluedBalanceAfter, symbol)} sin valorizar
									</Typography>
								)}
							</TableCell>
							<TableCell
								sx={{
									...textCellSx,
									...(row.unitCost === null ? { color: 'text.disabled', fontStyle: 'italic' } : {})
								}}
								align="right"
							>
								{row.unitCost === null ? 'pendiente' : formatUnitCost(row.unitCost)}
							</TableCell>
							<TableCell
								sx={textCellSx}
								align="right"
							>
								{formatUnitCost(row.averageCostAfter)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</SheetGrid>
			{pages > 1 && (
				<Pagination
					count={pages}
					page={page}
					onChange={(_, p) => setPage(p)}
					sx={{ alignSelf: 'center' }}
				/>
			)}
		</Stack>
	);
}
