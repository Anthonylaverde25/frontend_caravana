import React, { useState } from 'react';
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { DteDraft, DteTroopContext } from './useDteDraft';
import DteCaravansGrid from './DteCaravansGrid';

interface DteEntryFormProps {
  draft: DteDraft;
  troop: DteTroopContext;
}

const filledSx = { bgcolor: 'action.hover' } as const;

/**
 * The DTE being loaded: its number and dates, the caravans it lists and the counters against what
 * the order still expects. Shared by "Cargar DTE" and by the confirmation of "Registrar ingreso".
 */
export const DteEntryForm: React.FC<DteEntryFormProps> = ({ draft, troop }) => {
  const [pasted, setPasted] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const headerError = (field: string) => draft.headerErrors.find((e) => e.field === field)?.message;
  const blankSex = draft.rows.filter((row) => row.sex === '').length;
  const blankBreed = draft.rows.filter((row) => row.breed_position === '').length;
  const over = draft.counts.total > troop.pending;
  const maleLeft = (troop.maleCount ?? 0) - troop.enteredMale;
  const femaleLeft = (troop.femaleCount ?? 0) - troop.enteredFemale;

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="N° de DTE"
          required
          variant="filled"
          value={draft.dteNumber}
          onChange={(e) => draft.setDteNumber(e.target.value.toUpperCase())}
          error={!!headerError('dte_number')}
          helperText={headerError('dte_number')}
          sx={{ ...filledSx, flex: 1 }}
          inputProps={{ style: { fontFamily: 'monospace', fontWeight: 700 } }}
        />
        <TextField
          label="Fecha del DTE"
          type="date"
          required
          variant="filled"
          value={draft.dteDate}
          onChange={(e) => draft.setDteDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: today }}
          error={!!headerError('dte_date')}
          helperText={headerError('dte_date')}
          sx={{ ...filledSx, flex: 1 }}
        />
        <TextField
          label="Fecha de ingreso"
          type="date"
          required
          variant="filled"
          value={draft.enteredAt}
          onChange={(e) => draft.setEnteredAt(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: today }}
          error={!!headerError('entered_at')}
          helperText={headerError('entered_at') ?? 'Día en que la hacienda llegó al campo.'}
          sx={{ ...filledSx, flex: 1 }}
        />
      </Stack>

      <Box>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'flex-start' }}>
          <TextField
            multiline
            minRows={2}
            maxRows={6}
            fullWidth
            variant="filled"
            size="small"
            label="Pegar caravanas del DTE"
            placeholder="Una por línea, o separadas por coma o espacio"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            sx={filledSx}
          />
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button
              variant="outlined"
              disabled={pasted.trim() === ''}
              onClick={() => {
                draft.paste(pasted);
                setPasted('');
              }}
              startIcon={<FuseSvgIcon size={16}>heroicons-outline:clipboard-document-list</FuseSvgIcon>}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', whiteSpace: 'nowrap' }}
            >
              Agregar
            </Button>
            <Button onClick={draft.addRow} sx={{ textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
              + Fila
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        <Chip
          color={over ? 'error' : draft.counts.total === troop.pending ? 'success' : 'default'}
          label={`${draft.counts.total} de ${troop.pending} cabezas pendientes`}
          sx={{ fontWeight: 700 }}
        />
        {troop.isMixed && (
          <>
            <Chip variant="outlined" label={`Machos ${draft.counts.male}/${maleLeft}`} color={draft.counts.male > maleLeft ? 'error' : 'default'} />
            <Chip variant="outlined" label={`Hembras ${draft.counts.female}/${femaleLeft}`} color={draft.counts.female > femaleLeft ? 'error' : 'default'} />
            {blankSex > 0 && (
              <>
                <Button size="small" onClick={() => draft.assignBlank('sex', 'M')} sx={{ textTransform: 'none' }}>
                  Sin sexo → Macho
                </Button>
                <Button size="small" onClick={() => draft.assignBlank('sex', 'H')} sx={{ textTransform: 'none' }}>
                  Sin sexo → Hembra
                </Button>
              </>
            )}
          </>
        )}
        {troop.breeds.length > 1 &&
          blankBreed > 0 &&
          troop.breeds.map((breed) => (
            <Button key={breed.position} size="small" onClick={() => draft.assignBlank('breed_position', breed.position)} sx={{ textTransform: 'none' }}>
              Sin raza → {breed.letter} · {breed.label}
            </Button>
          ))}
      </Stack>

      {draft.headerErrors
        .filter((e) => !['dte_number', 'dte_date', 'entered_at'].includes(e.field))
        .map((e) => (
          <Alert key={e.code} severity="error" sx={{ borderRadius: '6px' }}>
            {e.message}
          </Alert>
        ))}

      {draft.rows.length === 0 ? (
        <Box sx={{ py: 5, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '6px' }}>
          <Typography variant="body2" color="text.secondary">
            Pegá la lista de caravanas del DTE o agregá filas una por una.
          </Typography>
        </Box>
      ) : (
        <DteCaravansGrid draft={draft} troop={troop} />
      )}

      <TextField
        label="Observaciones del DTE"
        variant="filled"
        multiline
        rows={2}
        value={draft.observations}
        onChange={(e) => draft.setObservations(e.target.value)}
        sx={filledSx}
      />
    </Stack>
  );
};

export default DteEntryForm;
