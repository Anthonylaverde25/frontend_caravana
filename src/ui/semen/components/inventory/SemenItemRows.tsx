import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Chip, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import { SheetGridGroupRow } from 'src/components/sheet-grid/SheetGridGroupRow';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { SheetGridTagCell } from 'src/components/sheet-grid/SheetGridTagCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { SemenInventoryRow } from '@/core/semen/domain/entities/Semen';
import { straws } from '@/core/semen/domain/rules/semenLabels';
import { formatDate, formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import { IdentifyTarget } from '../identify/IdentifySemenLotDialog';
import { SEMEN_GRID_COLUMNS } from './semenGrid';

interface SemenItemRowsProps {
	row: SemenInventoryRow;
	warehouseId: number | null;
	onOpenLot: (lotId: number) => void;
	onIdentify: (target: IdentifyTarget) => void;
}

const sum = (values: string[]) => values.reduce((total, v) => total + Number(v), 0);

/** The group of one semen: heading with totals, a row per lot and, in amber, its straws without lot. */
export default function SemenItemRows({ row, warehouseId, onOpenLot, onIdentify }: SemenItemRowsProps) {
	const navigate = useNavigate();
	const { cellSx, textCellSx, zebraBg } = useGridCellStyles();
	const [open, setOpen] = useState(true);
	const stocks = warehouseId === null ? row.stocks : row.stocks.filter((s) => s.warehouse.id === warehouseId);
	const total = sum(stocks.map((s) => s.quantity));
	const value = sum(stocks.map((s) => s.value));
	const inTank = <T extends { warehouse: { id: number } }>(balances: T[]): T[] => (warehouseId === null ? balances : balances.filter((b) => b.warehouse.id === warehouseId));
	const lots = row.lots.filter((l) => inTank(l.balances).length > 0);
	const pending = inTank(row.unidentified).filter((u) => Number(u.pendingIn) > 0 || Number(u.pendingOut) > 0);
	const sire = [row.sire.registryCode, row.sire.breed, row.sire.caravanTag ? `toro propio ${row.sire.caravanTag}` : null].filter(Boolean).join(' · ');

	return (
		<>
			<SheetGridGroupRow
				colSpan={SEMEN_GRID_COLUMNS}
				name={`${row.sire.name} · ${row.semenType.label}`}
				caption={[sire, row.item.code, row.item.isActive ? null : 'inactivo'].filter(Boolean).join(' · ')}
				fold={{ open, onToggle: () => setOpen((o) => !o) }}
				trailing={
					<>
						<Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{straws(total)}</Typography>
						<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{formatMoney(String(value))}</Typography>
						<Button size="small" onClick={() => navigate(`/items/${row.item.id}`)} sx={{ textTransform: 'none', fontWeight: 600 }}>Ver ítem</Button>
					</>
				}
			/>
			{open && lots.map((lot, index) => {
				const balances = inTank(lot.balances);
				return (
					<TableRow key={lot.id} hover onClick={() => onOpenLot(lot.id)} sx={{ cursor: 'pointer', bgcolor: index % 2 ? zebraBg : undefined }}>
						<TableCell sx={{ ...cellSx, px: 1, color: 'text.disabled', fontSize: '0.72rem', width: 40 }}>{index + 1}</TableCell>
						<SheetGridTagCell tag={lot.code} />
						<TableCell sx={textCellSx}>{lot.collectionDate ? formatDate(lot.collectionDate) : '—'}</TableCell>
						<TableCell sx={{ ...textCellSx, color: 'text.secondary' }}>
							{lot.firstEntry ? `${formatDate(lot.firstEntry.occurredAt)}${lot.firstEntry.provider ? ` · ${lot.firstEntry.provider}` : ''}` : '—'}
						</TableCell>
						<TableCell sx={textCellSx}>{balances.map((b) => `${b.warehouse.code} ${straws(b.quantity)}`).join(' · ')}</TableCell>
						<TableCell sx={{ ...textCellSx, fontWeight: 600 }} align="right">{straws(sum(balances.map((b) => b.quantity)))}</TableCell>
						<SheetGridStatusCell />
					</TableRow>
				);
			})}
			{open && pending.map((u) => (
				<TableRow key={`u-${u.warehouse.id}`}>
					<TableCell sx={{ ...cellSx, px: 1, width: 40 }} />
					<TableCell sx={{ ...textCellSx, color: 'warning.dark', fontWeight: 700 }} colSpan={3}>
						<Chip size="small" label="Sin identificar" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, mr: 1 }} />
						Pajuelas sin partida en {u.warehouse.code}
					</TableCell>
					<TableCell sx={{ ...textCellSx, color: 'warning.dark' }}>
						{Number(u.pendingIn) > 0 ? `${straws(u.pendingIn)} entraron` : ''}
						{Number(u.pendingIn) > 0 && Number(u.pendingOut) > 0 ? ' · ' : ''}
						{Number(u.pendingOut) > 0 ? `${straws(u.pendingOut)} salieron` : ''}
					</TableCell>
					<TableCell sx={{ ...textCellSx, color: 'warning.dark', fontWeight: 600 }} align="right">{straws(Number(u.pendingIn) - Number(u.pendingOut))}</TableCell>
					<SheetGridStatusCell>
						<Tooltip title="Identificar la partida">
							<Button size="small" onClick={() => onIdentify({ itemId: row.item.id, itemName: row.item.name, warehouseId: u.warehouse.id, warehouseCode: u.warehouse.code })}
								sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0, color: 'warning.dark' }}>
								Identificar
							</Button>
						</Tooltip>
					</SheetGridStatusCell>
				</TableRow>
			))}
		</>
	);
}
