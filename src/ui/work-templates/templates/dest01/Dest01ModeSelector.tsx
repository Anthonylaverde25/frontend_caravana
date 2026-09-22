import React from 'react';
import { Box, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { useDest01Print } from './Dest01PrintContext';

/** Blank sheet to fill in the chute, or a sheet pre-loaded with the calves of a breeding batch. */
export const Dest01ModeSelector: React.FC = () => {
  const { mode, setMode, blankPages, setBlankPages } = useDest01Print();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
        <FormControlLabel
          value="blank"
          control={<Radio size="small" />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Planilla en blanco</Typography>
              <Typography variant="caption" color="text.secondary">En la manga se escribe todo, incluido el lote de destete.</Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="from_batch"
          control={<Radio size="small" />}
          sx={{ mt: 1 }}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Desde lote de cría</Typography>
              <Typography variant="caption" color="text.secondary">Se imprimen las crías al pie con la caravana de la madre; en la manga se anotan los pesos.</Typography>
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

export default Dest01ModeSelector;
