import React from 'react';
import { Alert, Stack, TextField, Typography } from '@mui/material';
import ChoiceButtons from './ChoiceButtons';

/** What happens to the head of the DTE that did not come in this reception. */
export type MissingFate = 'LATER' | 'MISSING';

interface MissingHeadPanelProps {
  /** Head of the DTE left in transit after this reception. */
  left: number;
  fate: MissingFate;
  onFate: (fate: MissingFate) => void;
  /** How many of them will never arrive, when the fate is MISSING. */
  count: string;
  onCount: (count: string) => void;
  reason: string;
  onReason: (reason: string) => void;
  /** Marked on click: the reason or the count are missing. */
  showErrors: boolean;
}

const filledSx = { '& .MuiFilledInput-root': { bgcolor: 'action.hover', borderRadius: '6px' } } as const;

export const missingCountOf = (fate: MissingFate, count: string, left: number): number =>
  fate === 'MISSING' ? Math.min(left, Math.max(0, Math.trunc(Number(count) || 0))) : 0;

/**
 * "Faltan N": the head the DTE declares that did not come. By default they arrive later and stay
 * in transit; declaring that they will never arrive is final, so it asks how many and why, and
 * raises an incident to settle with the provider. Shared by the manual reception and the review
 * of a scanned ING-03.
 */
export const MissingHeadPanel: React.FC<MissingHeadPanelProps> = ({ left, fate, onFate, count, onCount, reason, onReason, showErrors }) => {
  if (left <= 0) return null;

  const missing = missingCountOf(fate, count, left);
  const countError = showErrors && fate === 'MISSING' && missing === 0;
  const reasonError = showErrors && fate === 'MISSING' && reason.trim().length < 3;

  return (
    <Alert severity={fate === 'MISSING' ? 'warning' : 'info'} icon={false} sx={{ borderRadius: '6px', '& .MuiAlert-message': { width: '100%' } }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {left === 1 ? 'Falta 1 cabeza del DTE:' : `Faltan ${left} cabezas del DTE:`}
          </Typography>
          <ChoiceButtons
            value={fate}
            options={[
              { value: 'LATER', label: 'Llegan después', title: 'Quedan en tránsito y se reciben otro día' },
              { value: 'MISSING', label: 'No van a llegar', title: 'Se declaran faltantes: es definitivo' }
            ]}
            onChange={(value) => onFate((value || 'LATER') as MissingFate)}
          />
        </Stack>
        {fate === 'MISSING' && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label="Cuántas no llegan"
              type="number"
              variant="filled"
              value={count}
              onChange={(e) => onCount(e.target.value)}
              inputProps={{ min: 1, max: left }}
              InputProps={{ disableUnderline: true }}
              error={countError}
              helperText={countError ? `Entre 1 y ${left}.` : `El resto (${left - missing}) llega después.`}
              sx={{ ...filledSx, width: { sm: 180 } }}
            />
            <TextField
              label="Motivo (obligatorio)"
              required
              fullWidth
              multiline
              variant="filled"
              value={reason}
              onChange={(e) => onReason(e.target.value)}
              InputProps={{ disableUnderline: true }}
              error={reasonError}
              helperText={reasonError ? 'Indicá por qué no van a llegar.' : 'Genera una novedad para revisar con el proveedor.'}
              sx={filledSx}
            />
          </Stack>
        )}
      </Stack>
    </Alert>
  );
};

export default MissingHeadPanel;
