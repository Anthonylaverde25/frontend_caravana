import React from 'react';
import { Alert, Box, FormControlLabel, MenuItem, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { useCact01Print } from './Cact01PrintContext';
import { useCact01ScanOptions } from '../../hooks/useCact01ScanOptions';

/**
 * One destination for the whole troop, or one per animal.
 *
 * This switch only decides what gets PRINTED. The schema and the endpoint are the same
 * either way: the row cell wins, the header is the default. That is what lets a single
 * template cover both ways of working without a second code.
 *
 * The destination ACTIVITY, above the switch, is not part of that choice: it is declared
 * once for the whole sheet in both modes. It is what makes the handwritten batch cell
 * verifiable — whatever is written at the chute has to be a batch of this stage.
 */
export const Cact01DestinationSelector: React.FC = () => {
  const { destinationMode, setDestinationMode, header, setHeaderField } = useCact01Print();
  const { activities } = useCact01ScanOptions();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <TextField
        select
        label="Actividad de destino"
        size="small"
        required
        value={header.actividad_destino_id ?? ''}
        onChange={(e) => {
          const id = e.target.value === '' ? null : Number(e.target.value);

          setHeaderField('actividad_destino_id', id);
          setHeaderField('actividad_destino', activities.find((a) => a.id === id)?.name ?? '');
        }}
        helperText="Una por planilla, valga una hoja o varias. Todo lote de destino pertenece a esta etapa."
      >
        <MenuItem value="">
          <em>Seleccionar etapa destino…</em>
        </MenuItem>
        {activities.map((activity) => (
          <MenuItem key={activity.id} value={activity.id}>
            {activity.name}
          </MenuItem>
        ))}
      </TextField>

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
          Cada fila lleva el nombre del lote y su celda M —C de corral, P de pastura—. La actividad ya la
          declara el encabezado, así que al escanear sólo se pregunta el tipo de lote, y únicamente para los
          nombres que todavía no existan en esa etapa.
        </Alert>
      )}
    </Box>
  );
};

export default Cact01DestinationSelector;
