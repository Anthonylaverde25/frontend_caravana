import { IconButton, MenuItem, TableCell, TableRow, TextField, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { SemenSire, SemenType } from '@/core/semen/domain/entities/Semen';
import { normalizeLotCode, SEMEN_TYPE_LABEL } from '@/core/semen/domain/rules/semenLabels';
import { formatMoney } from '@/core/stock/domain/rules/quantityFormat';
import { isBlankReceipt, lineAmount, SemenReceiptLine } from './receiptState';
import SemenSireSelectCell from './SemenSireSelectCell';

interface SemenReceiptLineRowProps {
	index: number;
	line: SemenReceiptLine;
	sires: SemenSire[];
	/** Lot codes that already exist, by "sireId|type". */
	existingLots: Map<string, Set<string>>;
	errors: Record<string, string>;
	onChange: (patch: Partial<SemenReceiptLine>) => void;
	onRemove: () => void;
	onCreateSire: () => void;
}

/** One sire, type and lot of the entry. An empty lot is a warning, never an error (SL6). */
export default function SemenReceiptLineRow({ index, line, sires, existingLots, errors, onChange, onRemove, onCreateSire }: SemenReceiptLineRowProps) {
	const { cellSx, inputSx, textCellSx, errorRing } = useGridCellStyles();
	const blank = isBlankReceipt(line);
	const known = existingLots.get(`${line.sireId}|${line.semenType}`);
	const existing = !!line.lotCode.trim() && !!known?.has(normalizeLotCode(line.lotCode));
	const warning = !blank && line.sireId && !line.lotCode.trim() ? 'Queda sin identificar: se abre una novedad para cargar la partida después.' : undefined;
	const info = existing ? 'Suma a la partida existente.' : undefined;
	const cell = (field: string, width?: number) => ({ ...cellSx, ...(width ? { width } : {}), ...(errors[field] ? errorRing : {}) });

	return (
		<TableRow>
			<TableCell sx={{ ...cellSx, px: 1, color: 'text.disabled', fontSize: '0.72rem', width: 40 }}>{index + 1}</TableCell>
			<SemenSireSelectCell sires={sires} value={line.sireId} error={errors.semen_sire_id} onChange={(sireId) => onChange({ sireId })} onCreate={onCreateSire} />
			<TableCell sx={cell('semen_type', 150)}>
				<TextField select fullWidth size="small" value={line.semenType} sx={inputSx} onChange={(e) => onChange({ semenType: e.target.value as SemenType })}>
					{(Object.keys(SEMEN_TYPE_LABEL) as SemenType[]).map((t) => (
						<MenuItem key={t} value={t}>{SEMEN_TYPE_LABEL[t]}</MenuItem>
					))}
				</TextField>
			</TableCell>
			<TableCell sx={cell('lot_code', 140)}>
				<TextField fullWidth size="small" value={line.lotCode} placeholder="Sin partida" sx={inputSx} onChange={(e) => onChange({ lotCode: e.target.value })} />
			</TableCell>
			<TableCell sx={cell('collection_date', 150)}>
				<TextField fullWidth size="small" type="date" value={line.collectionDate} sx={inputSx} disabled={existing} onChange={(e) => onChange({ collectionDate: e.target.value })} />
			</TableCell>
			<TableCell sx={cell('quantity', 100)}>
				<TextField fullWidth size="small" value={line.quantity} sx={inputSx} inputProps={{ inputMode: 'numeric' }} onChange={(e) => onChange({ quantity: e.target.value.replace(/\D/g, '') })} />
			</TableCell>
			<TableCell sx={cell('unit_cost', 120)}>
				<TextField fullWidth size="small" value={line.unitCost} placeholder="0" sx={inputSx} inputProps={{ inputMode: 'decimal' }} onChange={(e) => onChange({ unitCost: e.target.value })} />
			</TableCell>
			<TableCell sx={{ ...textCellSx, width: 130 }} align="right">{blank ? '' : formatMoney(String(lineAmount(line)))}</TableCell>
			<SheetGridStatusCell error={Object.values(errors)[0]} warning={warning} info={info}>
				{!blank && (
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
