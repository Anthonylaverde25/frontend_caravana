import { Link as RouterLink } from 'react-router';
import { Link, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { isPositiveText } from '@/core/stock/domain/rules/decimal';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { BatchHistoryRow } from '@/core/stock/domain/entities/ItemStock';
import { behaviorInfo } from '@/core/items/domain/rules/itemBehavior';
import { formatDate, formatMoney, formatQuantity } from '@/core/stock/domain/rules/quantityFormat';

/** Every operation the batch received, newest first. A voided one is struck through and adds nothing (DS12). */
export default function ConsumptionHistoryGrid({ rows }: { rows: BatchHistoryRow[] }) {
	const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();
	const head = (label: string, width?: number, align?: 'right') => (
		<TableCell
			sx={{ ...headSx, ...(width ? { width } : {}) }}
			align={align}
		>
			{label}
		</TableCell>
	);

	return (
		<SheetGrid
			minWidth={1000}
			maxHeight={420}
		>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					{head('Fecha', 100)}
					{head('Qué')}
					{head('Tipo', 150)}
					{head('Cantidad', 110, 'right')}
					{head('Cab.', 70, 'right')}
					{head('Costo', 130, 'right')}
					{head('Por cabeza', 120, 'right')}
					{head('Origen', 220)}
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{rows.length === 0 && (
					<SheetGridEmptyRow colSpan={10}>Todavía no recibió consumos ni servicios.</SheetGridEmptyRow>
				)}
				{rows.map((row, index) => {
					const voided = !!row.voided;
					const strike = voided ? { textDecoration: 'line-through', color: 'text.disabled' } : {};
					const href =
						row.reference.kind === 'item_document'
							? `/item-documents/${row.reference.id}`
							: `/fiscal-documents/${row.reference.id}`;
					return (
						<TableRow
							key={`${row.source}-${row.lineId}`}
							sx={{ bgcolor: index % 2 === 1 ? zebraBg : undefined }}
						>
							<TableCell sx={indexSx}>{index + 1}</TableCell>
							<TableCell sx={{ ...textCellSx, ...strike }}>{formatDate(row.occurredAt)}</TableCell>
							<TableCell sx={{ ...textCellSx, fontWeight: 600, ...strike }}>{row.itemName}</TableCell>
							<TableCell sx={{ ...textCellSx, color: 'text.secondary' }}>
								{behaviorInfo(row.behavior).label}
							</TableCell>
							<TableCell
								sx={{ ...textCellSx, ...strike }}
								align="right"
							>
								{formatQuantity(row.quantity, row.unitSymbol)}
							</TableCell>
							<TableCell
								sx={{ ...textCellSx, ...strike }}
								align="right"
							>
								{row.headsTreated}
							</TableCell>
							<TableCell
								sx={{ ...textCellSx, fontWeight: 700, ...strike }}
								align="right"
							>
								{formatMoney(row.cost)}
								{!voided && isPositiveText(row.pendingCostQuantity) && (
									<Tooltip title="Salieron de un remito sin precio: su costo se suma cuando llegue la factura.">
										<Typography
											component="div"
											variant="caption"
											sx={{
												color: 'warning.dark',
												fontWeight: 600,
												whiteSpace: 'nowrap',
												lineHeight: 1.2
											}}
										>
											+ {formatQuantity(row.pendingCostQuantity, row.unitSymbol)} pendientes
										</Typography>
									</Tooltip>
								)}
							</TableCell>
							<TableCell
								sx={{ ...textCellSx, ...strike }}
								align="right"
							>
								{voided ? '—' : formatMoney(row.costPerHead)}
							</TableCell>
							<TableCell sx={textCellSx}>
								<Link
									component={RouterLink}
									to={href}
									sx={{ fontSize: '0.82rem', fontWeight: 600 }}
								>
									{row.reference.label}
								</Link>
							</TableCell>
							<SheetGridStatusCell info={row.voided ?? undefined} />
						</TableRow>
					);
				})}
			</TableBody>
		</SheetGrid>
	);
}
