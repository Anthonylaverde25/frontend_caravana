import React from 'react';
import { Typography } from '@mui/material';
import { categoriesAdmitting } from '@/features/entry-orders/categoryLines';
import ChoiceButtons from './ChoiceButtons';
import type { ReceptionRow, ReceptionTroopContext } from './useReceptionRows';

interface ReceptionCategoryCellProps {
  row: ReceptionRow;
  troop: ReceptionTroopContext;
  error: boolean;
  onChange: (position: number | '') => void;
}

/**
 * The category of a caravan, by its name. Only the categories its sex admits are offered; when
 * its sex admits a single one, that one is shown and nothing is asked. While the sex of a caravan
 * of a mixed troop is blank, every category is offered.
 */
export const ReceptionCategoryCell: React.FC<ReceptionCategoryCellProps> = ({ row, troop, error, onChange }) => {
  const sex = row.sex || troop.inheritedSex;
  const options = sex ? categoriesAdmitting(troop.categories, sex) : troop.categories;

  if (options.length === 1 && row.category_position === '') {
    return (
      <Typography variant="caption" sx={{ px: 1, color: 'text.secondary', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {options[0].name}
      </Typography>
    );
  }

  return (
    <ChoiceButtons
      value={row.category_position === '' ? '' : String(row.category_position)}
      error={error}
      options={options.map((line) => ({ value: String(line.position), label: line.name ?? String(line.position), title: line.name ?? '' }))}
      onChange={(value) => onChange(value === '' ? '' : Number(value))}
    />
  );
};

export default ReceptionCategoryCell;
