import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { admitsSex } from '@/features/entry-orders/categoryLines';
import FullReceptionGrid from './FullReceptionGrid';
import ReceptionCaravansGrid from './ReceptionCaravansGrid';
import TroopDefaultsStrip from './TroopDefaultsStrip';
import type { ReceptionRows, ReceptionTroopContext } from './useReceptionRows';

interface ReceptionRowsSectionProps {
  draft: ReceptionRows;
  troop: ReceptionTroopContext;
  /** Head of the DTE still in transit: what the count is told against. */
  expected: number;
  /** What `expected` counts: "en tránsito" by default; "recibidas" or "sin caravana" by hand. */
  expectedLabel?: string;
  /** Caravans over `expected` are received with an incident; by hand they cannot outnumber the head. */
  excessIsError?: boolean;
  /** The full screen: a spreadsheet with a row per head and every datum of the animal in its column. */
  sheet?: boolean;
}

const linkSx = { textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', minWidth: 0, px: 1, py: 0.25 } as const;

/**
 * The caravans written down for the animals that arrived, counted against the head of the DTE in
 * transit, under what every caravan takes from the order (TROPA), with the blank sexes, categories
 * or breeds assignable in bulk, by name. A category only goes to the caravans whose sex it admits.
 * More animals than expected are not an error: the server receives them and raises an incident.
 */
export const ReceptionRowsSection: React.FC<ReceptionRowsSectionProps> = ({ draft, troop, expected, expectedLabel = 'en tránsito', excessIsError = false, sheet = false }) => {
  const over = draft.counts.total - expected;

  return (
    <Box>
      <TroopDefaultsStrip troop={troop} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Caravanas</Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: over > 0 ? (excessIsError ? 'error.main' : 'warning.main') : over === 0 && draft.counts.total > 0 ? 'success.main' : 'text.secondary'
          }}
        >
          Cargadas {draft.counts.total} de {expected} {expected === 1 ? 'cabeza' : 'cabezas'} {expectedLabel}
          {troop.isMixed ? ` · ${draft.counts.male} machos · ${draft.counts.female} hembras` : ''}
          {draft.counts.injured > 0 ? ` · ${draft.counts.injured} con lesión` : ''}
          {over > 0 ? ` · ${over} de más${excessIsError ? ': no puede haber más caravanas que cabezas' : ': se registrará una novedad'}` : ''}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {troop.isMixed && draft.counts.blankSex > 0 && (
          <Stack direction="row">
            <Button size="small" onClick={() => draft.assignBlank('sex', 'M')} sx={linkSx}>
              Sin sexo → Macho
            </Button>
            <Button size="small" onClick={() => draft.assignBlank('sex', 'H')} sx={linkSx}>
              Sin sexo → Hembra
            </Button>
          </Stack>
        )}
        {troop.needsCategory &&
          draft.counts.blankCategory > 0 &&
          troop.categories.map((line) => (
            <Button
              key={line.position}
              size="small"
              title={line.name ?? undefined}
              onClick={() =>
                draft.assignBlank('category_position', line.position, (row) => {
                  const sex = row.sex || troop.inheritedSex;

                  return sex !== null && admitsSex(line, sex);
                })
              }
              sx={linkSx}
            >
              Sin categoría → {line.name}
            </Button>
          ))}
        {troop.breeds.length > 1 &&
          draft.counts.blankBreed > 0 &&
          troop.breeds.map((breed) => (
            <Button key={breed.position} size="small" onClick={() => draft.assignBlank('breed_position', breed.position)} sx={linkSx}>
              Sin raza → {breed.label}
            </Button>
          ))}
      </Box>
      {sheet ? <FullReceptionGrid draft={draft} troop={troop} /> : <ReceptionCaravansGrid draft={draft} troop={troop} />}
    </Box>
  );
};

export default ReceptionRowsSection;
