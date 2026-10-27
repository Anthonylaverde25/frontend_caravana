import { Divider, MenuItem, TableCell, TextField } from '@mui/material';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { SemenSire } from '@/core/semen/domain/entities/Semen';

interface SemenSireSelectCellProps {
	sires: SemenSire[];
	value: number | null;
	error?: string;
	onChange: (sireId: number) => void;
	onCreate: () => void;
}

const NEW = '__new';

/** The sire of a semen entry line; one missing is created right here ("+ Nuevo padre…"). */
export default function SemenSireSelectCell({ sires, value, error, onChange, onCreate }: SemenSireSelectCellProps) {
	const { cellSx, inputSx, errorRing } = useGridCellStyles();

	return (
		<TableCell sx={{ ...cellSx, ...(error ? errorRing : {}) }}>
			<TextField select fullWidth size="small" value={value ?? ''} sx={inputSx} SelectProps={{ displayEmpty: true }}
				onChange={(e) => (e.target.value === NEW ? onCreate() : onChange(Number(e.target.value)))}>
				<MenuItem value="" disabled sx={{ color: 'text.disabled' }}>Elegí el padre…</MenuItem>
				{sires.map((s) => (
					<MenuItem key={s.id} value={s.id}>{s.label}{s.isOwnBull ? ' · propio' : ''}</MenuItem>
				))}
				<Divider />
				<MenuItem value={NEW} sx={{ fontWeight: 700, color: 'primary.main' }}>+ Nuevo padre…</MenuItem>
			</TextField>
		</TableCell>
	);
}
