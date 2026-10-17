import { Theme } from '@mui/material/styles';

/** Grid lines and tones shared by the cells of the cage sheet, so it reads like a spreadsheet. */
export const sheetCellSx = (theme: Theme) => ({
  p: 0,
  height: 36,
  border: `1px solid ${theme.palette.divider}`,
  fontSize: '0.85rem',
});

export const sheetHeadSx = (theme: Theme) => ({
  ...sheetCellSx(theme),
  px: 1.25,
  fontWeight: 700,
  fontSize: '0.72rem',
  textTransform: 'uppercase' as const,
  letterSpacing: 0.4,
  color: theme.palette.text.secondary,
  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc',
});

export const sheetIndexSx = (theme: Theme) => ({
  ...sheetHeadSx(theme),
  width: 56,
  textAlign: 'center' as const,
});
