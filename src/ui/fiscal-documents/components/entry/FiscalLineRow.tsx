import { useState } from 'react';
import { Button, IconButton, MenuItem, TableCell, TableRow, TextField, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { Item } from '@/core/items/domain/entities/Item';
import { Tax } from '@/core/fiscal/domain/entities/FiscalCatalog';
import { LinePreview } from '@/core/fiscal/domain/rules/fiscalPreview';
import { convertPreview } from '@/core/stock/domain/rules/lineConversion';
import { formatMoney, formatQuantity } from '@/core/stock/domain/rules/quantityFormat';
import ItemPickerCell from '@/ui/stock/components/cells/ItemPickerCell';
import InputUnitSelectCell from '@/ui/stock/components/cells/InputUnitSelectCell';
import BatchPickerCell from '@/ui/stock/components/cells/BatchPickerCell';
import { useItemInputOptions } from '@/ui/stock/components/cells/useItemInputOptions';
import { FiscalLineState, isBlankLine } from './fiscalEntryState';
import LineTaxesDialog from './LineTaxesDialog';

interface FiscalLineRowProps {
	index: number;
	line: FiscalLineState;
	items: Item[];
	batches: Batch[];
	vat: Tax | undefined;
	otherLineTaxes: Tax[];
	discriminates: boolean;
	preview: LinePreview;
	errors: Record<string, string>;
	onChange: (patch: Partial<FiscalLineState>) => void;
	onPickItem: (item: Item | null) => void;
	onRemove: () => void;
}

/** One line of the paper: item, quantity, unit or presentation, price, VAT, other taxes, batch (services). */
export default function FiscalLineRow(props: FiscalLineRowProps) {
	const { index, line, items, batches, vat, otherLineTaxes, discriminates, preview, errors, onChange, onPickItem, onRemove } = props;
	const { cellSx, inputSx, textCellSx, errorRing } = useGridCellStyles();
	const { options, unitSymbol } = useItemInputOptions(line.itemId);
	const [taxesOpen, setTaxesOpen] = useState(false);
	const item = items.find((i) => i.id === line.itemId);
	const chargesBatch = !!item && !item.trackStock;
	const ring = (name: string) => (errors[name] ? errorRing : {});
	const quantity = convertPreview(line.inputQuantity, options.find((o) => o.value === line.inputSource));
	const rowError = Object.values(errors)[0];

	return (
		<TableRow>
			<TableCell sx={{ ...cellSx, px: 1, color: 'text.disabled', fontSize: '0.72rem', width: 40 }}>{index + 1}</TableCell>
			<ItemPickerCell items={items} value={line.itemId} onChange={onPickItem} error={errors.item_id} />
			<TableCell sx={{ ...cellSx, width: 90, ...ring('input_quantity') }}>
				<TextField fullWidth size="small" value={line.inputQuantity} sx={inputSx} inputProps={{ inputMode: 'decimal' }}
					onChange={(e) => onChange({ inputQuantity: e.target.value })} />
			</TableCell>
			<InputUnitSelectCell options={options} value={line.inputSource} onChange={(v) => onChange({ inputSource: v })} error={errors.input_unit_id} />
			<TableCell sx={{ ...cellSx, width: 110, ...ring('unit_price') }}>
				<TextField fullWidth size="small" value={line.unitPrice} sx={inputSx} inputProps={{ inputMode: 'decimal' }}
					onChange={(e) => onChange({ unitPrice: e.target.value })} />
			</TableCell>
			<TableCell sx={{ ...cellSx, width: 110, ...ring('vat') }}>
				<TextField select fullWidth size="small" value={discriminates ? (line.vatRateId ?? '') : ''} disabled={!discriminates || !line.itemId} sx={inputSx}
					onChange={(e) => onChange({ vatRateId: Number(e.target.value) })}
					SelectProps={{ displayEmpty: true, renderValue: (v) => (discriminates ? (vat?.rates.find((r) => r.id === v)?.name ?? '—') : 'No discrimina') }}>
					{(vat?.rates ?? []).map((r) => (
						<MenuItem key={r.id} value={r.id} sx={{ fontSize: '0.85rem' }}>
							{r.name}
						</MenuItem>
					))}
				</TextField>
			</TableCell>
			<TableCell sx={{ ...textCellSx, width: 120, color: 'text.secondary', whiteSpace: 'nowrap' }} align="right">{preview.amount === null ? '' : formatMoney(preview.amount)}</TableCell>
			<TableCell sx={{ ...textCellSx, width: 120, color: 'text.secondary', whiteSpace: 'nowrap' }} align="right">{preview.vat === null ? '' : formatMoney(preview.vat)}</TableCell>
			<TableCell sx={{ ...cellSx, width: 110, bgcolor: discriminates ? undefined : 'action.hover', ...ring('otherTaxes') }}>
				<Button fullWidth disabled={!discriminates || !line.itemId} onClick={() => setTaxesOpen(true)}
					endIcon={discriminates && line.itemId ? <FuseSvgIcon size={14}>heroicons-outline:pencil-square</FuseSvgIcon> : undefined}
					sx={{ height: 40, justifyContent: 'flex-end', textTransform: 'none', fontSize: '0.82rem', color: 'text.secondary' }}>
					{discriminates && line.otherTaxes.length > 0 ? formatMoney(preview.otherTaxes) : ''}
				</Button>
			</TableCell>
			<TableCell sx={{ ...textCellSx, width: 110, color: 'text.secondary' }}>{quantity === null ? '' : formatQuantity(quantity, unitSymbol)}</TableCell>
			<BatchPickerCell batches={batches} value={line.batchId} label={line.batchName} disabled={!chargesBatch} error={errors.batch_id}
				subtitle={item?.name ?? ''} onPick={(b) => onChange({ batchId: b?.id ?? null, batchName: b?.name ?? null, heads: b ? String(b.head_count ?? '') : '' })} />
			<TableCell sx={{ ...cellSx, width: 70, bgcolor: line.batchId ? undefined : 'action.hover' }}>
				<TextField fullWidth size="small" value={line.heads} disabled={!line.batchId} sx={inputSx} inputProps={{ inputMode: 'numeric' }}
					onChange={(e) => onChange({ heads: e.target.value.replace(/\D/g, '') })} />
			</TableCell>
			<SheetGridStatusCell error={rowError}>
				{!isBlankLine(line) && (
					<Tooltip title="Quitar renglón">
						<IconButton size="small" onClick={onRemove}>
							<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				)}
			</SheetGridStatusCell>
			<LineTaxesDialog open={taxesOpen} itemName={item?.name ?? ''} taxes={otherLineTaxes} value={line.otherTaxes}
				onClose={() => setTaxesOpen(false)} onSave={(otherTaxes) => { onChange({ otherTaxes }); setTaxesOpen(false); }} />
		</TableRow>
	);
}
