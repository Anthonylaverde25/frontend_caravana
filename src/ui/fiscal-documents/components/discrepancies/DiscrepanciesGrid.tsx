import { Button, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { FiscalDiscrepancy } from '@/core/fiscal/domain/entities/DeliveryNote';
import { formatDate, formatMoney, formatQuantity } from '@/core/stock/domain/rules/quantityFormat';

interface DiscrepanciesGridProps {
	rows: FiscalDiscrepancy[];
	loading: boolean;
	onResolve: (row: FiscalDiscrepancy) => void;
}

/** Prices and totals are money; quantities, missing and extra lines are amounts of the item. */
const value = (row: FiscalDiscrepancy, raw: string | null): string =>
	raw === null ? '—' : row.type === 'PRICE' || row.type === 'TOTAL' ? formatMoney(raw) : formatQuantity(raw);

const STATUS: Record<FiscalDiscrepancy['status'], string> = {
	OPEN: 'Abierta',
	RESOLVED: 'Resuelta',
	CANCELLED: 'Cancelada'
};

/** The differences of an invoice with its delivery notes (DC7); open ones are closed by hand (DC8). */
export default function DiscrepanciesGrid({ rows, loading, onResolve }: DiscrepanciesGridProps) {
	const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();

	return (
		<SheetGrid
			minWidth={1040}
			maxHeight={{ xs: 420, lg: 360 }}
		>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={{ ...headSx, width: 160 }}>Novedad</TableCell>
					<TableCell sx={headSx}>Detalle</TableCell>
					<TableCell
						sx={{ ...headSx, width: 120 }}
						align="right"
					>
						Remito
					</TableCell>
					<TableCell
						sx={{ ...headSx, width: 120 }}
						align="right"
					>
						Factura
					</TableCell>
					<TableCell sx={{ ...headSx, width: 240 }}>Estado</TableCell>
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{loading && <SheetGridEmptyRow colSpan={7}>Cargando novedades…</SheetGridEmptyRow>}
				{rows.map((row, index) => (
					<TableRow
						key={row.id}
						sx={{
							bgcolor: index % 2 === 1 ? zebraBg : undefined,
							...(row.status === 'CANCELLED'
								? { opacity: 0.5, '& td': { textDecoration: 'line-through' } }
								: {})
						}}
					>
						<TableCell sx={indexSx}>{index + 1}</TableCell>
						<TableCell sx={{ ...textCellSx, fontWeight: 600 }}>{row.typeLabel}</TableCell>
						<TableCell sx={{ ...textCellSx, whiteSpace: 'normal', py: 1 }}>{row.detail}</TableCell>
						<TableCell
							sx={textCellSx}
							align="right"
						>
							{value(row, row.expectedValue)}
						</TableCell>
						<TableCell
							sx={textCellSx}
							align="right"
						>
							{value(row, row.actualValue)}
						</TableCell>
						<TableCell sx={{ ...textCellSx, whiteSpace: 'normal', py: 1 }}>
							{row.status === 'OPEN' ? (
								<Button
									size="small"
									onClick={() => onResolve(row)}
									sx={{ textTransform: 'none', fontWeight: 700 }}
								>
									Resolver
								</Button>
							) : (
								<>
									<Typography
										variant="body2"
										sx={{ fontWeight: 600 }}
									>
										{STATUS[row.status]}
									</Typography>
									{row.resolution && (
										<Typography
											variant="caption"
											color="text.secondary"
										>
											{row.resolution} · {row.resolvedBy} · {formatDate(row.resolvedAt)}
										</Typography>
									)}
								</>
							)}
						</TableCell>
						<SheetGridStatusCell
							warning={row.status === 'OPEN' ? 'Para resolver con el proveedor.' : undefined}
						/>
					</TableRow>
				))}
			</TableBody>
		</SheetGrid>
	);
}
