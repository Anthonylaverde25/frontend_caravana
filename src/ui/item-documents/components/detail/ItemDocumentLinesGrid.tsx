import { TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { isPositiveText } from '@/core/stock/domain/rules/decimal';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { ItemDocumentLine } from '@/core/stock/domain/entities/ItemDocument';
import { formatMoney, formatQuantity, formatUnitCost } from '@/core/stock/domain/rules/quantityFormat';

/** The lines of a stock operation with the movement each one left (or none: a count without difference). */
export default function ItemDocumentLinesGrid({ lines }: { lines: ItemDocumentLine[] }) {
	const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();

	return (
		<SheetGrid
			minWidth={980}
			maxHeight={{ xs: 520, lg: 'calc(100vh - 380px)' }}
		>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={headSx}>Artículo</TableCell>
					<TableCell sx={{ ...headSx, width: 200 }}>Cargado</TableCell>
					<TableCell
						sx={{ ...headSx, width: 130 }}
						align="right"
					>
						Cantidad
					</TableCell>
					<TableCell
						sx={{ ...headSx, width: 120 }}
						align="right"
					>
						Costo u.
					</TableCell>
					<TableCell
						sx={{ ...headSx, width: 130 }}
						align="right"
					>
						Costo
					</TableCell>
					<TableCell sx={{ ...headSx, width: 220 }}>Movimiento</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{lines.map((line, index) => {
					const symbol = line.item.unitSymbol;
					const m = line.movement;
					return (
						<TableRow
							key={line.id}
							sx={{ bgcolor: index % 2 === 1 ? zebraBg : undefined }}
						>
							<TableCell sx={indexSx}>{line.position}</TableCell>
							<TableCell sx={{ ...textCellSx, fontWeight: 600 }}>{line.item.name}</TableCell>
							<TableCell sx={textCellSx}>
								{line.countedQuantity !== null
									? `Contado: ${formatQuantity(line.countedQuantity, symbol)}`
									: `${formatQuantity(line.inputQuantity)} ${line.inputLabel ?? ''}`}
							</TableCell>
							<TableCell
								sx={textCellSx}
								align="right"
							>
								{formatQuantity(line.quantity, symbol)}
							</TableCell>
							<TableCell
								sx={{
									...textCellSx,
									...(line.unitCost === null ? { color: 'text.disabled', fontStyle: 'italic' } : {})
								}}
								align="right"
							>
								{line.unitCost === null ? 'Pendiente' : formatUnitCost(line.unitCost)}
							</TableCell>
							<TableCell
								sx={{ ...textCellSx, fontWeight: 700 }}
								align="right"
							>
								{formatMoney(line.totalCost)}
								{isPositiveText(line.unvaluedQuantity) && (
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
										+ {formatQuantity(line.unvaluedQuantity, symbol)} sin costo hasta la factura
									</Typography>
								)}
								{line.unabsorbedCost && (
									<Typography
										component="div"
										variant="caption"
										sx={{ color: 'warning.dark', fontWeight: 600 }}
									>
										{formatMoney(line.unabsorbedCost)} sin stock que lo absorba
									</Typography>
								)}
							</TableCell>
							<TableCell
								sx={{
									...textCellSx,
									color: m
										? m.direction > 0
											? 'success.main'
											: m.direction < 0
												? 'error.main'
												: 'info.main'
										: 'text.secondary'
								}}
							>
								{m
									? m.direction === 0
										? `Valoriza ${formatMoney(line.totalCost)} · saldo ${formatQuantity(m.balanceAfter, symbol)} sin cambio`
										: `${m.direction > 0 ? '+' : '−'}${formatQuantity(m.quantity, symbol)} → saldo ${formatQuantity(m.balanceAfter, symbol)}`
									: line.unabsorbedCost
										? 'Sin movimiento: no quedaba stock valorizado'
										: 'Sin diferencia: sin movimiento'}
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</SheetGrid>
	);
}
