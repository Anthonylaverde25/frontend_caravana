import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { ScanDest01BatchTarget } from './ScanDest01BatchTarget';
import { emptyDest01Target, type Dest01PagesState } from '../../hooks/useDest01Pages';
import type { Dest01HeaderError } from './types';

interface ScanDest01PerAnimalTargetsProps {
  state: Dest01PagesState;
  /** The weaning order the sheet fulfils already declared its batches. */
  orderCode: string | null;
  headerErrors?: Dest01HeaderError[];
}

/**
 * Per-animal sheet: every weaning batch written on the rows, resolved once each — an existing
 * weaning batch or a new one with its management system (the M letter of its rows proposes it).
 * A row with its batch blank is a calf without destination: it is completed on its own row.
 */
export const ScanDest01PerAnimalTargets: React.FC<ScanDest01PerAnimalTargetsProps> = ({ state, orderCode, headerErrors }) => {
  const blankRows = state.rows.filter((r) => r.caravana.trim() !== '' && r.lote_destino.trim() === '').length;

  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ px: 2, pt: 1.5 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
          Lotes de destete por cría ({state.perAnimalNames.length})
        </Typography>
      </Box>
      {state.perAnimalNames.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 1.5 }}>
          Ninguna fila tiene lote escrito: completá el lote de cada cría en la tabla.
        </Typography>
      )}
      {state.perAnimalNames.map((entry) => (
        <ScanDest01BatchTarget
          key={entry.key}
          sheetName={entry.name}
          sheetManagement={entry.letters.length === 1 ? entry.letters[0] : ''}
          inheritedFromOrder={orderCode}
          target={state.perAnimalTargets[entry.key] ?? emptyDest01Target()}
          onChange={(target) => state.setPerAnimalTarget(entry.key, target)}
          headerErrors={headerErrors}
        />
      ))}
      {state.perAnimalNames.some((entry) => entry.letters.length > 1) && (
        <Alert severity="warning" sx={{ mx: 2, mb: 1.5, borderRadius: '6px' }}>
          Un mismo lote aparece como corral en una fila y como pastura en otra: elegí uno en su recuadro.
        </Alert>
      )}
      {blankRows > 0 && (
        <Alert severity="error" sx={{ mx: 2, mb: 1.5, borderRadius: '6px' }}>
          {blankRows} cría(s) sin lote de destete: completalo en su fila (no se toma el del encabezado).
        </Alert>
      )}
    </Box>
  );
};

export default ScanDest01PerAnimalTargets;
