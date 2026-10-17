import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from '@mui/material';
import { useWorkTemplatePrint } from '@/contexts/WorkTemplatePrintContext';
import { useLser01Header } from './Lser01HeaderContext';
import { useLser01Roster } from './useLser01Roster';
import Lser01SheetHeader from './Lser01SheetHeader';

const ROWS_PER_PAGE = 22;
/** Free lines after the pre-printed females, for the ones that turn up at the chute. */
const FREE_ROWS = 6;

/**
 * LSER-01 printable sheet: service start record over an existing Cría batch. The bull goes in the
 * highlighted header box; the females of the batch come pre-printed, one per row, followed by free
 * lines with the same grid for the ones that turn up at the chute.
 */
export const TemplateLSER01: React.FC = () => {
  const { template, farm, activeCompany, printAreaRef, activeFarm, batchId, batch: contextBatch } = useWorkTemplatePrint();
  const { header, setHeaderField } = useLser01Header();
  const { females } = useLser01Roster(header.lote_id);

  // Printed from a batch (?batchId=): that batch is the one entering service.
  useEffect(() => {
    if (header.lote_id === null && batchId && contextBatch) {
      setHeaderField('lote_id', batchId);
      setHeaderField('lote', contextBatch.name);
    }
  }, [batchId, contextBatch, header.lote_id, setHeaderField]);

  const displayFarm = activeFarm || farm;
  const code = template?.code || 'LSER-01';
  const establishment = `${activeCompany?.name || 'ESTABLECIMIENTO GANADERO'}${displayFarm ? ` • ${displayFarm.name}` : ''}${displayFarm?.renspa ? ` • RENSPA: ${displayFarm.renspa}` : ''}`;
  const totalRows = Math.max(ROWS_PER_PAGE, Math.ceil((females.length + FREE_ROWS) / ROWS_PER_PAGE) * ROWS_PER_PAGE);
  const pages = Array.from({ length: totalRows / ROWS_PER_PAGE });

  return (
    <Box
      ref={printAreaRef}
      sx={{ width: '210mm', maxWidth: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {pages.map((_, pageIndex) => (
        <Paper
          key={pageIndex}
          className="print-page"
          elevation={0}
          sx={{
            p: '10mm',
            width: '210mm',
            maxWidth: '100%',
            mx: 'auto',
            minHeight: '297mm',
            bgcolor: '#ffffff',
            borderRadius: '4px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
            border: '1px solid #d8dde6',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            '@media print': {
              boxShadow: 'none',
              border: 'none',
              borderRadius: 0,
              p: '10mm',
              margin: 0,
              minHeight: '297mm',
              height: '297mm',
            },
          }}
        >
          <Box>
            <Lser01SheetHeader
              title={template?.title || 'Acta de Inicio de Servicio — Toro Único'}
              code={code}
              establishment={establishment}
              header={header}
            />

            <Box sx={{ mb: 1.5, pb: 0.5, borderBottom: '1.5px solid #000' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                Vientres del lote en servicio
              </Typography>
            </Box>

            <Table
              sx={{
                borderCollapse: 'collapse',
                width: '100%',
                '& .MuiTableCell-root': {
                  border: '1px solid #000',
                  padding: '3px 6px',
                  fontSize: '0.68rem',
                  color: '#000',
                  height: 26,
                  boxSizing: 'border-box',
                },
              }}
            >
              <TableHead>
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  <TableCell sx={{ width: '6%', fontWeight: 800, textAlign: 'center' }}>#</TableCell>
                  <TableCell sx={{ width: '34%', fontWeight: 800, textTransform: 'uppercase' }}>Caravana del vientre</TableCell>
                  <TableCell sx={{ width: '60%', fontWeight: 800, textTransform: 'uppercase' }}>Observaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: ROWS_PER_PAGE }).map((__, index) => {
                  const rowIndex = pageIndex * ROWS_PER_PAGE + index;
                  const female = females[rowIndex];
                  return (
                    <TableRow key={index}>
                      <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.65rem' }}>
                        {rowIndex + 1}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.75rem' }}>
                        {female?.identification ?? ''}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>

          {/* Signatures & footer */}
          <Box sx={{ mt: 2 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '1.5px solid #000', color: '#000' }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '10px 12px 4px 12px', width: '50%', height: 44, verticalAlign: 'bottom' }}>
                    <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.6rem' }}>
                        Firma y Aclaración: Encargado de Manga
                      </Typography>
                    </div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '10px 12px 4px 12px', width: '50%', height: 44, verticalAlign: 'bottom' }}>
                    <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.6rem' }}>
                        Firma y Aclaración: Responsable del Servicio
                      </Typography>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <Box sx={{ pt: 1, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.65rem' }}>
                Acta de Inicio de Servicio ({code}) • Jhoangel AI Microservice
              </Typography>
              <Typography variant="caption" sx={{ color: '#333', fontWeight: 700, fontSize: '0.65rem' }}>
                HOJA {pageIndex + 1} DE {pages.length}
              </Typography>
            </Box>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default TemplateLSER01;
