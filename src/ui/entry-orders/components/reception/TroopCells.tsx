import React from 'react';
import { TableCell } from '@mui/material';
import BreedLineCell from './BreedLineCell';
import ChoiceButtons from './ChoiceButtons';
import ReceptionCategoryCell from './ReceptionCategoryCell';
import type { ReceptionRow, ReceptionRows, ReceptionTroopContext } from './useReceptionRows';

interface TroopCellsProps {
  row: ReceptionRow;
  isNew: boolean;
  draft: ReceptionRows;
  troop: ReceptionTroopContext;
  errors: { sex: boolean; category: boolean; breed: boolean; breedWarn: boolean };
}

const cellSx = { py: 0.25, px: 0.5, borderBottomColor: 'divider' } as const;

/**
 * The sex, category and breed line of a caravan in the compact grid of "Recibir": only what the
 * order leaves to each animal gets a cell. The full screen shows every datum (FullReceptionRow).
 */
export const TroopCells: React.FC<TroopCellsProps> = ({ row, isNew, draft, troop, errors }) => (
  <>
    {troop.isMixed && (
      <TableCell sx={cellSx}>
        {!isNew && (
          <ChoiceButtons
            value={row.sex}
            error={errors.sex}
            options={[
              { value: 'M', label: 'M', title: 'Macho' },
              { value: 'H', label: 'H', title: 'Hembra' }
            ]}
            onChange={(value) => draft.updateRow(row.key, { sex: value as ReceptionRow['sex'] })}
          />
        )}
      </TableCell>
    )}
    {troop.needsCategory && (
      <TableCell sx={cellSx}>
        {!isNew && (
          <ReceptionCategoryCell row={row} troop={troop} error={errors.category} onChange={(position) => draft.updateRow(row.key, { category_position: position })} />
        )}
      </TableCell>
    )}
    {troop.breeds.length > 1 && (
      <TableCell sx={cellSx}>
        {!isNew && (
          <BreedLineCell
            value={row.breed_position}
            breeds={troop.breeds}
            error={errors.breed}
            warn={errors.breedWarn}
            onChange={(position) => draft.updateRow(row.key, { breed_position: position })}
          />
        )}
      </TableCell>
    )}
  </>
);

export default TroopCells;
