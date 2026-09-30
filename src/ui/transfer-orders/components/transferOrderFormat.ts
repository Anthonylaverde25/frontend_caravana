import { useTheme } from '@mui/material';

/** Cell metrics of the canonical datatable (TransferAnimalsTable / pre-service). */
/**
 * Cell metrics of the canonical datatable (/batches/external-assignment): grouped header row
 * over the column row, uppercase 0.7rem headers, 0.78rem two-line body cells.
 */
export const useTransferOrderTableStyles = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const headBg = isDark ? '#1e293b' : '#f8fafc';
  const border = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

  return {
    isDark,
    headerCell: {
      py: 1.5,
      px: 1.5,
      fontSize: '0.7rem',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      color: isDark ? '#94a3b8' : '#475569',
      borderBottom: '1px solid',
      borderRight: '1px solid',
      borderColor: border,
      whiteSpace: 'nowrap' as const,
      letterSpacing: '0.04em',
      bgcolor: headBg
    },
    groupCell: {
      py: 1,
      fontSize: '0.7rem',
      fontWeight: 800,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.04em',
      color: isDark ? '#94a3b8' : '#475569',
      bgcolor: headBg,
      borderBottom: '1px solid',
      borderRight: '1px solid',
      borderColor: border
    },
    bodyCell: {
      px: 1.5,
      py: 1.2,
      fontSize: '0.78rem',
      borderRight: '1px solid',
      borderBottom: '1px solid',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9'
    },
    /** First line of a two-line cell. */
    primaryText: { fontWeight: 700, fontSize: '0.78rem', color: 'text.primary', lineHeight: 1.3 },
    /** Second line of a two-line cell. */
    captionText: { color: 'text.secondary', fontSize: '0.68rem', display: 'block' },
    headBg,
    zebraBg: isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa',
    border
  };
};

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';

  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (match) return `${match[3]}/${match[2]}/${match[1]}`;

  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (iso: string | null | undefined): string =>
  iso ? new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
