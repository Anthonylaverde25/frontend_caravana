import React from 'react';
import { Alert, Box, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { useCact01Print } from './Cact01PrintContext';

/**
 * One destination for the whole troop, or one per animal.
 *
 * This switch only decides what gets PRINTED. The schema and the endpoint are the same
 * either way: the row cell wins, the header is the default. That is what lets a single
 * template cover both ways of working without a second code.
 */
export const Cact01DestinationSelector: React.FC = () => {
  const { destinationMode, setDestinationMode, header, setHeaderField } = useCact01Print();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <RadioGroup
        value={destinationMode}
        onChange={(e) => setDestinationMode(e.target.value as typeof destinationMode)}
      >
        <FormControlLabel
          value="single"
          control={<Radio size="small" />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Un destino para todos</Typography>
              <Typography variant="caption" color="text.secondary">
                El lote de destino va en el encabezado y vale para toda la planilla.
              </Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="per_row"
          control={<Radio size="small" />}
          sx={{ mt: 1 }}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Un destino por animal</Typography>
              <Typography variant="caption" color="text.secondary">
                Se imprime una columna "Lote destino" para escribir a mano en cada fila.
              </Typography>
            </Box>
          }
        />
      </RadioGroup>

      {destinationMode === 'single' ? (
        <TextField
          label="Lote de destino (existente o nuevo)"
          size="small"
          value={header.lote_destino}
          onChange={(e) => setHeaderField('lote_destino', e.target.value)}
          helperText="Se imprime en el encabezado. Al escanear se confirma contra los lotes del sistema."
        />
      ) : (
        <Alert severity="info" sx={{ fontSize: '0.75rem' }}>
          La configuración de cada lote nuevo —actividad, tipo y sistema de manejo— se completa al escanear,
          no en el papel. La planilla sólo lleva el nombre.
        </Alert>
      )}
    </Box>
  );
};

export default Cact01DestinationSelector;
