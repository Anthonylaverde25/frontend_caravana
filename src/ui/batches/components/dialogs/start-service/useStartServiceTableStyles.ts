import { useTheme, alpha } from '@mui/material';

/**
 * Custom hook providing design tokens and cell metrics strictly matching
 * the canonical datatable pattern of /batches/external-assignment.
 */
export const useStartServiceTableStyles = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const headBg = isDark ? '#1e293b' : '#f8fafc';
  const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';
  const headerBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
  const bodyBorder = isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9';
  const active = isDark ? '#60a5fa' : '#0a6ed1';
  const selectedRowBg = isDark ? 'rgba(99, 102, 241, 0.22)' : '#e0e7ff';

  const headerCellStyle = {
    py: 1.2,
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
    bgcolor: headBg,
  };

  const groupCellStyle = {
    py: 0.9,
    px: 1.5,
    fontSize: '0.7rem',
    fontWeight: 800,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    color: isDark ? '#94a3b8' : '#475569',
    bgcolor: headBg,
    borderBottom: '1px solid',
    borderRight: '1px solid',
    borderColor: headerBorder,
  };

  const bodyCellStyle = {
    px: 1.5,
    py: 1.1,
    fontSize: '0.78rem',
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderColor: bodyBorder,
  };

  return {
    theme,
    isDark,
    headBg,
    zebraBg,
    headerBorder,
    bodyBorder,
    active,
    selectedRowBg,
    headerCellStyle,
    groupCellStyle,
    bodyCellStyle,
    tintedGroupCellStyle: {
      ...groupCellStyle,
      bgcolor: alpha(theme.palette.primary.main, isDark ? 0.09 : 0.06),
      color: 'primary.main',
    },
    primaryText: {
      fontWeight: 700,
      fontSize: '0.78rem',
      color: 'text.primary',
      lineHeight: 1.3,
    },
    captionText: {
      color: 'text.secondary',
      fontSize: '0.68rem',
      display: 'block',
    },
  };
};
