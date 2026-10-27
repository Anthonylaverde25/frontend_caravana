import { useEffect } from 'react';
import { MenuItem, TableCell, TextField } from '@mui/material';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { useSemenLots } from '@/features/semen/hooks/useSemen';
import { straws } from '@/core/semen/domain/rules/semenLabels';

interface SemenLotSelectCellProps {
	/** Null or not semen: the cell stays visible, disabled and grey. */
	itemId: number | null;
	isSemen: boolean;
	warehouseId: number | null;
	value: number | null;
	error?: string;
	onChange: (lotId: number | null) => void;
}

/**
 * The lot of a semen line (SL1): the item's lots with what each holds in the tank; empty ones are
 * disabled (SL4). Preloaded when only one has straws (SL5). Straws without lot are not offered (SU6).
 */
export default function SemenLotSelectCell({ itemId, isSemen, warehouseId, value, error, onChange }: SemenLotSelectCellProps) {
	const { cellSx, inputSx, errorRing } = useGridCellStyles();
	const { data: lots = [] } = useSemenLots(isSemen ? itemId : null, isSemen ? warehouseId : null);
	const withStock = lots.filter((l) => Number(l.quantity) > 0);

	useEffect(() => {
		if (!isSemen) {
			if (value !== null) onChange(null);
			return;
		}
		if (value === null && withStock.length === 1) onChange(withStock[0].id);
	}, [isSemen, value, withStock.length, withStock[0]?.id]);

	if (!isSemen) {
		return <TableCell sx={{ ...cellSx, width: 170, bgcolor: 'action.hover' }} />;
	}

	return (
		<TableCell sx={{ ...cellSx, width: 170, ...(error ? errorRing : {}) }}>
			<TextField select fullWidth size="small" value={value ?? ''} sx={inputSx} SelectProps={{ displayEmpty: true }} onChange={(e) => onChange(Number(e.target.value))}>
				<MenuItem value="" disabled sx={{ color: 'text.disabled' }}>{withStock.length === 0 ? 'Sin partidas en el termo' : 'Elegí la partida…'}</MenuItem>
				{lots.map((l) => (
					<MenuItem key={l.id} value={l.id} disabled={Number(l.quantity) <= 0}>{l.code} · {straws(l.quantity)}</MenuItem>
				))}
			</TextField>
		</TableCell>
	);
}
