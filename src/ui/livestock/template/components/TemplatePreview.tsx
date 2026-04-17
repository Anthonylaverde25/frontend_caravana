import React, { forwardRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from '@mui/material';
import { Field } from '../types/template.types';
import PrintHeader from './PrintHeader';

interface TemplatePreviewProps {
  establishment: string;
  cuit: string;
  selectedFields: Field[];
  rowCount: number;
}

const TemplatePreview = forwardRef<HTMLDivElement, TemplatePreviewProps>(({
  establishment,
  cuit,
  selectedFields,
  rowCount
}, ref) => {
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
          p: { xs: 4, md: 8 },
          width: '100%',
          maxWidth: '250mm',
          minHeight: '297mm',
          bgcolor: '#ffffff',
          borderRadius: '4px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          border: '1px solid #d8dde6'
        }}
      >
        {/* Print Header */}
        <PrintHeader establishment={establishment} cuit={cuit} />

        <Table sx={{
          '& .MuiTableCell-root': {
            border: '1px solid #000',
            padding: '4px 8px',
            fontSize: '0.8rem'
          }
        }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
              <TableCell sx={{ width: 30, fontWeight: 800, textAlign: 'center' }}>#</TableCell>
              {selectedFields.map(field => (
                <TableCell key={field.id} sx={{ fontWeight: 800, textTransform: 'uppercase', textAlign: 'center' }}>
                  {field.selectedAlias}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 800, width: 150, textAlign: 'center' }}>OBSERVACIONES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, index) => (
              <TableRow key={index} sx={{ height: 26 }}>
                <TableCell sx={{ color: '#000', textAlign: 'center', fontSize: '0.7rem', fontWeight: 600 }}>{index + 1}</TableCell>
                {selectedFields.map(field => (
                  <TableCell key={field.id}></TableCell>
                ))}
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Print Footer */}
        <Box sx={{ mt: 6, pt: 2, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: '#aaa', fontStyle: 'italic' }}>
            ID Documento: {Math.random().toString(36).substr(2, 9).toUpperCase()} • Sincronizado con Jhoangel AI
          </Typography>
          <Typography variant="caption" sx={{ color: '#aaa', fontWeight: 600 }}>
            HOJA 1 DE 1
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
});

TemplatePreview.displayName = 'TemplatePreview';

export default TemplatePreview;
