import { MenuItem, TableCell, TextField } from '@mui/material';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { lotsInTank, type SemenOption } from '@/features/semen/hooks/useSemenOptions';
import type { LotChoice } from './inseminationEntryModel';

interface InseminationLotCellProps {
  value: LotChoice;
  option: SemenOption | undefined;
  warehouseId: number | null;
  disabled: boolean;
  error?: string;
  onChange: (lot: LotChoice) => void;
}

/** The lot of the straws, with what each lot holds in the row's tank, or "Sin identificar" (IA8). */
export default function InseminationLotCell({ value, option, warehouseId, disabled, error, onChange }: InseminationLotCellProps) {
  const { cellSx, inputSx, errorRing } = useGridCellStyles();
  const lots = lotsInTank(option, warehouseId);
  // A lot already chosen keeps showing even if the tank ran out of it.
  const chosenMissing = typeof value === 'number' && !lots.some((l) => l.id === value);

  return (
    <TableCell sx={{ ...cellSx, minWidth: 170, ...(error ? errorRing : {}) }}>
      <TextField
        select
        fullWidth
        size="small"
        value={value ?? ''}
        disabled={disabled || !option}
        error={Boolean(error)}
        onChange={(e) => onChange(e.target.value === 'NONE' ? 'NONE' : e.target.value === '' ? null : Number(e.target.value))}
        SelectProps={{ displayEmpty: true }}
        sx={inputSx}
      >
        <MenuItem value="" disabled sx={{ fontSize: '0.8rem' }}>
          Elegí la partida
        </MenuItem>
        {lots.map((lot) => (
          <MenuItem key={lot.id} value={lot.id} sx={{ fontSize: '0.8rem' }}>
            {lot.code} · {lot.quantity} pajuelas
          </MenuItem>
        ))}
        {chosenMissing && (
          <MenuItem value={value as number} sx={{ fontSize: '0.8rem' }}>
            {option?.row.lots.find((l) => l.id === value)?.code ?? `Partida ${value}`} · sin saldo en este termo
          </MenuItem>
        )}
        <MenuItem value="NONE" sx={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
          Sin identificar
        </MenuItem>
      </TextField>
    </TableCell>
  );
}
