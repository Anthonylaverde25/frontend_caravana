import React, { useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { DteDraft, DteTroopContext } from './useDteDraft';
import DteCaravansGrid from './DteCaravansGrid';

interface DteEntryFormProps {
  draft: DteDraft;
  troop: DteTroopContext;
}

const filledSx = { '& .MuiFilledInput-root': { bgcolor: 'action.hover', borderRadius: '6px' } } as const;
const linkSx = { textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', minWidth: 0, px: 1, py: 0.25 } as const;

/**
 * The DTE being loaded: its number and date, the caravans it lists and the count against what the
 * order still expects. Shared by "Cargar DTE" and by the confirmation of "Registrar ingreso"; only
 * the latter asks the entry day and weights, because there the animals arrive with the DTE. More
 * head (or more of a sex) than expected is not an error: it is warned before confirming and
 * recorded as an incident to settle with the provider.
 */
export const DteEntryForm: React.FC<DteEntryFormProps> = ({ draft, troop }) => {
  const [showObservations, setShowObservations] = useState(draft.observations !== '');
  const today = new Date().toISOString().slice(0, 10);
  const headerError = (field: string) => draft.headerErrors.find((e) => e.field === field)?.message;
  const over = draft.counts.total - troop.pending;
  const maleLeft = Math.max(0, (troop.maleCount ?? 0) - troop.withDteMale);
  const femaleLeft = Math.max(0, (troop.femaleCount ?? 0) - troop.withDteFemale);
  const sexOver = troop.isMixed
    ? [
        draft.counts.male > maleLeft ? `${draft.counts.male - maleLeft} machos` : null,
        draft.counts.female > femaleLeft ? `${draft.counts.female - femaleLeft} hembras` : null
      ].filter(Boolean)
    : [];
  const otherErrors = draft.headerErrors.filter((e) => !['dte_number', 'dte_date', 'entered_at', 'received_at'].includes(e.field));

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="N° de DTE"
          required
          fullWidth
          variant="filled"
          value={draft.dteNumber}
          onChange={(e) => draft.setDteNumber(e.target.value.toUpperCase())}
          error={!!headerError('dte_number')}
          helperText={headerError('dte_number')}
          InputProps={{ disableUnderline: true }}
          inputProps={{ style: { fontFamily: 'monospace', fontWeight: 700 } }}
          sx={filledSx}
        />
        <TextField
          label="Fecha del DTE"
          type="date"
          required
          fullWidth
          variant="filled"
          value={draft.dteDate}
          onChange={(e) => draft.setDteDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{ disableUnderline: true }}
          inputProps={{ max: today }}
          error={!!headerError('dte_date')}
          helperText={headerError('dte_date')}
          sx={filledSx}
        />
        {troop.withArrival && (
          <TextField
            label="Fecha de ingreso"
            type="date"
            required
            fullWidth
            variant="filled"
            value={draft.enteredAt}
            onChange={(e) => draft.setEnteredAt(e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{ disableUnderline: true }}
            inputProps={{ max: today }}
            error={!!headerError('entered_at') || !!headerError('received_at')}
            helperText={headerError('entered_at') ?? headerError('received_at')}
            sx={filledSx}
          />
        )}
      </Stack>

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Caravanas</Typography>
          <Typography variant="caption" sx={{ fontWeight: 600, color: over > 0 ? 'warning.main' : over === 0 && draft.counts.total > 0 ? 'success.main' : 'text.secondary' }}>
            {draft.counts.total} de {troop.pending === 1 ? 'la cabeza que espera' : `las ${troop.pending} cabezas que esperan`} DTE
            {troop.isMixed ? ` · ${draft.counts.male}/${maleLeft} machos · ${draft.counts.female}/${femaleLeft} hembras` : ''}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {troop.isMixed && draft.counts.blankSex > 0 && (
            <>
              <Button size="small" onClick={() => draft.assignBlank('sex', 'M')} sx={linkSx}>
                Sin sexo → Macho
              </Button>
              <Button size="small" onClick={() => draft.assignBlank('sex', 'H')} sx={linkSx}>
                Sin sexo → Hembra
              </Button>
            </>
          )}
          {troop.breeds.length > 1 &&
            draft.counts.blankBreed > 0 &&
            troop.breeds.map((breed) => (
              <Button key={breed.position} size="small" onClick={() => draft.assignBlank('breed_position', breed.position)} sx={linkSx}>
                Sin raza → {breed.letter}
              </Button>
            ))}
        </Box>

        <Stack spacing={1}>
          {(over > 0 || sexOver.length > 0) && (
            <Alert severity="warning" sx={{ borderRadius: '6px', py: 0 }}>
              {over > 0
                ? `Este DTE trae ${over} ${over === 1 ? 'cabeza más' : 'cabezas más'} que las compradas`
                : `Este DTE trae ${sexOver.join(' y ')} de más`}
              ; se registrará una novedad para revisar con el proveedor. La carga no se bloquea.
            </Alert>
          )}
          {otherErrors.map((e) => (
            <Alert key={e.code} severity="error" sx={{ borderRadius: '6px', py: 0 }}>
              {e.message}
            </Alert>
          ))}
          <DteCaravansGrid draft={draft} troop={troop} />
        </Stack>
      </Box>

      {showObservations ? (
        <TextField
          label="Observaciones del DTE"
          variant="filled"
          multiline
          minRows={2}
          fullWidth
          autoFocus
          value={draft.observations}
          onChange={(e) => draft.setObservations(e.target.value)}
          InputProps={{ disableUnderline: true }}
          sx={filledSx}
        />
      ) : (
        <Button
          size="small"
          onClick={() => setShowObservations(true)}
          startIcon={<FuseSvgIcon size={15}>heroicons-outline:plus</FuseSvgIcon>}
          sx={{ ...linkSx, alignSelf: 'flex-start', color: 'text.secondary' }}
        >
          Agregar observaciones
        </Button>
      )}
    </Stack>
  );
};

export default DteEntryForm;
