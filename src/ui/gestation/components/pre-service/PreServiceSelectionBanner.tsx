import React from 'react';
import { Paper, Stack, Typography, Button, Box, useTheme, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface PreServiceSelectionBannerProps {
  selectedCount: number;
  onStartSerialEvaluation: () => void;
  onClearSelection: () => void;
}

export const PreServiceSelectionBanner: React.FC<PreServiceSelectionBannerProps> = ({
  selectedCount,
  onStartSerialEvaluation,
  onClearSelection,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (selectedCount === 0) return null;

  const primaryColor = isDark ? '#60a5fa' : '#0a6ed1';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        px: 2.5,
        borderRadius: '8px',
        bgcolor: isDark ? alpha(primaryColor, 0.15) : alpha(primaryColor, 0.08),
        border: '1px solid',
        borderColor: isDark ? alpha(primaryColor, 0.3) : alpha(primaryColor, 0.25),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        animation: 'fadeIn 0.2s ease-in-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(-4px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: primaryColor,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
        >
          {selectedCount}
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
            {selectedCount === 1 ? '1 toro seleccionado' : `${selectedCount} toros seleccionados`} para manga
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Listos para carga masiva en planilla de evaluación andrológica
          </Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={1.5} alignItems="center">
        <Button
          size="small"
          onClick={onClearSelection}
          sx={{
            textTransform: 'none',
            fontSize: '0.8rem',
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
        >
          Limpiar selección
        </Button>

        <Button
          variant="contained"
          size="small"
          onClick={onStartSerialEvaluation}
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:table-cells</FuseSvgIcon>}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '6px',
            px: 2,
            py: 0.75,
            bgcolor: primaryColor,
            '&:hover': {
              bgcolor: isDark ? '#3b82f6' : '#0854a0',
            },
          }}
        >
          Abrir Planilla de Manga ({selectedCount})
        </Button>
      </Stack>
    </Paper>
  );
};

export default PreServiceSelectionBanner;
