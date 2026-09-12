import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';

interface FioriPageHeaderProps {
  onExportReport?: () => void;
  onNewLot?: () => void;
}

export const FioriPageHeader: React.FC<FioriPageHeaderProps> = ({
  onExportReport,
  onNewLot,
}) => {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        px: { xs: 2.5, sm: 3.5 },
        pt: 2,
        pb: 1.5,
      }}
    >
      {/* Breadcrumb Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.72rem', color: 'text.secondary', mb: 1 }}>
        <Typography component="span" sx={{ fontSize: '0.72rem', color: 'text.secondary', cursor: 'pointer', '&:hover': { color: '#0a4d3c', textDecoration: 'underline' } }}>
          Inicio
        </Typography>
        <Typography component="span" sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>/</Typography>
        <Typography component="span" sx={{ fontSize: '0.72rem', color: 'text.secondary', cursor: 'pointer', '&:hover': { color: '#0a4d3c', textDecoration: 'underline' } }}>
          Gestión Ganadera
        </Typography>
        <Typography component="span" sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>/</Typography>
        <Typography component="span" sx={{ fontSize: '0.72rem', color: 'text.primary', fontWeight: 600 }}>
          Tablero de Control
        </Typography>
      </Box>

      {/* Header Title & Main Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.25rem', sm: '1.4rem' },
              }}
            >
              Dashboard Ganadero Integral
            </Typography>
            <Chip
              label="Campaña 2026/2027"
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 22,
                bgcolor: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                borderRadius: '4px',
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem', mt: 0.5 }}>
            Monitoreo consolidado de sanidad, entore reproductivo, faena interna y disponibilidad de pasturas.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
          <Button
            variant="outlined"
            onClick={onExportReport}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.78rem',
              color: 'text.primary',
              borderColor: 'divider',
              borderRadius: '6px',
              px: 2,
              py: 0.7,
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'action.hover', borderColor: 'text.secondary' },
            }}
            startIcon={
              <svg style={{ width: 14, height: 14, color: '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            }
          >
            Exportar Informe
          </Button>
          <Button
            variant="contained"
            onClick={onNewLot}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.78rem',
              color: '#ffffff',
              bgcolor: '#0a4d3c',
              borderRadius: '6px',
              px: 2,
              py: 0.7,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#07382c', boxShadow: 'none' },
            }}
            startIcon={
              <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            }
          >
            Nuevo Registro Lote
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default FioriPageHeader;
