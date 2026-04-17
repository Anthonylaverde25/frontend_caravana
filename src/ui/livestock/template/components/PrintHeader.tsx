import React from 'react';
import { Box, Typography } from '@mui/material';

interface PrintHeaderProps {
  establishment: string;
  cuit: string;
}

const PrintHeader: React.FC<PrintHeaderProps> = ({ establishment, cuit }) => {
  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#000', letterSpacing: '-0.5px' }}>
            PLANILLA DE CAMPO
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
            Sustentabilidad Ganadera • Procesamiento Inteligente
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#999' }}>FECHA:</Typography>
            <Typography variant="body2" sx={{ borderBottom: '1px solid #000', minWidth: 100 }}>____ / ____ / ________</Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#999' }}>ESTABLECIMIENTO:</Typography>
          <Typography variant="body2" sx={{ borderBottom: '1px solid #000', minWidth: 200, fontWeight: 600 }}>
            {establishment}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#999' }}>CUIT:</Typography>
          <Typography variant="body2" sx={{ borderBottom: '1px solid #000', minWidth: 150, fontWeight: 600 }}>
            {cuit}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#999' }}>RENSPA:</Typography>
          <Typography variant="body2" sx={{ borderBottom: '1px solid #000', minWidth: 150, fontWeight: 600 }}>
            {/* Vacío de momento */}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default PrintHeader;
