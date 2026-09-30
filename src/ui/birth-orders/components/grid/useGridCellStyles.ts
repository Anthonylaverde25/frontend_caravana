import { useTheme } from '@mui/material/styles';

/**
 * The spreadsheet look of the bulk birth entry: borderless inputs inside bordered cells, the focus
 * and the error drawn as an inset ring so the grid never shifts.
 */
export function useGridCellStyles() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const cellSx = {
    p: 0,
    borderRight: 1,
    borderBottom: 1,
    borderColor: theme.palette.divider,
    '&:last-child': { borderRight: 0 }
  } as const;

  const inputSx = {
    '& .MuiInputBase-root': {
      borderRadius: 0,
      fontSize: '0.85rem',
      backgroundColor: 'transparent',
      height: '40px',
      color: theme.palette.text.primary,
      '&:hover': { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' },
      '&.Mui-focused': { backgroundColor: theme.palette.background.paper, boxShadow: `inset 0 0 0 2px ${theme.palette.primary.main}`, zIndex: 1 },
      '&.Mui-error': { boxShadow: `inset 0 0 0 2px ${theme.palette.error.main}` },
      '&.Mui-disabled': { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f6f7f8' }
    },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    '& input': { padding: '8px 10px' }
  } as const;

  const headerBg = isDark ? theme.palette.background.default : '#f8f9fa';
  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.015)';

  return { theme, isDark, cellSx, inputSx, headerBg, zebraBg };
}
