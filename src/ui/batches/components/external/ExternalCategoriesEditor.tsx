import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { Box, Button, FormHelperText, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { ExternalBatchForm, filledSx } from './externalFormParts';
import { headCountOf } from './externalBatchSchema';

const MAX_CATEGORIES = 10;

/**
 * One line per category bought, each with its head ("6 Novillito", "5 Vaquillona"); the head of
 * the troop is their sum. The number of each line is what a received caravan refers to (CAT) when
 * its sex admits more than one of the categories.
 */
export const ExternalCategoriesEditor: React.FC<{ form: ExternalBatchForm }> = ({ form }) => {
  const { control, watch, setValue, register, formState } = form;
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ control, name: 'categories' });
  const { data: categories = [], isLoading } = useAnimalCategories();
  const lines = watch('categories') ?? [];
  const total = headCountOf(lines);

  return (
    <Stack spacing={1.25}>
      {fields.map((field, index) => {
        const lineErrors = errors.categories?.[index];
        const taken = new Set(lines.filter((_, i) => i !== index).map((line) => line.category_id));

        return (
          <Stack key={field.id} direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 28,
                height: 27,
                mt: 1.5,
                flexShrink: 0,
                borderRadius: '6px',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontFamily: 'monospace'
              }}
            >
              {index + 1}
            </Box>
            <TextField
              select
              fullWidth
              label="Categoría"
              variant="filled"
              required
              value={lines[index]?.category_id ?? ''}
              onChange={(e) => setValue(`categories.${index}.category_id`, Number(e.target.value), { shouldValidate: true })}
              error={!!lineErrors?.category_id}
              helperText={lineErrors?.category_id?.message ?? (isLoading ? 'Cargando categorías…' : undefined)}
              sx={{ ...filledSx, flex: 2 }}
            >
              {categories.map((option) => (
                <MenuItem key={option.id} value={option.id} disabled={taken.has(option.id)}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              {...register(`categories.${index}.head_count`)}
              label="Cabezas"
              type="number"
              variant="filled"
              required
              inputProps={{ min: 1 }}
              error={!!lineErrors?.head_count}
              helperText={lineErrors?.head_count?.message}
              sx={{ ...filledSx, flex: 1 }}
            />
            <Tooltip title={fields.length === 1 ? 'La tropa tiene al menos una categoría' : 'Quitar categoría'}>
              <span>
                <IconButton size="small" disabled={fields.length === 1} onClick={() => remove(index)} sx={{ mt: 1.5 }}>
                  <FuseSvgIcon size={18}>heroicons-outline:trash</FuseSvgIcon>
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      })}

      {errors.categories?.message && <FormHelperText error>{errors.categories.message}</FormHelperText>}

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Button
          size="small"
          disabled={fields.length >= MAX_CATEGORIES}
          onClick={() => append({ category_id: null, head_count: null })}
          startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Agregar categoría
        </Button>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Total: {total} {total === 1 ? 'cabeza' : 'cabezas'}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default ExternalCategoriesEditor;
