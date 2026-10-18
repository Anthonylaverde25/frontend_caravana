import { IconButton, TableCell, TableRow, TextField, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { Item } from '@/core/items/domain/entities/Item';
import { dec, mul, round } from '@/core/stock/domain/rules/decimal';
import { convertPreview } from '@/core/stock/domain/rules/lineConversion';
import { formatMoney, formatQuantity } from '@/core/stock/domain/rules/quantityFormat';
import ItemPickerCell from '@/ui/stock/components/cells/ItemPickerCell';
import InputUnitSelectCell from '@/ui/stock/components/cells/InputUnitSelectCell';
import { useItemInputOptions } from '@/ui/stock/components/cells/useItemInputOptions';
import { InitialStockLine, isBlankInitial } from './initialStockState';

interface InitialStockLineRowProps {
	index: number;
	line: InitialStockLine;
	items: Item[];
	errors: Record<string, string>;
	onChange: (patch: Partial<InitialStockLine>) => void;
	onRemove: () => void;
}

export default function InitialStockLineRow({ index, line, items, errors, onChange, onRemove }: InitialStockLineRowProps) {
	const { cellSx, inputSx, textCellSx, errorRing } = useGridCellStyles();
	const { options, unitSymbol } = useItemInputOptions(line.itemId);
	const quantity = convertPreview(line.inputQuantity, options.find((o) => o.value === line.inputSource));
	const qty = dec(line.inputQuantity);
	const price = dec(line.unitPrice);
	const amount = qty !== null && price !== null ? round(mul(qty, price), 4) : null;

	return (
		<TableRow>
			<TableCell sx={{ ...cellSx, px: 1, color: 'text.disabled', fontSize: '0.72rem', width: 40 }}>{index + 1}</TableCell>
			<ItemPickerCell items={items} value={line.itemId} error={errors.item_id}
				onChange={(item) => onChange({ itemId: item?.id ?? null, inputSource: item?.unit ? `u:${item.unit.id}` : '' })} />
			<TableCell sx={{ ...cellSx, width: 100, ...(errors.input_quantity ? errorRing : {}) }}>
				<TextField fullWidth size="small" value={line.inputQuantity} sx={inputSx} inputProps={{ inputMode: 'decimal' }} onChange={(e) => onChange({ inputQuantity: e.target.value })} />
			</TableCell>
			<InputUnitSelectCell options={options} value={line.inputSource} onChange={(v) => onChange({ inputSource: v })} error={errors.input_unit_id ?? errors.input_presentation_id} />
			<TableCell sx={{ ...cellSx, width: 120, ...(errors.input_unit_price ? errorRing : {}) }}>
				<TextField fullWidth size="small" value={line.unitPrice} sx={inputSx} placeholder="0" inputProps={{ inputMode: 'decimal' }} onChange={(e) => onChange({ unitPrice: e.target.value })} />
			</TableCell>
			<TableCell sx={{ ...textCellSx, width: 130, color: 'text.secondary' }} align="right">{amount === null ? '' : formatMoney(amount)}</TableCell>
			<TableCell sx={{ ...textCellSx, width: 130, color: 'text.secondary' }}>{quantity === null ? '' : formatQuantity(quantity, unitSymbol)}</TableCell>
			<SheetGridStatusCell error={Object.values(errors)[0]}>
				{!isBlankInitial(line) && (
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
