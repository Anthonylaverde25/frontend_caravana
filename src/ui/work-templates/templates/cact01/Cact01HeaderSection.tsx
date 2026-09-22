import React from 'react';
import { Box, MenuItem, TextField, Typography } from '@mui/material';
import { useCact01Print } from './Cact01PrintContext';

/**
 * Header of the printed sheet: date, activities, and the management system box.
 *
 * The activities are CONTROL fields, not sources of truth: a batch never changes its
 * activity, so what they are for is to let the scan say "the paper says Invernada but
 * this batch is Recría" instead of silently disagreeing. They are pre-filled from the
 * chosen batches and stay editable.
 *
 * The Corral/Pastura box is the proposal for the destination batches that get created —
 * for ANY activity, now that the management system is a fact of every productive batch.
 * It never overwrites a batch that already exists.
 */
export const Cact01HeaderSection: React.FC = () => {
  const { header, setHeaderField, destinationMode } = useCact01Print();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <TextField
        label="Fecha del movimiento"
        type="date"
        size="small"
        value={header.fecha_movimiento}
        onChange={(e) => setHeaderField('fecha_movimiento', e.target.value)}
        InputLabelProps={{ shrink: true }}
      />

      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <TextField
          label="Actividad de origen"
          size="small"
          fullWidth
          value={header.actividad_origen}
          onChange={(e) => setHeaderField('actividad_origen', e.target.value)}
        />
        <TextField
          label="Actividad de destino"
          size="small"
          fullWidth
          value={header.actividad_destino}
          onChange={(e) => setHeaderField('actividad_destino', e.target.value)}
        />
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: -0.5 }}>
        Las actividades se imprimen como control. Al escanear, la verdad es el lote elegido.
      </Typography>

      <TextField
        select
        label="Sistema de manejo (propuesta)"
        size="small"
        value={header.sistema_manejo}
        onChange={(e) => setHeaderField('sistema_manejo', e.target.value)}
        helperText={
          destinationMode === 'per_row'
            ? 'Propuesta inicial para los lotes nuevos. Cada uno se confirma al escanear.'
            : 'Propuesta para el lote de destino si hay que crearlo. Nunca pisa un lote existente.'
        }
      >
        <MenuItem value="">Sin marcar</MenuItem>
        <MenuItem value="CORRAL">A corral (confinado)</MenuItem>
        <MenuItem value="PASTURA">A campo (pastura)</MenuItem>
      </TextField>

      <TextField
        label="Responsable / Firma"
        size="small"
        value={header.responsable}
        onChange={(e) => setHeaderField('responsable', e.target.value)}
      />
    </Box>
  );
};

export default Cact01HeaderSection;
