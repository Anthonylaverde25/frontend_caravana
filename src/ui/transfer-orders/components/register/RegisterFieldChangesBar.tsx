import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import type { RegisterFieldDataState } from '../../hooks/useRegisterFieldData';
import { describeChanges } from './registerFieldData';

/**
 * What the chute data will change, over the table: the rows show each value, this line says
 * how many, and lets the operator start over.
 */
export const RegisterFieldChangesBar: React.FC<{ state: RegisterFieldDataState }> = ({ state }) => {
  if (state.animals.length === 0) return null;

  const summary = describeChanges(state.changes);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Typography variant="caption" color={summary ? 'text.primary' : 'text.secondary'} sx={{ fontWeight: summary ? 600 : 400 }}>
        {summary ? `Datos de campo: ${summary}` : 'En los marcados podés corregir peso, dientes, categoría y observaciones.'}
      </Typography>
      {summary && (
        <Button size="small" color="inherit" onClick={state.clear} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Limpiar cambios
        </Button>
      )}
    </Box>
  );
};

export default RegisterFieldChangesBar;
