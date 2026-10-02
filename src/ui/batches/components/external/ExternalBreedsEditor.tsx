import React from 'react';
import { useFieldArray } from 'react-hook-form';
import { Box, Button, FormHelperText, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useBreeds } from '@/features/breeds/hooks/useBreeds';
import { ExternalBatchForm, ExternalFormSection, filledSx } from './externalFormParts';

const MAX_BREEDS = 10;

/**
 * One line per breed, each with its coat when the breed has them ("Angus · Negro"). The coats
 * offered are the ones the breed admits (breed_color). The letter of each line is what a caravan
 * of a multi-breed troop refers to when its DTE is loaded, and what the ING-02 sheet prints.
 */
export const ExternalBreedsEditor: React.FC<{ form: ExternalBatchForm }> = ({ form }) => {
  const { control, watch, setValue, formState } = form;
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ control, name: 'breeds' });
  const { data: breeds = [], isLoading } = useBreeds();
  const lines = watch('breeds') ?? [];

  return (
    <ExternalFormSection title="Razas">
      <Stack spacing={1.25}>
        {fields.map((field, index) => {
          const breedId = lines[index]?.breed_id ?? null;
          const colors = breeds.find((b) => b.id === breedId)?.colors ?? [];
          const lineErrors = errors.breeds?.[index];

          return (
            <Stack key={field.id} direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 28,
                  height: 27,
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
                {String.fromCharCode(65 + index)}
              </Box>
              <TextField
                select
                fullWidth
                label="Raza"
                variant="filled"
                value={breedId ?? ''}
                onChange={(e) => {
                  setValue(`breeds.${index}.breed_id`, Number(e.target.value), {
                    shouldValidate: true
                  });
                  setValue(`breeds.${index}.color_id`, null);
                }}
                error={!!lineErrors?.breed_id}
                helperText={lineErrors?.breed_id?.message ?? (isLoading ? 'Cargando razas…' : undefined)}
                sx={filledSx}
              >
                {breeds.map((breed) => (
                  <MenuItem key={breed.id} value={breed.id}>
                    {breed.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Pelaje"
                variant="filled"
                disabled={breedId == null || colors.length === 0}
                value={lines[index]?.color_id ?? ''}
                onChange={(e) =>
                  setValue(`breeds.${index}.color_id`, e.target.value === '' ? null : Number(e.target.value), { shouldValidate: true })
                }
                error={!!lineErrors?.color_id}
                helperText={
                  lineErrors?.color_id?.message ??
                  (breedId != null && colors.length === 0 ? 'La raza no tiene pelajes cargados' : undefined)
                }
                sx={filledSx}
              >
                <MenuItem value="">
                  <em>Sin declarar</em>
                </MenuItem>
                {colors.map((color) => (
                  <MenuItem key={color.id} value={color.id}>
                    {color.name}
                  </MenuItem>
                ))}
              </TextField>
              <Tooltip title={fields.length === 1 ? 'La tropa tiene al menos una raza' : 'Quitar raza'}>
                <span>
                  <IconButton size="small" disabled={fields.length === 1} onClick={() => remove(index)}>
                    <FuseSvgIcon size={18}>heroicons-outline:trash</FuseSvgIcon>
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          );
        })}

        {errors.breeds?.message && <FormHelperText error>{errors.breeds.message}</FormHelperText>}

        <Box>
          <Button
            size="small"
            disabled={fields.length >= MAX_BREEDS}
            onClick={() => append({ breed_id: null, color_id: null })}
            startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Agregar raza
          </Button>
          {fields.length > 1 && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              Con varias razas, al cargar el DTE se indica la letra de cada caravana.
            </Typography>
          )}
        </Box>
      </Stack>
    </ExternalFormSection>
  );
};

export default ExternalBreedsEditor;
