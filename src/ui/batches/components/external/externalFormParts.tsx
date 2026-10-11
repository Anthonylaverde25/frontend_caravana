import React, { useEffect, useState } from 'react';
import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { UseFormReturn } from 'react-hook-form';
import type { ExternalBatchFormInput, ExternalBatchFormValues } from './externalBatchSchema';

export type ExternalBatchForm = UseFormReturn<ExternalBatchFormInput, unknown, ExternalBatchFormValues>;

/** Whether any of these values is filled in, so an optional group that holds one stays open. */
export const hasValue = (...values: unknown[]): boolean => values.some((value) => value !== '' && value != null);

/**
 * Empties optional fields when their group is hidden. A hidden field must not keep a value, or a
 * wrong one would block the purchase without the user seeing it.
 */
export const clearFields = (form: ExternalBatchForm, names: (keyof ExternalBatchFormInput)[]) => {
  names.forEach((name) => form.setValue(name, null as never));
  form.clearErrors(names);
};

/**
 * The filled input of "Alta Rápida de Lote" (CreateBatchDialog). The tint goes on the input itself,
 * not on the whole field, so the helper text under it keeps the paper's background.
 */
export const filledSx = { '& .MuiFilledInput-root': { bgcolor: 'action.hover' } } as const;

export const kgAdornment = (
  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', ml: 1 }}>
    KG
  </Typography>
);

interface ExternalFormSectionProps {
  title: string;
  /** Something to place at the right of the title, such as a mode toggle. */
  action?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A group of fields under a short label. The quick batch dialog is one plain column; this form is
 * longer, so its groups are only named, without changing the column.
 */
export const ExternalFormSection: React.FC<ExternalFormSectionProps> = ({ title, action, children }) => (
  <Box component="section">
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 1.5, minHeight: 28 }}>
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary' }}>{title}</Typography>
      {action}
    </Stack>
    <Stack spacing={2.5}>{children}</Stack>
  </Box>
);

interface OptionalGroupProps {
  /** The link that shows the group, such as "+ Rango de edad". */
  addLabel: string;
  /** Whether the group holds a value or an error. It opens by itself when it does. */
  filled: boolean;
  /** Empties the group's fields when it is hidden again. */
  onClear: () => void;
  children: React.ReactNode;
}

/**
 * An optional group of fields, hidden until the user asks for it. Opens by itself when it already
 * holds a value (a draft being edited) or an error, so nothing filled in is ever out of sight.
 */
export const OptionalGroup: React.FC<OptionalGroupProps> = ({ addLabel, filled, onClear, children }) => {
  const [open, setOpen] = useState(filled);

  useEffect(() => {
    if (filled) setOpen(true);
  }, [filled]);

  if (!open) {
    return (
      <Button
        size="small"
        onClick={() => setOpen(true)}
        startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
        sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}
      >
        {addLabel}
      </Button>
    );
  }

  return (
    <Stack spacing={2.5}>
      {children}
      <Button
        size="small"
        color="inherit"
        onClick={() => {
          onClear();
          setOpen(false);
        }}
        startIcon={<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>}
        sx={{ alignSelf: 'flex-end', textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
      >
        Quitar
      </Button>
    </Stack>
  );
};

interface YesNoFieldProps {
  label: string;
  hint?: string;
  value: boolean | null | undefined;
  onChange: (value: boolean) => void;
  error?: string;
  sx?: object;
}

/**
 * A yes/no select field with filled styling and helper text hint.
 */
export const YesNoField: React.FC<YesNoFieldProps> = ({ label, hint, value, onChange, error, sx }) => (
  <TextField
    select
    fullWidth
    label={label}
    variant="filled"
    required
    value={value === true ? 'true' : value === false ? 'false' : ''}
    onChange={(e) => {
      const val = e.target.value;
      if (val === 'true') onChange(true);
      else if (val === 'false') onChange(false);
    }}
    error={!!error}
    helperText={error ?? hint}
    sx={{ ...filledSx, ...sx }}
  >
    <MenuItem value="" disabled>
      <em>Seleccionar…</em>
    </MenuItem>
    <MenuItem value="true">Sí</MenuItem>
    <MenuItem value="false">No</MenuItem>
  </TextField>
);
