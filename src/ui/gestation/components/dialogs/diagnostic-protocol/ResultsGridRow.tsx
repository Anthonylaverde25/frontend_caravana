import React from 'react';
import { Checkbox, Chip, MenuItem, TableCell, TableRow, TextField, Typography } from '@mui/material';
import { LabSampleStatus } from '@/core/veterinary/domain/VeterinaryTypes';

export interface GridPathogen {
  id: number;
  code: string;
  name: string;
  is_disqualifying: boolean;
}

export interface GridBull {
  id: number;
  identification: string;
  status?: string;
}

interface ResultsGridRowProps {
  bull: GridBull;
  pathogens: GridPathogen[];
  selected: boolean;
  onToggleSelected: (caravanId: number) => void;
  /** Map keyed by `${caravanId}:${pathogenId}`. */
  results: Record<string, LabSampleStatus>;
  onResultChange: (caravanId: number, pathogenId: number, status: LabSampleStatus) => void;
  tubeNumber: string;
  onTubeNumberChange: (caravanId: number, value: string) => void;
}

const STATUS_OPTIONS: { value: LabSampleStatus; label: string }[] = [
  { value: 'NEGATIVE_CLEARED', label: 'Negativo' },
  { value: 'POSITIVE_DETECTED', label: 'Positivo' },
  { value: 'PENDING_RESULTS', label: 'Pendiente' },
];

const statusColor = (status: LabSampleStatus): 'success' | 'error' | 'warning' => {
  if (status === 'POSITIVE_DETECTED') return 'error';
  if (status === 'PENDING_RESULTS') return 'warning';
  return 'success';
};

export const ResultsGridRow: React.FC<ResultsGridRowProps> = ({
  bull,
  pathogens,
  selected,
  onToggleSelected,
  results,
  onResultChange,
  tubeNumber,
  onTubeNumberChange,
}) => (
  <TableRow hover selected={selected}>
    <TableCell padding="checkbox">
      <Checkbox size="small" checked={selected} onChange={() => onToggleSelected(bull.id)} />
    </TableCell>

    <TableCell>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {bull.identification}
      </Typography>
      {bull.status && (
        <Chip
          label={bull.status}
          size="small"
          variant="outlined"
          sx={{ height: 18, fontSize: '0.65rem', mt: 0.25 }}
        />
      )}
    </TableCell>

    {pathogens.map((pathogen) => {
      const key = `${bull.id}:${pathogen.id}`;
      const value = results[key] ?? 'NEGATIVE_CLEARED';

      return (
        <TableCell key={pathogen.id} align="center">
          <TextField
            select
            size="small"
            variant="filled"
            fullWidth
            disabled={!selected}
            value={value}
            onChange={(event) =>
              onResultChange(bull.id, pathogen.id, event.target.value as LabSampleStatus)
            }
            sx={{
              bgcolor: 'action.hover',
              '& .MuiFilledInput-input': { py: 0.75, fontSize: '0.8rem' },
            }}
            slotProps={{ select: { renderValue: (raw: unknown) => {
              const status = raw as LabSampleStatus;
              const option = STATUS_OPTIONS.find((item) => item.value === status);
              return (
                <Chip
                  label={option?.label ?? status}
                  size="small"
                  color={statusColor(status)}
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                />
              );
            } } }}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </TableCell>
      );
    })}

    <TableCell align="center" sx={{ minWidth: 120 }}>
      <TextField
        size="small"
        variant="filled"
        fullWidth
        disabled={!selected}
        placeholder="N° tubo"
        value={tubeNumber}
        onChange={(event) => onTubeNumberChange(bull.id, event.target.value)}
        sx={{ bgcolor: 'action.hover', '& .MuiFilledInput-input': { py: 0.75, fontSize: '0.8rem' } }}
      />
    </TableCell>
  </TableRow>
);

export default ResultsGridRow;
