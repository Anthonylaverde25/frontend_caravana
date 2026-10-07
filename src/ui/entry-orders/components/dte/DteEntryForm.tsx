import React, { useState } from 'react';
import { Alert, Button, Stack, TextField } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { DteDraft } from './useDteDraft';

interface DteEntryFormProps {
  draft: DteDraft;
  /** Head bought still waiting for their document. */
  pending: number;
  /** "Registrar ingreso": the animals arrive with the DTE, so it asks the day they entered. */
  withArrival?: boolean;
}

const filledSx = { '& .MuiFilledInput-root': { bgcolor: 'action.hover', borderRadius: '6px' } } as const;
const linkSx = { textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', minWidth: 0, px: 1, py: 0.25 } as const;

/**
 * The DTE being loaded: its number, date and the head it declares, counted against what the order
 * still expects. Shared by "Cargar DTE" and by the confirmation of "Registrar ingreso". More head
 * than expected is not an error: it is warned before confirming and recorded as an incident to
 * settle with the provider.
 */
export const DteEntryForm: React.FC<DteEntryFormProps> = ({ draft, pending, withArrival = false }) => {
  const [showObservations, setShowObservations] = useState(draft.observations !== '');
  const today = new Date().toISOString().slice(0, 10);
  const headerError = (field: string) => draft.headerErrors.find((e) => e.field === field)?.message;
  const over = draft.heads - pending;
  const otherErrors = draft.headerErrors.filter((e) => !['dte_number', 'dte_date', 'head_count', 'entered_at', 'received_at'].includes(e.field));

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
        <TextField
          label="Cabezas del DTE"
          type="number"
          required
          fullWidth
          variant="filled"
          value={draft.headCount}
          onChange={(e) => draft.setHeadCount(e.target.value)}
          InputProps={{ disableUnderline: true }}
          inputProps={{ min: 1 }}
          error={!!headerError('head_count')}
          helperText={headerError('head_count') ?? `${pending} ${pending === 1 ? 'cabeza espera' : 'cabezas esperan'} DTE`}
          sx={filledSx}
        />
        {withArrival && (
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

      {over > 0 && (
        <Alert severity="warning" sx={{ borderRadius: '6px', py: 0 }}>
          Este DTE declara {over} {over === 1 ? 'cabeza más' : 'cabezas más'} que las compradas; se registrará una novedad para revisar con el
          proveedor. La carga no se bloquea.
        </Alert>
      )}
      {otherErrors.map((e) => (
        <Alert key={e.code} severity="error" sx={{ borderRadius: '6px', py: 0 }}>
          {e.message}
        </Alert>
      ))}

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
