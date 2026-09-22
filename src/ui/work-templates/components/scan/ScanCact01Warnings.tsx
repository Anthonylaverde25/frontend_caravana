import React from 'react';
import { Alert, AlertTitle, Box, Stack, Typography } from '@mui/material';
import type { Cact01Warning } from './types';

interface ScanCact01WarningsProps {
  warnings: Cact01Warning[];
}

const TITLES: Record<string, string> = {
  ACTIVITY_MISMATCH: 'La actividad escrita no coincide con la del lote',
  SHEET_TOTAL_MISMATCH: 'Los totales del recuadro no cierran con las filas',
  MANAGEMENT_SYSTEM_DIFFERS: 'El casillero difiere del manejo declarado del lote',
  MANAGEMENT_SYSTEM_UNDECLARED: 'Un lote de destino no tiene declarado el manejo',
  SEX_MISMATCH: 'El sexo del papel no coincide con el del sistema',
  CATEGORY_MISMATCH: 'La categoría del papel no coincide con la del sistema',
  TEETH_REGRESSION: 'La dentición leída es menor que la registrada',
};

/**
 * Findings that are worth showing and not worth blocking.
 *
 * All of them share one shape: the paper disagrees with the system about something the
 * sheet has no business changing. The movement is recorded, the disagreement is
 * reported, and nothing is overwritten.
 */
export const ScanCact01Warnings: React.FC<ScanCact01WarningsProps> = ({ warnings }) => {
  if (warnings.length === 0) {
    return null;
  }

  const byCode = warnings.reduce<Record<string, Cact01Warning[]>>((groups, warning) => {
    groups[warning.code] = [...(groups[warning.code] ?? []), warning];

    return groups;
  }, {});

  return (
    <Stack spacing={1.5}>
      {Object.entries(byCode).map(([code, group]) => (
        <Alert key={code} severity="info" sx={{ borderRadius: '8px' }}>
          <AlertTitle sx={{ fontWeight: 800, fontSize: '0.8rem' }}>{TITLES[code] ?? code}</AlertTitle>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            {group.slice(0, 8).map((warning) => (
              <Typography key={warning.message} variant="caption" sx={{ lineHeight: 1.4 }}>
                {warning.message}
              </Typography>
            ))}
            {group.length > 8 && (
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                …y {group.length - 8} más.
              </Typography>
            )}
          </Box>
        </Alert>
      ))}
    </Stack>
  );
};

export default ScanCact01Warnings;
