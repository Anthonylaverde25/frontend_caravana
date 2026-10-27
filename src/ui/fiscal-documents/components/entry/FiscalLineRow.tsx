import { IconButton, TableCell, TableRow, TextField, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { Item } from '@/core/items/domain/entities/Item';
import { Tax } from '@/core/fiscal/domain/entities/FiscalCatalog';
import { LinePreview } from '@/core/fiscal/domain/rules/fiscalPreview';
import { convertPreview } from '@/core/stock/domain/rules/lineConversion';
import { formatMoney, formatQuantity } from '@/core/stock/domain/rules/quantityFormat';
import InputUnitSelectCell from '@/ui/stock/components/cells/InputUnitSelectCell';
import BatchPickerCell from '@/ui/stock/components/cells/BatchPickerCell';
import { useItemInputOptions } from '@/ui/stock/components/cells/useItemInputOptions';
import { EntryMode, FiscalLineState, isBlankLine } from './fiscalEntryState';
import LineOtherTaxesCell from './LineOtherTaxesCell';
import FiscalLineItemCell from './FiscalLineItemCell';
import LineVatCell from './LineVatCell';

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
	onPickItem: (item: Item | null, origin?: 'MANUAL' | 'LINKED') => void;
	/** The item is not in the catalogue: create it with the typed name and bring it back here. */
	onCreateItem: (name: string) => void;
	onRemove: () => void;
	mode: EntryMode;
	/** A delivery note without prices: the price column stays grey (DC14). */
	unpriced: boolean;
	showOtherTaxes?: boolean;
}

/**
 * One line of the paper: item, quantity, unit or presentation, price, VAT, other taxes, batch (services).
 * Converted from a delivery note, its item is inherited and its removal keeps it struck through (Q4).
 */
export default function FiscalLineRow(props: FiscalLineRowProps) {
	const {
		index,
		line,
		items,
		batches,
		vat,
		otherLineTaxes,
		discriminates,
		preview,
		errors,
		onChange,
		onPickItem,
		onCreateItem,
		onRemove,
		mode,
		unpriced,
		showOtherTaxes = false
	} = props;
	const { cellSx, indexSx, inputSx, textCellSx, errorRing } = useGridCellStyles();
	const { options, unitSymbol } = useItemInputOptions(line.itemId);
	const item = items.find((i) => i.id === line.itemId);
	const chargesBatch = !!item && !item.trackStock;
	const ring = (name: string) => (errors[name] ? errorRing : {});
	const quantity = convertPreview(
		line.inputQuantity,
		options.find((o) => o.value === line.inputSource)
	);
	const rowError = Object.values(errors)[0];
	const inherited = line.deliveryNoteLineId !== null;
	const outsideNotes = mode === 'conversion' && !inherited && !!item?.trackStock;

	return (
		<TableRow sx={line.removed ? { opacity: 0.45, '& td': { textDecoration: 'line-through' } } : undefined}>
			<TableCell
				align="center"
				sx={{
					...indexSx,
					color: 'text.secondary',
					fontWeight: 600,
					fontSize: '0.74rem'
				}}
			>
				{index + 1}
			</TableCell>
			{inherited ? (
				<TableCell sx={{ ...textCellSx, fontWeight: 600, bgcolor: 'action.hover' }}>
					{item?.name ?? '—'}
				</TableCell>
			) : (
				<FiscalLineItemCell
					line={line}
					items={items}
					error={errors.item_id}
					onPickItem={onPickItem}
					onCreateItem={onCreateItem}
				/>
			)}
			<TableCell sx={{ ...cellSx, width: 90, ...ring('input_quantity') }}>
				<Tooltip
					title={line.read?.quantity ? `El papel dice: ${line.read.quantity} · ${line.read.description}` : ''}
				>
					<TextField
						fullWidth
						size="small"
						value={line.inputQuantity}
						sx={inputSx}
						inputProps={{ inputMode: 'decimal' }}
						onChange={(e) => onChange({ inputQuantity: e.target.value })}
					/>
				</Tooltip>
			</TableCell>
			<InputUnitSelectCell
				options={options}
				value={line.inputSource}
				onChange={(v) => onChange({ inputSource: v })}
				error={errors.input_unit_id}
			/>
			<TableCell
				sx={{
					...cellSx,
					width: 110,
					bgcolor: unpriced ? 'action.hover' : undefined,
					...ring('unit_price')
				}}
			>
				<TextField
					fullWidth
					size="small"
					value={unpriced ? '' : line.unitPrice}
					disabled={unpriced}
					sx={inputSx}
					inputProps={{ inputMode: 'decimal' }}
					onChange={(e) => onChange({ unitPrice: e.target.value })}
				/>
			</TableCell>
			{mode === 'conversion' && (
				<TableCell
					sx={{
						...textCellSx,
						width: 110,
						color: 'text.secondary',
						bgcolor: 'action.hover',
						whiteSpace: 'nowrap'
					}}
					align="right"
				>
					{line.notePrice === null ? '—' : formatMoney(line.notePrice)}
				</TableCell>
			)}
			<LineVatCell
				vat={vat}
				value={line.vatRateId}
				discriminates={discriminates}
				disabled={!line.itemId}
				error={errors.vat}
				onChange={(vatRateId) => onChange({ vatRateId })}
			/>
			<TableCell
				sx={{
					...textCellSx,
					width: 120,
					color: 'text.secondary',
					whiteSpace: 'nowrap'
				}}
				align="right"
			>
				{preview.amount === null ? '' : formatMoney(preview.amount)}
			</TableCell>
			{showOtherTaxes && (
				<LineOtherTaxesCell
					line={line}
					itemName={item?.name ?? ''}
					taxes={otherLineTaxes}
					discriminates={discriminates}
					amount={preview.otherTaxes}
					error={errors.otherTaxes}
					onChange={(otherTaxes) => onChange({ otherTaxes })}
				/>
			)}
			<TableCell sx={{ ...textCellSx, width: 110, color: 'text.secondary' }}>
				{quantity === null ? '' : formatQuantity(quantity, unitSymbol)}
			</TableCell>
			<BatchPickerCell
				batches={batches}
				value={line.batchId}
				label={line.batchName}
				disabled={!chargesBatch}
				error={errors.batch_id}
				subtitle={item?.name ?? ''}
				onPick={(b) =>
					onChange({
						batchId: b?.id ?? null,
						batchName: b?.name ?? null,
						heads: b ? String(b.head_count ?? '') : ''
					})
				}
			/>
			<TableCell
				sx={{
					...cellSx,
					width: 70,
					bgcolor: line.batchId ? undefined : 'action.hover'
				}}
			>
				<TextField
					fullWidth
					size="small"
					value={line.heads}
					disabled={!line.batchId}
					sx={inputSx}
					inputProps={{ inputMode: 'numeric' }}
					onChange={(e) => onChange({ heads: e.target.value.replace(/\D/g, '') })}
				/>
			</TableCell>
			<SheetGridStatusCell
				error={rowError}
				info={outsideNotes ? 'No está en ningún remito: no entra al stock.' : undefined}
			>
				{!isBlankLine(line) && (
					<Tooltip
						title={line.removed ? 'Quedará como renglón sin facturar. Volver a incluir' : 'Quitar renglón'}
					>
						<IconButton
							size="small"
							onClick={onRemove}
						>
							<FuseSvgIcon size={16}>
								{line.removed ? 'heroicons-outline:arrow-uturn-left' : 'heroicons-outline:x-mark'}
							</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				)}
			</SheetGridStatusCell>
		</TableRow>
	);
}
