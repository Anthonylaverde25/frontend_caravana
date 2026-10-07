import React, { useEffect } from 'react';
import { Box, FormHelperText, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { SEX_COMPOSITION_LABELS, SexComposition } from '@/features/entry-orders/types';
import { ExternalBatchForm, filledSx } from './externalFormParts';
import { headCountOf } from './externalBatchSchema';

const SEXES: SexComposition[] = ['MALE', 'FEMALE', 'MIXED'];

/**
 * What the categories chosen allow: "Machos" when none holds females, "Hembras" when none holds
 * males, "Ambos" when some hold each. The head that can only be of one sex (30 Novillito are 30
 * males) is the floor of that sex's count.
 */
const allowedBy = (sexes: string[]) => {
  const hasM = sexes.includes('M');
  const hasH = sexes.includes('H');
  const hasBoth = sexes.includes('BOTH');

  return {
    MALE: !hasH,
    FEMALE: !hasM,
    MIXED: sexes.length === 0 || ((hasM || hasBoth) && (hasH || hasBoth)),
    // Only fixed-sex categories: the split is the categories' own.
    splitIsFixed: hasM && hasH && !hasBoth
  } as const;
};

/**
 * The sexes of the troop, declared once for the whole order. The categories narrow it: a heifer
 * category alone fixes "Hembras" and is not asked; Novillito + Vaquillona fix "Ambos" and its split;
 * a calf category asks, and "Ambos" asks how many of each.
 */
export const ExternalSexCompositionField: React.FC<{ form: ExternalBatchForm }> = ({ form }) => {
  const { watch, setValue, formState } = form;
  const { errors } = formState;
  const { data: catalogue = [] } = useAnimalCategories();
  const lines = watch('categories') ?? [];
  const composition = watch('sex_composition');
  const headCount = headCountOf(lines);
  const maleCount = watch('male_count');
  const femaleCount = watch('female_count');

  const chosen = lines
    .map((line) => ({ line, category: catalogue.find((c) => c.id === line.category_id) }))
    .filter((item) => item.category != null);
  const allowed = allowedBy(chosen.map((item) => String(item.category?.sex)));
  const options = SEXES.filter((sex) => allowed[sex]);
  const fixed = chosen.length > 0 && options.length === 1 ? options[0] : null;
  const floorOf = (sex: 'M' | 'H') =>
    chosen.filter((item) => item.category?.sex === sex).reduce((sum, item) => sum + (Number(item.line.head_count) || 0), 0);
  const males = floorOf('M');
  const females = floorOf('H');

  useEffect(() => {
    if (fixed && composition !== fixed) setValue('sex_composition', fixed, { shouldValidate: true });
  }, [fixed, composition, setValue]);

  useEffect(() => {
    if (composition !== 'MIXED') {
      setValue('male_count', null);
      setValue('female_count', null);
    } else if (allowed.splitIsFixed && (maleCount !== males || femaleCount !== females)) {
      setValue('male_count', males as never, { shouldDirty: true });
      setValue('female_count', females as never, { shouldDirty: true });
    }
  }, [composition, allowed.splitIsFixed, males, females, maleCount, femaleCount, setValue]);

  // A mixed troop is head = males + females: typing one fills the other with the rest.
  const setSplit = (field: 'male_count' | 'female_count', raw: string) => {
    const value = raw === '' ? null : Number(raw);
    const other = field === 'male_count' ? 'female_count' : 'male_count';

    setValue(field, value as never, { shouldDirty: true });

    if (value != null && value > 0 && value < headCount) setValue(other, (headCount - value) as never, { shouldDirty: true });
  };

  const hint = fixed
    ? fixed === 'MIXED'
      ? 'Machos y hembras salen de las categorías.'
      : `Las categorías elegidas son sólo de ${SEX_COMPOSITION_LABELS[fixed].toLowerCase()}.`
    : composition === 'MIXED' && (males > 0 || females > 0)
      ? `Las categorías ya declaran ${males} machos y ${females} hembras como mínimo.`
      : null;

  return (
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
            <ToggleButton key={sex} value={sex} disabled={!allowed[sex]} sx={{ px: 2, textTransform: 'none', fontWeight: 700 }}>
              {SEX_COMPOSITION_LABELS[sex]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {composition === 'MIXED' && (
          <Stack direction="row" spacing={1.5}>
            {(['male_count', 'female_count'] as const).map((field) => (
              <TextField
                key={field}
                value={(field === 'male_count' ? maleCount : femaleCount) ?? ''}
                onChange={(e) => setSplit(field, e.target.value)}
                label={field === 'male_count' ? 'Machos' : 'Hembras'}
                type="number"
                size="small"
                variant="filled"
                disabled={allowed.splitIsFixed}
                inputProps={{ min: 1 }}
                error={!!errors[field] || !!errors.male_count}
                sx={{ ...filledSx, width: 110 }}
              />
            ))}
          </Stack>
        )}
      </Stack>
      {hint && <FormHelperText>{hint}</FormHelperText>}
      {(errors.sex_composition || errors.male_count || errors.female_count) && (
        <FormHelperText error>{errors.sex_composition?.message ?? errors.male_count?.message ?? errors.female_count?.message}</FormHelperText>
      )}
    </Box>
  );
};

export default ExternalSexCompositionField;
