import React from 'react';
import { Box, Typography } from '@mui/material';

interface PrintHeaderProps {
  establishment: string;
  cuit: string;
  renspa: string;
  lote?: string; // Optional if you want to make it dynamic later
  title?: string;
  templateCode?: string;
}

const PrintHeader: React.FC<PrintHeaderProps> = ({ establishment, cuit, renspa, lote = 'hhhh', title = 'Planilla de Campo', templateCode }) => {
  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#000', letterSpacing: '-1px', textTransform: 'uppercase', fontSize: '1.6rem' }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, mt: -0.5, fontSize: '0.75rem' }}>
            Sustentabilidad Ganadera • Procesamiento Inteligente Jhoangel AI
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.65rem', display: 'block' }}>
            DOCUMENTO DE REGISTRO OFICIAL
          </Typography>
        </Box>
      </Box>

      {/* Table 1: ESTABLECIMIENTO & TEMPLATE CODE for OCR isolation */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '12px',
        border: '2px solid #000',
        color: '#000'
      }}>
        <tbody>
          {/* Row 1: Labels */}
          <tr>
            <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '4px 8px', width: templateCode ? '75%' : '100%' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                ESTABLECIMIENTO
              </Typography>
            </td>
            {templateCode && (
              <td style={{ border: '1px solid #000', backgroundColor: '#000000', padding: '4px 8px', width: '25%', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.5px' }}>
                  TEMPLATE CODE
                </Typography>
              </td>
            )}
          </tr>
          {/* Row 2: Values */}
          <tr style={{ height: 32 }}>
            <td style={{ border: '1px solid #000', padding: '4px 12px', verticalAlign: 'middle' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#000' }}>
                {establishment || ''}
              </Typography>
            </td>
            {templateCode && (
              <td style={{ border: '1px solid #000', padding: '4px 12px', verticalAlign: 'middle', textAlign: 'center', backgroundColor: '#fafafa' }}>
                <Typography variant="body1" sx={{ fontWeight: 900, fontSize: '0.95rem', color: '#000', fontFamily: 'monospace', letterSpacing: '1px' }}>
                  {templateCode}
                </Typography>
              </td>
            )}
          </tr>
        </tbody>
      </table>

      {/* Table 2: Secondary parameters for batch and metadata */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px',
        border: '2px solid #000',
        color: '#000'
      }}>
        <tbody>
          {/* Row 1: Secondary Labels */}
          <tr>
            <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '4px 8px', width: '25%' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textAlign: 'center', display: 'block', fontSize: '0.6rem' }}>
                LOTE
              </Typography>
            </td>
            <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '4px 8px', width: '25%' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textAlign: 'center', display: 'block', fontSize: '0.6rem' }}>
                CUIT
              </Typography>
            </td>
            <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '4px 8px', width: '25%' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textAlign: 'center', display: 'block', fontSize: '0.6rem' }}>
                RENSPA
              </Typography>
            </td>
            <td style={{ border: '1px solid #000', backgroundColor: '#f0f0f0', padding: '4px 8px', width: '25%' }}>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#000', textAlign: 'center', display: 'block', fontSize: '0.6rem' }}>
                FECHA
              </Typography>
            </td>
          </tr>
          {/* Row 2: Secondary Values */}
          <tr style={{ height: 32 }}>
            <td style={{ border: '1px solid #000', padding: '4px 12px', verticalAlign: 'middle', textAlign: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#000' }}>
                {lote === 'hhhh' ? '' : lote}
              </Typography>
            </td>
            <td style={{ border: '1px solid #000', padding: '4px 12px', verticalAlign: 'middle' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#000' }}>
                {cuit || ''}
              </Typography>
            </td>
            <td style={{ border: '1px solid #000', padding: '4px 12px', verticalAlign: 'middle' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#000' }}>
                {renspa || ''}
              </Typography>
            </td>
            <td style={{ border: '1px solid #000', padding: '4px 12px', verticalAlign: 'middle', textAlign: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.8rem', color: establishment ? '#000' : '#ddd' }}>
                 /   / 
              </Typography>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default PrintHeader;
