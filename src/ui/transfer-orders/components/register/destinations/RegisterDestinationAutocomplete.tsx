import React from 'react';
import { Autocomplete, Box, TextField, Typography, createFilterOptions } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type {
  RegisterDestinationOption,
  RegisterDestinationsState
} from '../../../hooks/useRegisterDestinations';

type PickerOption = RegisterDestinationOption | { kind: 'create'; name: string };

interface RegisterDestinationAutocompleteProps {
  state: RegisterDestinationsState;
  /** The rows this picker assigns: one animal, or the whole selection. */
  caravanIds: number[];
  /** The option shown as chosen; null for the bulk picker, which always starts empty. */
  value: RegisterDestinationOption | null;
  placeholder: string;
  ariaLabel: string;
}

const labelOf = (option: PickerOption): string =>
  option.kind === 'existing'
    ? option.batch.name
    : option.kind === 'new'
      ? option.destination.name
      : option.name;

const baseFilter = createFilterOptions<PickerOption>({ stringify: labelOf });

/**
 * The destination batch of an animal, searched as you type. Lists the batches of the declared
 * destination activity and the new ones declared here; the last entry creates a new batch in
 * that activity, named with whatever was typed.
 */
export const RegisterDestinationAutocomplete: React.FC<RegisterDestinationAutocompleteProps> = ({
  state,
  caravanIds,
  value,
  placeholder,
  ariaLabel
}) => (
  <Autocomplete<PickerOption>
    size="small"
    fullWidth
    options={state.options}
    value={value}
    disabled={caravanIds.length === 0}
    blurOnSelect
    getOptionLabel={labelOf}
    isOptionEqualToValue={(option, selected) =>
      option.kind === selected.kind &&
      (option.kind === 'existing' && selected.kind === 'existing'
        ? option.batch.id === selected.batch.id
        : option.kind === 'new' && selected.kind === 'new'
          ? option.destination.key === selected.destination.key
          : false)
    }
    filterOptions={(options, params) => {
      const filtered = baseFilter(options, params);
      const typed = params.inputValue.trim();
      const exact = options.some((option) => labelOf(option).toLowerCase() === typed.toLowerCase());

      return [...filtered, ...(exact ? [] : [{ kind: 'create' as const, name: typed }])];
    }}
    onChange={(_, option) => {
      if (!option) {
        if (value) state.unassign(caravanIds);

        return;
      }

      if (option.kind === 'existing') state.assignExisting(caravanIds, option.batch);
      else if (option.kind === 'new') state.assignDeclared(caravanIds, option.destination.key);
      else state.requestCreate(caravanIds, option.name);
    }}
    renderOption={(props, option) => {
      const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key: string };

      return (
        <li key={key} {...rest}>
          {option.kind === 'create' ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 600 }}>
              <FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>
              {option.name ? `Crear lote nuevo «${option.name}»` : 'Crear lote nuevo'}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
              <span>{labelOf(option)}</span>
              <Typography component="span" variant="caption" color="text.secondary">
                {option.kind === 'existing' ? `${option.batch.count} cab.` : 'nuevo'}
              </Typography>
            </Box>
          )}
        </li>
      );
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        placeholder={placeholder}
        inputProps={{ ...params.inputProps, 'aria-label': ariaLabel }}
        sx={{ '& .MuiInputBase-root': { fontSize: '0.8rem', py: '2px !important' } }}
      />
    )}
    noOptionsText="Sin lotes en esta actividad"
    // The cell is narrow; the list is not, so batch names and "Crear lote nuevo" read whole.
    slotProps={{ popper: { sx: { minWidth: 300 }, placement: 'bottom-end' } }}
  />
);

export default RegisterDestinationAutocomplete;
