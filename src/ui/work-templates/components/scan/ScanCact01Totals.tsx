import React from 'react';
import { Chip, Stack, Tooltip } from '@mui/material';
import type { Cact01Metadata, Cact01Row } from './types';

interface ScanCact01TotalsProps {
  rows: Cact01Row[];
  metadata: Cact01Metadata;
}

const toNumber = (value: string): number => Number(String(value).replace(',', '.'));

/**
 * Live totals of the merged rows, set against the ones written in the summary box of the
 * paper.
 *
 * The declared figures are a CONTROL, not data: the box says what the operator counted
 * in the chute, the chips say what the scan actually read. When they disagree, something
 * was misread or a sheet is missing — which is exactly what the mismatch is for.
 *
 * The average is only ever computed, never compared: it is total over head, so a third
 * handwritten number would just be a third chance to disagree about the same fact.
 */
export const ScanCact01Totals: React.FC<ScanCact01TotalsProps> = ({ rows, metadata }) => {
  const animals = rows.filter((r) => r.caravana.trim() !== '');
  const weights = animals.map((r) => toNumber(r.peso_actual)).filter((w) => Number.isFinite(w) && w > 0);
  const totalKg = weights.reduce((a, b) => a + b, 0);
  const average = weights.length ? totalKg / weights.length : null;

  const declaredHead = toNumber(metadata.total_cabezas);
  const declaredKg = toNumber(metadata.peso_total);

  const headMismatch = Number.isFinite(declaredHead) && metadata.total_cabezas.trim() !== '' && declaredHead !== animals.length;
  const kgMismatch = Number.isFinite(declaredKg) && metadata.peso_total.trim() !== '' && Math.abs(declaredKg - totalKg) > 1;

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" useFlexGap>
      <Tooltip title={headMismatch ? `El recuadro del papel declara ${metadata.total_cabezas} cabezas` : ''}>
        <Chip
          size="small"
          color={headMismatch ? 'warning' : 'primary'}
          variant="outlined"
          label={`Animales: ${animals.length}${headMismatch ? ` (papel: ${metadata.total_cabezas})` : ''}`}
          sx={{ fontWeight: 800, borderRadius: '4px' }}
        />
      </Tooltip>
      <Chip size="small" variant="outlined" label={`Pesados: ${weights.length}`} sx={{ fontWeight: 700, borderRadius: '4px' }} />
      <Tooltip title={kgMismatch ? `El recuadro del papel declara ${metadata.peso_total} kg` : ''}>
        <Chip
          size="small"
          color={kgMismatch ? 'warning' : 'default'}
          variant="outlined"
          label={`Kilos: ${Math.round(totalKg)}${kgMismatch ? ` (papel: ${Math.round(declaredKg)})` : ''}`}
          sx={{ fontWeight: 700, borderRadius: '4px' }}
        />
      </Tooltip>
      <Chip
        size="small"
        variant="outlined"
        label={`Promedio: ${average !== null ? `${average.toFixed(1)} kg` : '—'}`}
        sx={{ fontWeight: 700, borderRadius: '4px' }}
      />
    </Stack>
  );
};

export default ScanCact01Totals;
