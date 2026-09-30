import type { TextFieldProps } from '@mui/material';

/** The filled select every field of the dialog shares, as in SelectExistingBatchDialog. */
export const transferSelectFieldProps: Partial<TextFieldProps> = {
  select: true,
  variant: 'filled',
  size: 'small',
  fullWidth: true,
  sx: { bgcolor: 'action.hover', '& .MuiFilledInput-root': { borderRadius: '6px' } },
  SelectProps: {
    MenuProps: { PaperProps: { sx: { maxHeight: 280, borderRadius: '6px', boxShadow: 3 } } }
  }
};

export const headCountLabel = (count: number) => `${count} cab.`;
