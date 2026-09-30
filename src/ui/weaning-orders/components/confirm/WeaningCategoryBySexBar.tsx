import React, { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import CategoryChangeCell, { CategoryPairValue } from '@/components/caravan/CategoryChangeCell';
import type { WeaningOrderFormState } from '../../hooks/useWeaningOrderForm';

interface WeaningCategoryBySexBarProps {
  form: WeaningOrderFormState;
  /** Sex of each calf of the order. */
  sexById: Record<number, 'M' | 'H' | null>;
}

/** The new C/S when it is declared now: per calf in the table, or to all of them by sex from here. */
export const WeaningCategoryBySexBar: React.FC<WeaningCategoryBySexBarProps> = ({ form, sexById }) => {
  const [males, setMales] = useState<CategoryPairValue | null>(null);
  const [females, setFemales] = useState<CategoryPairValue | null>(null);

  const applyBySex = () => {
    form.calfIds.forEach((id) => {
      const pair = sexById[id] === 'M' ? males : sexById[id] === 'H' ? females : null;

      if (pair) form.updateCalf(id, { category: pair });
    });
  };

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems={{ md: 'flex-end' }}
      sx={{ p: 1.5, mb: 1.5, borderRadius: '6px', bgcolor: 'action.hover' }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ alignSelf: { md: 'center' } }}>
        C/S nueva por sexo:
      </Typography>
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          Machos
        </Typography>
        <CategoryChangeCell current={null} value={males} onChange={setMales} sex="M" ariaLabel="C/S nueva de los machos" />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          Hembras
        </Typography>
        <CategoryChangeCell current={null} value={females} onChange={setFemales} sex="H" ariaLabel="C/S nueva de las hembras" />
      </Box>
      <Button
        size="small"
        variant="outlined"
        disabled={!males && !females}
        onClick={applyBySex}
        sx={{ textTransform: 'none', fontWeight: 600, height: 34 }}
      >
        Aplicar a todas las crías
      </Button>
    </Stack>
  );
};

export default WeaningCategoryBySexBar;
