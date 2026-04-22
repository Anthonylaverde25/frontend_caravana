import React from 'react';
import { Box, Typography } from '@mui/material';

interface PrintHeaderProps {
  establishment: string;
  cuit: string;
  renspa: string;
  lote?: string; // Optional if you want to make it dynamic later
}

const PrintHeader: React.FC<PrintHeaderProps> = ({ establishment, cuit, renspa, lote = 'hhhh' }) => {
  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#000', letterSpacing: '-1px', textTransform: 'uppercase' }}>
            Planilla de Campo
          </Typography>
          <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, mt: -0.5 }}>
            Sustentabilidad Ganadera • Procesamiento Inteligente Jhoangel AI
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.7rem' }}>
            DOCUMENTO DE REGISTRO OFICIAL
          </Typography>
        </Box>
      </Box>

      {/* Structured Table for OCR optimization */}
      <Box sx={{ 
        display: 'table', 
        width: '100%', 
        borderCollapse: 'collapse', 
        mb: 4,
        border: '2px solid #000' 
      }}>
        {/* Header Row (Labels) */}
        <Box sx={{ display: 'table-row' }}>
          <Box sx={{ display: 'table-cell', border: '1px solid #000', bgcolor: '#f0f0f0', p: 0.5, width: '30%' }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textAlign: 'center', display: 'block', fontSize: '0.65rem' }}>
              ESTABLECIMIENTO
            </Typography>
          </Box>
          <Box sx={{ display: 'table-cell', border: '1px solid #000', bgcolor: '#f0f0f0', p: 0.5, width: '15%' }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textAlign: 'center', display: 'block', fontSize: '0.65rem' }}>
              LOTE
            </Typography>
          </Box>
          <Box sx={{ display: 'table-cell', border: '1px solid #000', bgcolor: '#f0f0f0', p: 0.5, width: '20%' }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textAlign: 'center', display: 'block', fontSize: '0.65rem' }}>
              CUIT
            </Typography>
          </Box>
          <Box sx={{ display: 'table-cell', border: '1px solid #000', bgcolor: '#f0f0f0', p: 0.5, width: '20%' }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textAlign: 'center', display: 'block', fontSize: '0.65rem' }}>
              RENSPA
            </Typography>
          </Box>
          <Box sx={{ display: 'table-cell', border: '1px solid #000', bgcolor: '#f0f0f0', p: 0.5, width: '15%' }}>
            <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textAlign: 'center', display: 'block', fontSize: '0.65rem' }}>
              FECHA
            </Typography>
          </Box>
        </Box>

        {/* Data Row (Values) */}
        <Box sx={{ display: 'table-row', height: 40 }}>
          <Box sx={{ display: 'table-cell', border: '1px solid #000', px: 1.5, verticalAlign: 'middle' }}>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1rem', color: '#000' }}>
              {establishment || ''}
            </Typography>
          </Box>
          <Box sx={{ display: 'table-cell', border: '1px solid #000', px: 1.5, verticalAlign: 'middle', textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#000' }}>
              {lote}
            </Typography>
          </Box>
          <Box sx={{ display: 'table-cell', border: '1px solid #000', px: 1.5, verticalAlign: 'middle' }}>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1rem', color: '#000' }}>
              {cuit || ''}
            </Typography>
          </Box>
          <Box sx={{ display: 'table-cell', border: '1px solid #000', px: 1.5, verticalAlign: 'middle' }}>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1rem', color: '#000' }}>
              {renspa || ''}
            </Typography>
          </Box>
          <Box sx={{ display: 'table-cell', border: '1px solid #000', px: 1.5, verticalAlign: 'middle', textAlign: 'center' }}>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1rem', color: establishment ? '#000' : '#ddd' }}>
               /   / 
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default PrintHeader;
