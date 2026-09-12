import React from 'react';
import { Box, Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { LabSampleStatus, SampleType } from '@/core/veterinary/domain/VeterinaryTypes';

interface ResultsGridBulkToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sampleType: SampleType;
  onSampleTypeChange: (value: SampleType) => void;
  sampleRound: number;
  onSampleRoundChange: (value: number) => void;
  selectedCount: number;
  totalCount: number;
  positiveCount: number;
  onSelectAll: () => void;
  onApplyPreset: (status: LabSampleStatus) => void;
}

const SAMPLE_TYPES: { value: SampleType; label: string }[] = [
  { value: 'PREPUCE_SCRAPE', label: 'Raspaje prepucial' },
  { value: 'BLOOD_SEROLOGY', label: 'Serología sanguínea' },
  { value: 'SEMEN_CULTURE', label: 'Cultivo de semen' },
  { value: 'TUBERCULIN_TEST', label: 'Prueba de tuberculina' },
];

/**
 * The realistic shape of the task: a whole troop comes back negative and two or three animals
 * are the exception. The preset marks everything, and the operator flips only the exceptions.
 */
export const ResultsGridBulkToolbar: React.FC<ResultsGridBulkToolbarProps> = ({
  search,
  onSearchChange,
  sampleType,
  onSampleTypeChange,
  sampleRound,
  onSampleRoundChange,
  selectedCount,
  totalCount,
  positiveCount,
  onSelectAll,
  onApplyPreset,
}) => (
  <Box sx={{ mb: 2 }}>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 1.5 }}>
      <TextField
        size="small"
        variant="filled"
        fullWidth
        placeholder="Buscar caravana…"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        sx={{ bgcolor: 'action.hover' }}
      />

      <TextField
        select
        size="small"
        variant="filled"
        label="Tipo de ensayo"
        value={sampleType}
        onChange={(event) => onSampleTypeChange(event.target.value as SampleType)}
        sx={{ bgcolor: 'action.hover', minWidth: 210 }}
      >
        {SAMPLE_TYPES.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        variant="filled"
        label="Ronda"
        value={sampleRound}
        onChange={(event) => onSampleRoundChange(Number(event.target.value))}
        sx={{ bgcolor: 'action.hover', minWidth: 140 }}
      >
        {[1, 2, 3, 4].map((round) => (
          <MenuItem key={round} value={round}>
            {round}º muestreo
          </MenuItem>
        ))}
      </TextField>
    </Stack>

    <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
      <Button
        size="small"
        variant="text"
        onClick={onSelectAll}
        sx={{ fontWeight: 600, textTransform: 'none', color: 'primary.main' }}
        startIcon={<FuseSvgIcon size={16}>heroicons-outline:check-circle</FuseSvgIcon>}
      >
        {selectedCount === totalCount && totalCount > 0 ? 'Quitar selección' : 'Seleccionar todos'}
      </Button>

      <Button
        size="small"
        variant="text"
        disabled={selectedCount === 0}
        onClick={() => onApplyPreset('NEGATIVE_CLEARED')}
        sx={{ fontWeight: 600, textTransform: 'none', color: 'success.main' }}
      >
        Marcar seleccionados como negativos
      </Button>

      <Button
        size="small"
        variant="text"
        disabled={selectedCount === 0}
        onClick={() => onApplyPreset('PENDING_RESULTS')}
        sx={{ fontWeight: 600, textTransform: 'none', color: 'warning.main' }}
      >
        Marcar como pendientes
      </Button>

      <Box sx={{ flexGrow: 1 }} />

      <Chip
        size="small"
        label={`${selectedCount} de ${totalCount} seleccionados`}
        variant="outlined"
      />
      {positiveCount > 0 && (
        <Chip size="small" color="error" label={`${positiveCount} positivo(s)`} />
      )}
    </Stack>

    {positiveCount > 0 && (
      <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1 }}>
        Cada positivo genera un diagnóstico clínico confirmado y bloquea al reproductor para el entore.
      </Typography>
    )}
  </Box>
);

export default ResultsGridBulkToolbar;
