import { IconButton, MenuItem, TableCell, TableRow, TextField } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { SemenLotOption } from '@/core/semen/domain/entities/Semen';
import { straws } from '@/core/semen/domain/rules/semenLabels';
import { rowKey } from '@/ui/fiscal-documents/components/entry/fiscalEntryState';

/** One lot of an identification: an existing lot of the semen, or a new code. */
export interface IdentifyShare {
	key: string;
	lotId: number | null;
	newCode: string;
	collectionDate: string;
	quantity: string;
}

export const emptyShare = (): IdentifyShare => ({ key: rowKey(), lotId: null, newCode: '', collectionDate: '', quantity: '' });

interface IdentifyShareRowProps {
	index: number;
	share: IdentifyShare;
	lots: SemenLotOption[];
	errors: Record<string, string>;
	onChange: (patch: Partial<IdentifyShare>) => void;
	onRemove?: () => void;
}

const NEW = 'new';

export default function IdentifyShareRow({ index, share, lots, errors, onChange, onRemove }: IdentifyShareRowProps) {
	const { cellSx, inputSx, errorRing } = useGridCellStyles();
	const error = errors[`lots.${index}.semen_lot_id`] ?? errors[`lots.${index}.lot_code`] ?? errors[`lots.${index}.quantity`];

	return (
		<TableRow>
			<TableCell sx={{ ...cellSx, px: 1, color: 'text.disabled', fontSize: '0.72rem', width: 40 }}>{index + 1}</TableCell>
			<TableCell sx={{ ...cellSx, ...(errors[`lots.${index}.semen_lot_id`] || errors[`lots.${index}.lot_code`] ? errorRing : {}) }}>
				{share.lotId === null && share.newCode !== '' ? (
					<TextField fullWidth size="small" autoFocus value={share.newCode} placeholder="Código de la partida nueva" sx={inputSx}
						onChange={(e) => onChange({ newCode: e.target.value })} />
				) : (
					<TextField select fullWidth size="small" value={share.lotId ?? (share.newCode !== '' ? NEW : '')} sx={inputSx} SelectProps={{ displayEmpty: true }}
						onChange={(e) => (e.target.value === NEW ? onChange({ lotId: null, newCode: ' ' }) : onChange({ lotId: Number(e.target.value), newCode: '' }))}>
						<MenuItem value="" disabled sx={{ color: 'text.disabled' }}>Elegí la partida…</MenuItem>
						{lots.map((l) => (
							<MenuItem key={l.id} value={l.id}>{l.code} · {straws(l.quantity)} en el termo</MenuItem>
						))}
						<MenuItem value={NEW} sx={{ fontWeight: 700, color: 'primary.main' }}>+ Partida nueva…</MenuItem>
					</TextField>
				)}
			</TableCell>
			<TableCell sx={{ ...cellSx, width: 150 }}>
				<TextField fullWidth size="small" type="date" value={share.collectionDate} disabled={share.lotId !== null} sx={inputSx}
					onChange={(e) => onChange({ collectionDate: e.target.value })} />
			</TableCell>
			<TableCell sx={{ ...cellSx, width: 110, ...(errors[`lots.${index}.quantity`] ? errorRing : {}) }}>
				<TextField fullWidth size="small" value={share.quantity} sx={inputSx} inputProps={{ inputMode: 'numeric' }}
					onChange={(e) => onChange({ quantity: e.target.value.replace(/\D/g, '') })} />
			</TableCell>
			<SheetGridStatusCell error={error}>
				{onRemove && (
					<IconButton size="small" onClick={onRemove}>
						<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
					</IconButton>
				)}
			</SheetGridStatusCell>
		</TableRow>
	);
}
