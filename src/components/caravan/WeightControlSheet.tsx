import React, { forwardRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  alpha
} from '@mui/material';

interface WeightControlSheetProps {
  batchName: string;
  establishment: string;
  cuit: string;
  renspa: string;
  caravans: any[];
}

const WeightControlSheet = forwardRef<HTMLDivElement, WeightControlSheetProps>(({
  batchName,
  establishment,
  cuit,
  renspa,
  caravans
}, ref) => {
  const currentDate = new Date().toLocaleDateString('es-AR');

  return (
    <Box sx={{
      flexGrow: 1,
      bgcolor: '#edf2f6',
      p: { xs: 2, md: 4 },
      borderRadius: '12px',
      minHeight: '80vh',
      display: 'flex',
      justifyContent: 'center',
      border: '1px solid #d8dde6',
      overflowX: 'auto',
      width: '100%',
      backgroundImage: 'radial-gradient(#d8dde6 0.5px, transparent 0.5px)',
      backgroundSize: '20px 20px',
    }}>
      <Paper
        ref={ref}
        className="print-area"
        elevation={0}
        sx={{
          p: { xs: 4, md: 6 },
          width: '100%',
          maxWidth: '210mm', // A4 Width
          minHeight: '297mm',
          bgcolor: '#ffffff',
          borderRadius: '4px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          border: '1px solid #d8dde6'
        }}
      >
        {/* Professional Header Section */}
        <Box sx={{ mb: 4, borderBottom: '2px solid #000', pb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -1, color: '#000', mb: 3, textAlign: 'center', textTransform: 'uppercase' }}>
            PLANILLA DE CONTROL DE PESO
          </Typography>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
            border: '2px solid #000',
            '& > div': {
              borderRight: '1px solid #000',
              p: 1.5,
              '&:last-child': { borderRight: 0 }
            }
          }}>
            <Box>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Establecimiento</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{establishment || '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Lote / Grupo</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{batchName}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Fecha de Trabajo</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{currentDate}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Data Table */}
        <Table sx={{
          border: '2px solid #000',
          '& .MuiTableCell-root': {
            border: '1px solid #000',
            padding: '8px 12px',
            color: '#000'
          }
        }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ width: 40, fontWeight: 900, textAlign: 'center' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 900, fontSize: '0.9rem' }}>IDENTIFICADOR (CARAVANA)</TableCell>
              <TableCell sx={{ width: 150, fontWeight: 900, textAlign: 'right', fontSize: '0.9rem' }}>PESO ACTUAL</TableCell>
              <TableCell sx={{ width: 180, fontWeight: 900, textAlign: 'center', fontSize: '0.9rem', bgcolor: alpha('#000', 0.05) }}>PESO NUEVO (kg)</TableCell>
              <TableCell sx={{ fontWeight: 900, fontSize: '0.9rem' }}>OBSERVACIONES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {caravans.map((caravan, index) => (
              <TableRow key={caravan.id} sx={{ height: 45 }}>
                <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', color: '#666' }}>{index + 1}</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '1rem' }}>{caravan.identification}</TableCell>
                <TableCell sx={{ textAlign: 'right', fontWeight: 700, fontSize: '0.95rem' }}>
                  {caravan.current_weight ? `${caravan.current_weight.toLocaleString()} kg` : '-'}
                </TableCell>
                <TableCell sx={{ bgcolor: alpha('#000', 0.02) }}></TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
            {/* Empty rows if batch is small to fill the page */}
            {caravans.length < 15 && Array.from({ length: 15 - caravans.length }).map((_, i) => (
              <TableRow key={`empty-${i}`} sx={{ height: 45 }}>
                <TableCell sx={{ textAlign: 'center', color: '#ccc' }}>{caravans.length + i + 1}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell sx={{ bgcolor: alpha('#000', 0.02) }}></TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Professional Footer */}
        <Box sx={{ mt: 'auto', pt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Box sx={{ border: '2px solid #000', px: 3, py: 1, textAlign: 'right', minWidth: 200 }}>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, textTransform: 'uppercase' }}>Total Animales en Planilla</Typography>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>{caravans.length}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ width: '45%', borderTop: '1px solid #000', textAlign: 'center', mt: 8 }}>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>FIRMA RESPONSABLE DE CAMPO</Typography>
            </Box>
            <Box sx={{ width: '45%', borderTop: '1px solid #000', textAlign: 'center', mt: 8 }}>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>FIRMA VETERINARIO / TÉCNICO</Typography>
            </Box>
          </Box>

          <Box sx={{ bgcolor: '#f9f9f9', p: 1.5, border: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>
              Documento generado por Jhoangel AI Management System • {new Date().toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: '#999', fontWeight: 800 }}>
              VERSIÓN 2.0 - CONTROL DE PESO
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body { background: white !important; }
          .print-area { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 !important; 
            padding: 0 !important;
            width: 100% !important;
            max-width: none !important;
          }
          .no-print { display: none !important; }
        }
      `}} />
    </Box>
  );
});

WeightControlSheet.displayName = 'WeightControlSheet';

export default WeightControlSheet;
