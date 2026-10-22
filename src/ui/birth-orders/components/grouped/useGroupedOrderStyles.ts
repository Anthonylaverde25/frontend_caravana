import { useTheme } from '@mui/material';

/**
 * The tokens of the grouped view of "Asignar a lote propio" (Proveedor → Lotes), so the birth
 * orders grouped by order and batch read exactly like it.
 */
export function useGroupedOrderStyles() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const headerBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
  const bodyBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9';

  return {
    isDark,
    active: isDark ? '#60a5fa' : '#0a6ed1',
    divider: theme.palette.divider,
    zebraBg: isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa',
    toolbarSx: {
      p: 2,
      mb: 2,
      borderRadius: '8px',
      border: '1px solid',
      borderColor: headerBorder,
      bgcolor: isDark ? '#1e293b' : '#ffffff',
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
    },
    headerCell: {
      py: 1.5,
      px: 1.5,
      fontSize: '0.7rem',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      color: isDark ? '#94a3b8' : '#475569',
      borderBottom: '1px solid',
      borderRight: '1px solid',
      borderColor: headerBorder,
      whiteSpace: 'nowrap' as const,
      letterSpacing: '0.04em',
      bgcolor: isDark ? '#1e293b' : '#f8fafc'
    },
    bodyCell: {
      px: 1.5,
      py: 1.2,
      borderRight: '1px solid',
      borderBottom: '1px solid',
      borderColor: bodyBorder
    },
    captionText: { color: 'text.secondary', fontSize: '0.68rem', display: 'block' }
  };
}
