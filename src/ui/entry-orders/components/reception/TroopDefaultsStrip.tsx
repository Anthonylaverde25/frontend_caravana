import React from 'react';
import { Chip, Stack, Typography } from '@mui/material';
import { troopDefaultsOf, type TroopField } from '@/features/entry-orders/troopDefaults';
import type { ReceptionTroopContext } from './useReceptionRows';

interface TroopDefaultsStripProps {
  troop: ReceptionTroopContext;
}

/**
 * What every caravan of the reception takes from the order — sex, category, breed and coat — or
 * says on its own row. The same reading the ING-03 prints in its TROPA band.
 */
export const TroopDefaultsStrip: React.FC<TroopDefaultsStripProps> = ({ troop }) => {
  const defaults = troopDefaultsOf({
    sex_composition: troop.isMixed ? 'MIXED' : troop.inheritedSex === 'H' ? 'FEMALE' : 'MALE',
    sex_composition_label: troop.inheritedSex === 'H' ? 'Hembras' : troop.inheritedSex === 'M' ? 'Machos' : null,
    breeds: troop.breeds.map((b) => ({ ...b, id: b.position, breed_id: 0, breed_name: null, color_id: null, color_name: null })),
    categories: troop.categories.map((c) => ({ ...c, id: c.position, category_id: 0, head_count: null, label: c.name ?? '' })),
    needs_category_per_animal: troop.needsCategory
  });

  const chip = (label: string, field: TroopField) => (
    <Chip
      size="small"
      variant={field.mode === 'GLOBAL' ? 'filled' : 'outlined'}
      label={
        <>
          <Typography component="span" sx={{ fontSize: '0.7rem', color: 'text.secondary', mr: 0.5 }}>
            {label}:
          </Typography>
          <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
            {field.mode === 'GLOBAL' ? field.value : 'por caravana'}
          </Typography>
        </>
      }
      sx={{ borderRadius: '6px' }}
    />
  );

  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center" sx={{ mb: 1 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
        Tropa
      </Typography>
      {chip('Sexo', defaults.sex)}
      {chip('Categoría', defaults.category)}
      {chip('Raza / pelaje', defaults.breed)}
    </Stack>
  );
};

export default TroopDefaultsStrip;
