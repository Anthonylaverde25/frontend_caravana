import React from 'react';
import { Box, FormHelperText, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import type { UseFormReturn } from 'react-hook-form';
import type { ExternalBatchFormInput, ExternalBatchFormValues } from './externalBatchSchema';

export type ExternalBatchForm = UseFormReturn<ExternalBatchFormInput, unknown, ExternalBatchFormValues>;

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
    <Stack spacing={3}>{children}</Stack>
  </Box>
);

interface YesNoFieldProps {
  label: string;
  hint?: string;
  value: boolean | null | undefined;
  onChange: (value: boolean) => void;
  error?: string;
}

/**
 * A yes/no fact with no default: nothing is marked until the user answers, so the system never
 * states "no" on behalf of somebody who was not asked.
 */
export const YesNoField: React.FC<YesNoFieldProps> = ({ label, hint, value, onChange, error }) => (
  <Box>
    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
      {label}
    </Typography>
    {hint && (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.68rem' }}>
        {hint}
      </Typography>
    )}
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value === true ? 'yes' : value === false ? 'no' : null}
      onChange={(_, next: 'yes' | 'no' | null) => next && onChange(next === 'yes')}
      sx={{ mt: 0.5 }}
    >
      <ToggleButton value="yes" sx={{ px: 2, textTransform: 'none', fontWeight: 700 }}>
        Sí
      </ToggleButton>
      <ToggleButton value="no" sx={{ px: 2, textTransform: 'none', fontWeight: 700 }}>
        No
      </ToggleButton>
    </ToggleButtonGroup>
    {error && <FormHelperText error>{error}</FormHelperText>}
  </Box>
);
