import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useSnackbar } from 'notistack';

export const FioriFooterBar: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        px: { xs: 2, sm: 3.5 },
        py: 1.25,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 1,
        fontSize: '0.72rem',
        color: 'text.secondary',
        mt: 'auto',
      }}
    >
      {/* Left: Connection Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#10b981',
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
            }}
          />
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
            Conectado a SAP Gateway S/4HANA Ganadería
          </Typography>
        </Box>
        <Typography sx={{ color: 'text.disabled', display: { xs: 'none', sm: 'inline' } }}>|</Typography>
        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
          ID Servidor: PRD-AGRO-01
        </Typography>
      </Box>

      {/* Right: Quick Links */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          onClick={() => enqueueSnackbar('Abriendo manual de operaciones SAP Ganadería...', { variant: 'info' })}
          sx={{
            textTransform: 'none',
            fontSize: '0.72rem',
            color: 'text.secondary',
            py: 0.25,
            px: 1,
            '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
          }}
        >
          Ayuda del Sistema
        </Button>
        <Button
          size="small"
          onClick={() => enqueueSnackbar('Consultando registros de auditoría RFC/ODATA...', { variant: 'info' })}
          sx={{
            textTransform: 'none',
            fontSize: '0.72rem',
            color: 'text.secondary',
            py: 0.25,
            px: 1,
            '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
          }}
        >
          Registros de Auditoría
        </Button>
      </Box>
    </Box>
  );
};

export default FioriFooterBar;
