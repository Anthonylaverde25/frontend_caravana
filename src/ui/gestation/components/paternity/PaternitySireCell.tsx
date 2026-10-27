import { Box, Divider, ListSubheader, MenuItem, TableCell, TextField } from '@mui/material';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { PaternityCandidate } from '@/features/paternity/hooks/usePendingPaternities';

export interface MaleOption {
  id: number;
  identification: string;
}

interface PaternitySireCellProps {
  candidates: PaternityCandidate[];
  males: MaleOption[];
  value: number | null;
  error: boolean;
  onChange: (fatherId: number | null) => void;
}

const DATE_HINT: Record<'true' | 'false' | 'null', { label: string; color: string }> = {
  true: { label: 'compatible por fecha', color: 'success.main' },
  false: { label: 'fuera de fecha', color: 'warning.main' },
  null: { label: 'sin fecha de estadía', color: 'text.secondary' },
};

/**
 * The sire of a calf: empty until the user picks one. The bulls that were with the mother come
 * first, each with whether his stay crossed the estimated conception; any other male can be chosen.
 */
export default function PaternitySireCell({ candidates, males, value, error, onChange }: PaternitySireCellProps) {
  const { cellSx, inputSx } = useGridCellStyles();
  const others = males.filter((male) => !candidates.some((candidate) => candidate.id === male.id));
  const label = (id: number) =>
    candidates.find((c) => c.id === id)?.identification ?? others.find((m) => m.id === id)?.identification ?? `#${id}`;

  return (
    <TableCell sx={cellSx}>
      <TextField
        select
        fullWidth
        error={error}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        SelectProps={{ displayEmpty: true, renderValue: (v) => (v === '' ? <em>Sin confirmar</em> : label(Number(v))) }}
        sx={inputSx}
      >
        <MenuItem value="">
          <em>Sin confirmar</em>
        </MenuItem>
        {candidates.length > 0 && <ListSubheader>Toros del servicio</ListSubheader>}
        {candidates.map((candidate) => {
          const hint = DATE_HINT[String(candidate.compatible_by_date) as 'true' | 'false' | 'null'];
          return (
            <MenuItem key={candidate.id} value={candidate.id}>
              {candidate.identification}
              <Box component="span" sx={{ ml: 1, fontSize: '0.72rem', fontWeight: 600, color: hint.color }}>
                · {hint.label}
              </Box>
            </MenuItem>
          );
        })}
        {candidates.length > 0 && others.length > 0 && <Divider />}
        {others.length > 0 && <ListSubheader>Otros machos</ListSubheader>}
        {others.map((male) => (
          <MenuItem key={male.id} value={male.id}>
            {male.identification}
          </MenuItem>
        ))}
      </TextField>
    </TableCell>
  );
}
