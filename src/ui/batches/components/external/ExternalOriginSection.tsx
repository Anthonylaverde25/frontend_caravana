import React, { useState } from 'react';
import { Autocomplete, IconButton, MenuItem, Stack, TextField, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useFarms } from '@/features/suppliers/hooks/useFarms';
import { useCreateFarm } from '@/features/suppliers/hooks/useCreateFarm';
import CreateSupplierDialog from '@/ui/suppliers/components/CreateSupplierDialog';
import AddFarmDialog from '@/ui/suppliers/components/AddFarmDialog';
import { ExternalBatchForm, ExternalFormSection, filledSx } from './externalFormParts';

/**
 * Who sells and from where: the provider and one of its establishments (with its RENSPA,
 * read-only). Both can be created here without leaving the form.
 */
export const ExternalOriginSection: React.FC<{ form: ExternalBatchForm }> = ({ form }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { watch, setValue, formState } = form;
  const { errors } = formState;
  const providerId = watch('provider_id') as number | undefined;
  const farmId = watch('farm_id') as number | undefined;
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useSuppliers();
  const { data: farms = [], isLoading: isLoadingFarms } = useFarms(providerId);
  const createFarm = useCreateFarm();
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [isFarmOpen, setIsFarmOpen] = useState(false);

  const activeSuppliers = suppliers.filter((s) => s.is_active);
  const provider = activeSuppliers.find((s) => s.id === providerId) ?? null;
  const providerFarms = farms.filter((f) => f.provider_id === providerId);
  const farm = providerFarms.find((f) => f.id === farmId);

  const chooseProvider = (id: number | undefined) => {
    setValue('provider_id', id, { shouldValidate: Boolean(id) });
    setValue('farm_id', undefined);
  };

  return (
    <ExternalFormSection title="Origen">
      <Stack direction="row" spacing={0.5} alignItems="flex-start">
        <Autocomplete
          fullWidth
          options={activeSuppliers}
          loading={isLoadingSuppliers}
          value={provider}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={(_, option) => chooseProvider(option?.id)}
          // app-base.css puts every MUI modal at z-index 9999, above the Autocomplete popper
          // (1300): without this the list opens behind the dialog and looks empty.
          slotProps={{ popper: { sx: { zIndex: 10000 } } }}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              {option.name}
              {option.cuit ? ` · ${option.cuit}` : ''}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Proveedor / Vendedor"
              variant="filled"
              required
              error={!!errors.provider_id}
              helperText={errors.provider_id?.message}
              // The Autocomplete pads its filled input more than the theme does: evened out so
              // it is as tall as the other fields.
              sx={{
                ...filledSx,
                '& .MuiFilledInput-root': { ...filledSx['& .MuiFilledInput-root'], pt: 0, pb: 0 },
                '& .MuiFilledInput-root .MuiAutocomplete-input': { py: '4px' }
              }}
            />
          )}
        />
        <Tooltip title="Nuevo proveedor">
          <IconButton size="small" onClick={() => setIsSupplierOpen(true)}>
            <FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction="row" spacing={0.5} alignItems="flex-start">
        <TextField
          select
          fullWidth
          label="Establecimiento"
          variant="filled"
          required
          disabled={!providerId}
          value={farmId ?? ''}
          onChange={(e) =>
            setValue('farm_id', Number(e.target.value), {
              shouldValidate: true
            })
          }
          error={!!errors.farm_id}
          helperText={
            errors.farm_id?.message ??
            (farm ? `RENSPA ${farm.renspa || 'sin declarar'}` : isLoadingFarms && providerId ? 'Cargando establecimientos…' : undefined)
          }
          sx={filledSx}
        >
          {providerFarms.length === 0 && (
            <MenuItem disabled value="">
              El proveedor no tiene establecimientos: crealo con +
            </MenuItem>
          )}
          {providerFarms.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.name}
            </MenuItem>
          ))}
        </TextField>
        <Tooltip title={providerId ? 'Nuevo establecimiento del proveedor' : 'Elegí primero el proveedor'}>
          <span>
            <IconButton size="small" disabled={!providerId} onClick={() => setIsFarmOpen(true)}>
              <FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <CreateSupplierDialog
        open={isSupplierOpen}
        onClose={() => setIsSupplierOpen(false)}
        onSuccess={(created) => {
          const id = created?.id ?? created?.data?.id;

          if (id) chooseProvider(Number(id));
        }}
      />
      <AddFarmDialog
        open={isFarmOpen}
        onClose={() => setIsFarmOpen(false)}
        onAdd={(values) =>
          createFarm.mutate({ ...values, provider_id: providerId } as never, {
            onSuccess: (created: { id?: number } | undefined) => {
              enqueueSnackbar('Establecimiento creado', { variant: 'success' });
              // The hook refreshes the global list only; the select reads the provider's farms.
              queryClient.invalidateQueries({ queryKey: ['farms'] });

              if (created?.id) setValue('farm_id', created.id, { shouldValidate: true });
            },
            onError: (error: unknown) =>
              enqueueSnackbar(
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo crear el establecimiento',
                { variant: 'error' }
              )
          })
        }
      />
    </ExternalFormSection>
  );
};

export default ExternalOriginSection;
