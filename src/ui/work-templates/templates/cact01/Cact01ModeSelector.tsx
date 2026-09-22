import React from 'react';
import { Box, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { useCact01Print } from './Cact01PrintContext';

/** Blank sheet to fill in the chute, or a sheet pre-loaded with a source batch. */
export const Cact01ModeSelector: React.FC = () => {
  const { mode, setMode, blankPages, setBlankPages } = useCact01Print();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
        <FormControlLabel
          value="blank"
          control={<Radio size="small" />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Planilla en blanco</Typography>
              <Typography variant="caption" color="text.secondary">
                En la manga se escribe todo, incluidos los nombres de lote de origen y destino.
              </Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="from_batch"
          control={<Radio size="small" />}
          sx={{ mt: 1 }}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Desde lote de origen</Typography>
              <Typography variant="caption" color="text.secondary">
                Se imprimen los animales con caravana, sexo, categoría y dentición; en la manga se anota el peso del día.
              </Typography>
            </Box>
          }
        />
      </RadioGroup>

      {mode === 'blank' && (
        <TextField
          label="Cantidad de hojas"
          type="number"
          size="small"
          value={blankPages}
          onChange={(e) => setBlankPages(Number(e.target.value))}
          inputProps={{ min: 1, max: 20 }}
          sx={{ maxWidth: 180 }}
        />
      )}
    </Box>
  );
};

export default Cact01ModeSelector;
