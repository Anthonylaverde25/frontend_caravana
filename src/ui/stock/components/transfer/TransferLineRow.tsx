import { IconButton, TableCell, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { Item } from '@/core/items/domain/entities/Item';
import { dec, div, isPositive, mul, round, ZERO } from '@/core/stock/domain/rules/decimal';
import { convertPreview } from '@/core/stock/domain/rules/lineConversion';
import { formatMoney, formatQuantity } from '@/core/stock/domain/rules/quantityFormat';
import { stockIn, transferableQuantity } from '@/core/stock/domain/rules/warehouseRules';
import ItemPickerCell from '../cells/ItemPickerCell';
import SemenLotSelectCell from '../cells/SemenLotSelectCell';
import InputUnitSelectCell from '../cells/InputUnitSelectCell';
import { useItemInputOptions } from '../cells/useItemInputOptions';
import { isBlankTransfer, TransferLine } from './transferState';

interface TransferLineRowProps {
	index: number;
	line: TransferLine;
	items: Item[];
	fromWarehouseId: number | null;
	/** Some row is semen: the lot column shows (grey on the other rows). */
	showLot: boolean;
	errors: Record<string, string>;
	onChange: (patch: Partial<TransferLine>) => void;
	onRemove: () => void;
}

/**
 * One article moved: what the origin has valued (the most that can move, DD8), what waits for its
 * invoice and stays (Q2), and an estimate at today's average. The backend fixes the real cost.
 */
export default function TransferLineRow({ index, line, items, fromWarehouseId, showLot, errors, onChange, onRemove }: TransferLineRowProps) {
	const { cellSx, inputSx, textCellSx, errorRing } = useGridCellStyles();
	const { options, unitSymbol } = useItemInputOptions(line.itemId);
	const item = items.find((i) => i.id === line.itemId);
	const quantity = convertPreview(line.inputQuantity, options.find((o) => o.value === line.inputSource));
	const stock = item && fromWarehouseId !== null ? stockIn(item, fromWarehouseId) : null;
	const available = transferableQuantity(stock);
	const pending = dec(stock?.unvaluedQuantity) ?? ZERO;
	const average = isPositive(available) ? div(dec(stock?.value) ?? ZERO, available) : null;
	const estimate = quantity !== null && average !== null ? round(mul(quantity, average), 2) : null;

	return (
		<TableRow>
			<TableCell sx={{ ...cellSx, px: 1, color: 'text.disabled', fontSize: '0.72rem', width: 40 }}>{index + 1}</TableCell>
			<ItemPickerCell items={items} value={line.itemId} error={errors.item_id} placeholder="Buscar artículo…"
				onChange={(i) => onChange({ itemId: i?.id ?? null, inputSource: i?.unit ? `u:${i.unit.id}` : '', semenLotId: null })} />
			{showLot && (
				<SemenLotSelectCell itemId={line.itemId} isSemen={!!item?.isSemen} warehouseId={fromWarehouseId} value={line.semenLotId} error={errors.semen_lot_id}
					onChange={(semenLotId) => onChange({ semenLotId })} />
			)}
			<TableCell sx={{ ...cellSx, width: 90, ...(errors.input_quantity ? errorRing : {}) }}>
				<TextField fullWidth size="small" value={line.inputQuantity} sx={inputSx} inputProps={{ inputMode: 'decimal' }}
					onChange={(e) => onChange({ inputQuantity: e.target.value })} />
			</TableCell>
			<InputUnitSelectCell options={options} value={line.inputSource} onChange={(v) => onChange({ inputSource: v })}
				error={errors.input_unit_id ?? errors.input_presentation_id} />
			<TableCell sx={{ ...textCellSx, width: 110, color: 'text.secondary' }}>{quantity === null ? '' : formatQuantity(quantity, unitSymbol)}</TableCell>
			<TableCell sx={{ ...textCellSx, width: 150, color: 'text.secondary', whiteSpace: 'nowrap' }}>
				{item ? formatQuantity(available, unitSymbol) : ''}
				{item && isPositive(pending) && (
					<Typography component="div" variant="caption" sx={{ color: 'warning.dark', fontWeight: 600 }}>
						+ {formatQuantity(pending, unitSymbol)} pendientes, no se transfieren
					</Typography>
				)}
			</TableCell>
			<TableCell sx={{ ...textCellSx, width: 120, color: 'text.secondary', whiteSpace: 'nowrap' }} align="right">
				{estimate === null ? '' : formatMoney(estimate)}
			</TableCell>
			<SheetGridStatusCell error={Object.values(errors)[0]}>
				{!isBlankTransfer(line) && (
					<Tooltip title="Quitar renglón">
						<IconButton size="small" onClick={onRemove}>
							<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				)}
			</SheetGridStatusCell>
		</TableRow>
	);
}
