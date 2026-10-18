import { MenuItem, TableCell, TextField } from '@mui/material';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { InputOption } from '@/core/stock/domain/rules/lineConversion';

interface InputUnitSelectCellProps {
	options: InputOption[];
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	error?: string;
}

/** "Unidad o presentación": what the paper's quantity is written in. */
export default function InputUnitSelectCell({ options, value, onChange, disabled, error }: InputUnitSelectCellProps) {
	const { cellSx, inputSx, errorRing } = useGridCellStyles();
	const known = options.some((o) => o.value === value);

	return (
		<TableCell sx={{ ...cellSx, width: 190, ...(error ? errorRing : {}) }}>
			<TextField
				select
				fullWidth
				size="small"
				value={known ? value : ''}
				disabled={disabled || options.length === 0}
				onChange={(e) => onChange(e.target.value)}
				sx={inputSx}
				SelectProps={{ displayEmpty: true, renderValue: (v) => options.find((o) => o.value === v)?.label ?? '—' }}
			>
				{options.map((o) => (
					<MenuItem key={o.value} value={o.value} sx={{ fontSize: '0.85rem' }}>
						{o.label}
					</MenuItem>
				))}
			</TextField>
		</TableCell>
	);
}
