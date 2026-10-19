import { IconButton, TableCell, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { Item } from '@/core/items/domain/entities/Item';
import { type Dec, dec, div, isPositive, mul, round, sub, ZERO } from '@/core/stock/domain/rules/decimal';
import { convertPreview } from '@/core/stock/domain/rules/lineConversion';
import { formatMoney, formatQuantity } from '@/core/stock/domain/rules/quantityFormat';
import { stockIn } from '@/core/stock/domain/rules/warehouseRules';
import ItemPickerCell from '../cells/ItemPickerCell';
import InputUnitSelectCell from '../cells/InputUnitSelectCell';
import { useItemInputOptions } from '../cells/useItemInputOptions';
import { ConsumptionLine, isBlankConsumption } from './consumptionState';

interface ConsumptionLineRowProps {
	index: number;
	line: ConsumptionLine;
	items: Item[];
	errors: Record<string, string>;
	/** The warehouse it leaves from; null: the default, whose figures are the item's total while it is the only one. */
	warehouseId: number | null;
	onChange: (patch: Partial<ConsumptionLine>) => void;
	onRemove: () => void;
}

type Figures = ReturnType<typeof stockIn>;

/** Units with a cost: the balance minus what waits for its invoice (delivery C). */
const valuedOf = (stock: Figures): Dec | null => {
	const quantity = dec(stock?.quantity);
	return quantity === null ? null : sub(quantity, dec(stock?.unvaluedQuantity) ?? ZERO);
};

/** The current average in the warehouse, over its valued units; null without valued stock. */
function averageOf(stock: Figures): Dec | null {
	const valued = valuedOf(stock);
	const value = dec(stock?.value);
	return valued !== null && value !== null && isPositive(valued) ? div(value, valued) : null;
}

const min = (a: Dec, b: Dec): Dec => (a < b ? a : b);

/**
 * What of a consumption has a known cost (model 2.4): the valued units first, then the units of
 * unpriced delivery notes, whose cost comes with the invoice.
 */
function split(quantity: Dec, stock: Figures): { known: Dec; pending: Dec } {
	const valued = valuedOf(stock) ?? ZERO;
	const unvalued = dec(stock?.unvaluedQuantity) ?? ZERO;
	const fromValued = min(quantity, valued > ZERO ? valued : ZERO);
	const pending = min(sub(quantity, fromValued), unvalued);
	return { known: sub(quantity, pending), pending };
}

/** One article taken from the warehouse; the cost shown is an estimate at today's average. */
export default function ConsumptionLineRow({
	index,
	line,
	items,
	errors,
	warehouseId,
	onChange,
	onRemove
}: ConsumptionLineRowProps) {
	const { cellSx, inputSx, textCellSx, errorRing } = useGridCellStyles();
	const { options, unitSymbol } = useItemInputOptions(line.itemId);
	const item = items.find((i) => i.id === line.itemId);
	const quantity = convertPreview(
		line.inputQuantity,
		options.find((o) => o.value === line.inputSource)
	);
	const stock = stockIn(item, warehouseId);
	const average = averageOf(stock);
	const parts = quantity !== null ? split(quantity, stock) : null;
	const estimate = parts !== null && average !== null ? round(mul(parts.known, average), 2) : null;
	const pendingUnits = parts !== null && isPositive(parts.pending) ? parts.pending : null;

	return (
		<TableRow>
			<TableCell sx={{ ...cellSx, px: 1, color: 'text.disabled', fontSize: '0.72rem', width: 40 }}>
				{index + 1}
			</TableCell>
			<ItemPickerCell
				items={items}
				value={line.itemId}
				error={errors.item_id}
				placeholder="Buscar artículo…"
				onChange={(i) => onChange({ itemId: i?.id ?? null, inputSource: i?.unit ? `u:${i.unit.id}` : '' })}
			/>
			<TableCell sx={{ ...cellSx, width: 90, ...(errors.input_quantity ? errorRing : {}) }}>
				<TextField
					fullWidth
					size="small"
					value={line.inputQuantity}
					sx={inputSx}
					inputProps={{ inputMode: 'decimal' }}
					onChange={(e) => onChange({ inputQuantity: e.target.value })}
				/>
			</TableCell>
			<InputUnitSelectCell
				options={options}
				value={line.inputSource}
				onChange={(v) => onChange({ inputSource: v })}
				error={errors.input_unit_id ?? errors.input_presentation_id}
			/>
			<TableCell sx={{ ...textCellSx, width: 110, color: 'text.secondary' }}>
				{quantity === null ? '' : formatQuantity(quantity, unitSymbol)}
			</TableCell>
			<TableCell
				sx={{ ...textCellSx, width: 120, color: 'text.secondary', whiteSpace: 'nowrap' }}
				align="right"
			>
				{estimate === null ? '' : formatMoney(estimate)}
				{pendingUnits !== null && (
					<Typography
						component="div"
						variant="caption"
						sx={{ color: 'warning.dark', fontWeight: 600 }}
					>
						+ {formatQuantity(pendingUnits, unitSymbol)} sin costo
					</Typography>
				)}
			</TableCell>
			<SheetGridStatusCell
				error={Object.values(errors)[0]}
				warning={
					pendingUnits !== null
						? 'Parte sale de un remito sin precio: su costo queda pendiente hasta que llegue la factura.'
						: item && average === null && line.inputQuantity
							? 'Sin saldo: quedará en negativo y se abrirá una novedad.'
							: undefined
				}
			>
				{!isBlankConsumption(line) && (
					<Tooltip title="Quitar renglón">
						<IconButton
							size="small"
							onClick={onRemove}
						>
							<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				)}
			</SheetGridStatusCell>
		</TableRow>
	);
}
