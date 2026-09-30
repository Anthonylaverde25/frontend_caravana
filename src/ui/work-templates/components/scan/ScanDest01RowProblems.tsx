import React from 'react';
import { Box, Typography } from '@mui/material';
import { ErrorOutline as ErrorOutlineIcon, WarningAmber as WarningAmberIcon } from '@mui/icons-material';
import type { Dest01Error } from './types';

interface ScanDest01RowProblemsProps {
  errors: Dest01Error[];
  weightIssue?: { severity: 'error' | 'warning'; message: string };
  /** The row was edited after the server rejected it: its errors are shown crossed out. */
  edited: boolean;
}

/** What is wrong with one calf of the sheet, under its row: red blocks the load, amber only asks for a second look. */
export const ScanDest01RowProblems: React.FC<ScanDest01RowProblemsProps> = ({ errors, weightIssue, edited }) => (
  <>
    {errors.map((error) => (
      <Box key={error.code} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <ErrorOutlineIcon sx={{ fontSize: 16, color: edited ? 'text.disabled' : 'error.main' }} />
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, color: edited ? 'text.disabled' : 'error.main', textDecoration: edited ? 'line-through' : 'none' }}
        >
          {error.message}
        </Typography>
      </Box>
    ))}
    {weightIssue && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {weightIssue.severity === 'error' ? (
          <ErrorOutlineIcon sx={{ fontSize: 16, color: 'error.main' }} />
        ) : (
          <WarningAmberIcon sx={{ fontSize: 16, color: 'warning.main' }} />
        )}
        <Typography variant="caption" sx={{ fontWeight: 600, color: weightIssue.severity === 'error' ? 'error.main' : 'warning.dark' }}>
          {weightIssue.message}
        </Typography>
      </Box>
    )}
    {edited && errors.length > 0 && (
      <Typography variant="caption" sx={{ color: 'info.main', fontWeight: 700 }}>
        Fila editada: se vuelve a validar al reintentar la carga.
      </Typography>
    )}
  </>
);

export default ScanDest01RowProblems;
