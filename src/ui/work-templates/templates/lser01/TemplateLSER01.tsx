import React from 'react';
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

const ROWS_PER_PAGE = 22;
const TOTAL_PAGES_DEFAULT = 1;

const headCellStyle: React.CSSProperties = {
  border: '1px solid #000',
  backgroundColor: '#f0f0f0',
  padding: '3px 8px',
};

const valueCellStyle: React.CSSProperties = {
  border: '1px solid #000',
  padding: '3px 10px',
  verticalAlign: 'middle',
};

const formatDate = (isoDate: string): string => {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]} / ${match[2]} / ${match[1]}` : '____ / ____ / ________';
};

const HeadLabel: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#000' }) => (
  <Typography variant="caption" sx={{ fontWeight: 900, color, textTransform: 'uppercase', fontSize: '0.58rem', display: 'block' }}>
    {children}
  </Typography>
);

/**
 * LSER-01 printable sheet: single-bull service batch. The bull goes in the highlighted header box
 * and the females are written by hand in the table, one tag per row.
 */
export const TemplateLSER01: React.FC = () => {
  const { template, farm, activeCompany, printAreaRef, activeFarm } = useWorkTemplatePrint();
  const { header } = useLser01Header();

  const displayFarm = activeFarm || farm;
  const code = template?.code || 'LSER-01';
  const pages = Array.from({ length: TOTAL_PAGES_DEFAULT });

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
            {/* Title */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#000', letterSpacing: '-1px', textTransform: 'uppercase', fontSize: '1.4rem' }}>
                  {template?.title || 'Conformación de Lote de Servicio — Toro Único'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#444', fontWeight: 600, mt: -0.5, fontSize: '0.72rem' }}>
                  Movimiento de hacienda al lote de servicio • Genera lote, orden de servicio y movimientos al cargarse
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.65rem', textAlign: 'right' }}>
                DOCUMENTO DE REGISTRO OFICIAL
              </Typography>
            </Box>

            {/* Establishment & template code */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '2px solid #000', color: '#000' }}>
              <tbody>
                <tr>
                  <td style={{ ...headCellStyle, width: '75%' }}>
                    <HeadLabel>Establecimiento ganadero</HeadLabel>
                  </td>
                  <td style={{ ...headCellStyle, backgroundColor: '#000', width: '25%', textAlign: 'center' }}>
                    <HeadLabel color="#fff">Template code</HeadLabel>
                  </td>
                </tr>
                <tr style={{ height: 28 }}>
                  <td style={valueCellStyle}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#000' }}>
                      {`${activeCompany?.name || 'ESTABLECIMIENTO GANADERO'}${displayFarm ? ` • ${displayFarm.name}` : ''}${displayFarm?.renspa ? ` • RENSPA: ${displayFarm.renspa}` : ''}`}
                    </Typography>
                  </td>
                  <td style={{ ...valueCellStyle, textAlign: 'center', backgroundColor: '#fafafa' }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#000', fontFamily: 'monospace', letterSpacing: '1px' }}>
                      {code}
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Batch header: name, bull, dates, responsible */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', border: '2px solid #000', color: '#000' }}>
              <tbody>
                <tr>
                  <td style={{ ...headCellStyle, width: '55%' }}>
                    <HeadLabel>Nombre del lote de servicio</HeadLabel>
                  </td>
                  <td style={{ ...headCellStyle, width: '45%', backgroundColor: '#0f172a' }}>
                    <HeadLabel color="#fff">Caravana del toro (único)</HeadLabel>
                  </td>
                </tr>
                <tr style={{ height: 40 }}>
                  <td style={valueCellStyle}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#002B49' }}>
                      {header.lote || ''}
                    </Typography>
                  </td>
                  <td style={{ ...valueCellStyle, border: '3px solid #000', backgroundColor: '#f8fafc' }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', fontFamily: 'monospace', color: '#000', letterSpacing: '1px' }}>
                      {header.toro_caravana || ''}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td style={headCellStyle}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '50%' }}><HeadLabel>Fecha inicio de servicio</HeadLabel></td>
                          <td style={{ width: '50%' }}><HeadLabel>Fecha fin de servicio</HeadLabel></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={headCellStyle}>
                    <HeadLabel>Responsable / Firma</HeadLabel>
                  </td>
                </tr>
                <tr style={{ height: 30 }}>
                  <td style={valueCellStyle}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '50%' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#002B49' }}>
                              {formatDate(header.planned_start_date)}
                            </Typography>
                          </td>
                          <td style={{ width: '50%' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#002B49' }}>
                              {formatDate(header.planned_end_date)}
                            </Typography>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={valueCellStyle}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#002B49' }}>
                      {header.responsable || ''}
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </table>

            <Box sx={{ border: '1.5px solid #000', bgcolor: '#fffbeb', p: '4px 8px', mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: '#92400e' }}>
                UN SOLO TORO POR PLANILLA • Escribir una caravana de vientre por fila • Todos los vientres de la misma categoría • No incluir vientres preñados
              </Typography>
              <Typography sx={{ fontSize: '0.52rem', color: '#78350f' }}>
                Si alguna fila tiene un problema, el sistema no carga la planilla hasta repararla. El toro debe estar APTO.
              </Typography>
            </Box>

            <Box sx={{ mb: 1.5, pb: 0.5, borderBottom: '1.5px solid #000' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                Vientres que ingresan al lote
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
                {Array.from({ length: ROWS_PER_PAGE }).map((__, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.65rem' }}>
                      {pageIndex * ROWS_PER_PAGE + index + 1}
                    </TableCell>
                    <TableCell />
                    <TableCell />
                  </TableRow>
                ))}
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
                        Firma y Aclaración: Responsable del Lote
                      </Typography>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <Box sx={{ pt: 1, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.65rem' }}>
                Conformación de Lote de Servicio ({code}) • Jhoangel AI Microservice
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
