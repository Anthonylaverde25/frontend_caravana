import { alpha, useTheme } from '@mui/material/styles';

/**
 * The spreadsheet look shared by every data grid of the full-screen entries, taken from the
 * reception of "Recibir y registrar caravanas": borderless inputs inside bordered cells, the focus
 * and the error drawn as an inset ring so the grid never shifts, a single compact header row.
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
  const groupBg = isDark ? 'rgba(255, 255, 255, 0.06)' : '#eef2ef';
  const selectedBg = alpha(theme.palette.primary.main, 0.06);

  /** A column title: one row, sentence case, compact. */
  const headSx = { ...cellSx, bgcolor: headerBg, fontWeight: 700, px: 1.25, py: 1, fontSize: '0.74rem', color: theme.palette.text.primary } as const;
  /** The row number (or the row checkbox) on the left, grey like the header. */
  const indexSx = { ...cellSx, bgcolor: headerBg, color: theme.palette.text.disabled, fontSize: '0.72rem', width: 44, textAlign: 'center', verticalAlign: 'middle', px: 0.5 } as const;
  /** A read-only value, the height of an input cell. */
  const textCellSx = { ...cellSx, px: 1.25, height: 40, fontSize: '0.85rem' } as const;
  /** The ring of a cell the server objected to. */
  const errorRing = { boxShadow: `inset 0 0 0 2px ${theme.palette.error.main}` } as const;

  return { theme, isDark, cellSx, inputSx, headerBg, zebraBg, groupBg, selectedBg, headSx, indexSx, textCellSx, errorRing };
}
