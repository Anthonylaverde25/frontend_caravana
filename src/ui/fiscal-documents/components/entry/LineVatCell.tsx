import { MenuItem, TableCell, TextField } from '@mui/material';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { Tax } from '@/core/fiscal/domain/entities/FiscalCatalog';

interface LineVatCellProps {
	vat: Tax | undefined;
	value: number | null;
	discriminates: boolean;
	disabled: boolean;
	error?: string;
	onChange: (vatRateId: number) => void;
}

/** The VAT rate of a row; "No discrimina" on types other than letter A. */
export default function LineVatCell({ vat, value, discriminates, disabled, error, onChange }: LineVatCellProps) {
	const { cellSx, inputSx, errorRing } = useGridCellStyles();

	return (
		<TableCell sx={{ ...cellSx, width: 110, ...(error ? errorRing : {}) }}>
			<TextField
				select
				fullWidth
				size="small"
				value={discriminates ? (value ?? '') : ''}
				disabled={!discriminates || disabled}
				sx={inputSx}
				onChange={(e) => onChange(Number(e.target.value))}
				SelectProps={{
					displayEmpty: true,
					renderValue: (v) =>
						discriminates ? (vat?.rates.find((r) => r.id === v)?.name ?? '—') : 'No discrimina'
				}}
			>
				{(vat?.rates ?? []).map((r) => (
					<MenuItem
						key={r.id}
						value={r.id}
						sx={{ fontSize: '0.85rem' }}
					>
						{r.name}
					</MenuItem>
				))}
			</TextField>
		</TableCell>
	);
}
