import React, { useEffect } from 'react';
import { Box, FormHelperText, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { SEX_COMPOSITION_LABELS, SexComposition, TROOP_CONDITION_LABELS } from '@/features/entry-orders/types';
import { ExternalBatchForm, ExternalFormSection, filledSx } from './externalFormParts';

const SEXES: SexComposition[] = ['MALE', 'FEMALE', 'MIXED'];

/** The only composition a single-sex category admits; null when it admits any. */
const fixedComposition = (sex: string | undefined): SexComposition | null => (sex === 'M' ? 'MALE' : sex === 'H' ? 'FEMALE' : null);

/**
 * What was bought: how many head, of which general category, of which sexes, of what age and in
 * what state. The sexes are declared here, once for the whole troop: a heifer category fixes
 * "Hembras" and is not asked; a calf category asks, and "Ambos" asks how many of each.
 */
export const ExternalTroopSection: React.FC<{ form: ExternalBatchForm }> = ({ form }) => {
  const { watch, setValue, register, formState } = form;
  const { errors } = formState;
  const { data: categories = [] } = useAnimalCategories();
  const categoryId = watch('category_id') as number | undefined;
  const composition = watch('sex_composition');
  const category = categories.find((c) => c.id === categoryId);
  const fixed = fixedComposition(category?.sex);
  const headCount = Number(watch('head_count')) || 0;
  const maleCount = watch('male_count');
  const femaleCount = watch('female_count');

  // A mixed troop is head = males + females: typing one fills the other with the rest.
  const setSplit = (field: 'male_count' | 'female_count', raw: string) => {
    const value = raw === '' ? null : Number(raw);
    const other = field === 'male_count' ? 'female_count' : 'male_count';

    setValue(field, value as never, { shouldDirty: true });

    if (value != null && value > 0 && value < headCount) setValue(other, (headCount - value) as never, { shouldDirty: true });
  };

  useEffect(() => {
    if (fixed && composition !== fixed) setValue('sex_composition', fixed, { shouldValidate: true });
  }, [fixed, composition, setValue]);

  useEffect(() => {
    if (composition !== 'MIXED') {
      setValue('male_count', null);
      setValue('female_count', null);
    }
  }, [composition, setValue]);

  return (
    <ExternalFormSection title="Tropa">
      <Stack direction="row" spacing={2}>
        <TextField
          {...register('head_count')}
          label="Cabezas"
          type="number"
          variant="filled"
          required
          inputProps={{ min: 1 }}
          error={!!errors.head_count}
          helperText={errors.head_count?.message}
          sx={{ ...filledSx, flex: 1 }}
        />
        <TextField
          select
          fullWidth
          label="Categoría general"
          variant="filled"
          required
          value={categoryId ?? ''}
          onChange={(e) =>
            setValue('category_id', Number(e.target.value), {
              shouldValidate: true
            })
          }
          error={!!errors.category_id}
          helperText={errors.category_id?.message}
          sx={{ ...filledSx, flex: 2 }}
        >
          {categories.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 0.5 }}>
          Sexo de la tropa
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={composition ?? null}
            onChange={(_, next: SexComposition | null) => next && setValue('sex_composition', next, { shouldValidate: true })}
          >
            {SEXES.map((sex) => (
              <ToggleButton
                key={sex}
                value={sex}
                disabled={fixed != null && fixed !== sex}
                sx={{ px: 2, textTransform: 'none', fontWeight: 700 }}
              >
                {SEX_COMPOSITION_LABELS[sex]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {composition === 'MIXED' && (
            <Stack direction="row" spacing={1.5}>
              <TextField
                value={maleCount ?? ''}
                onChange={(e) => setSplit('male_count', e.target.value)}
                label="Machos"
                type="number"
                size="small"
                variant="filled"
                inputProps={{ min: 1 }}
                error={!!errors.male_count}
                sx={{ ...filledSx, width: 110 }}
              />
              <TextField
                value={femaleCount ?? ''}
                onChange={(e) => setSplit('female_count', e.target.value)}
                label="Hembras"
                type="number"
                size="small"
                variant="filled"
                inputProps={{ min: 1 }}
                error={!!errors.male_count}
                sx={{ ...filledSx, width: 110 }}
              />
            </Stack>
          )}
        </Stack>
        {fixed && category && (
          <FormHelperText>
            La categoría {category.name} es sólo de {SEX_COMPOSITION_LABELS[fixed].toLowerCase()}.
          </FormHelperText>
        )}
        {(errors.sex_composition || errors.male_count) && (
          <FormHelperText error>{errors.sex_composition?.message ?? errors.male_count?.message}</FormHelperText>
        )}
      </Box>

      <Stack direction="row" spacing={1} alignItems="flex-start">
        <TextField
          {...register('age_min_months')}
          label="Edad desde"
          type="number"
          variant="filled"
          inputProps={{ min: 0 }}
          error={!!errors.age_min_months}
          sx={{ ...filledSx, flex: 1 }}
        />
        <Typography sx={{ pt: 0.5, fontWeight: 700, color: 'text.secondary' }}>/</Typography>
        <TextField
          {...register('age_max_months')}
          label="hasta (meses)"
          type="number"
          variant="filled"
          inputProps={{ min: 0 }}
          error={!!errors.age_max_months}
          helperText={errors.age_max_months?.message ?? 'Rango aproximado, ej: 9/10.'}
          sx={{ ...filledSx, flex: 1 }}
        />
      </Stack>
      <TextField
        select
        fullWidth
        label="Estado"
        variant="filled"
        required
        value={watch('condition') ?? ''}
        onChange={(e) =>
          setValue('condition', e.target.value as never, {
            shouldValidate: true
          })
        }
        error={!!errors.condition}
        helperText={errors.condition?.message}
        sx={filledSx}
      >
        {Object.entries(TROOP_CONDITION_LABELS).map(([value, label]) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
    </ExternalFormSection>
  );
};

export default ExternalTroopSection;
