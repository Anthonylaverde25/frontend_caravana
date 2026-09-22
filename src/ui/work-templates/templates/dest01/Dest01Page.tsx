import React from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { Dest01PrintCalf, Dest01PrintHeader } from './Dest01PrintContext';

const WEANING_TYPES = ['TRADICIONAL', 'ANTICIPADO', 'PRECOZ'];

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

const valueSx = { fontWeight: 700, fontSize: '0.8rem', color: '#002B49' } as const;

const formatDate = (isoDate: string): string => {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]} / ${match[2]} / ${match[1]}` : '____ / ____ / ________';
};

const HeadLabel: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#000' }) => (
  <Typography variant="caption" sx={{ fontWeight: 900, color, textTransform: 'uppercase', fontSize: '0.58rem', display: 'block' }}>
    {children}
  </Typography>
);

export interface Dest01PageProps {
  code: string;
  title: string;
  establishment: string;
  header: Dest01PrintHeader;
  /** Pre-loaded calves of this page, followed by `blankRows` empty lines. */
  calves: Dest01PrintCalf[];
  blankRows: number;
  firstRowNumber: number;
  /** Page N of M; null prints the box empty to be filled by hand. */
  pageNumber: number | null;
  pageTotal: number | null;
}

/**
 * One A4 page of the DEST-01 sheet, homologated to LSER-01. The header is repeated on every page,
 * so a page separated from the rest can still be identified when scanned.
 */
export const Dest01Page: React.FC<Dest01PageProps> = ({
  code,
  title,
  establishment,
  header,
  calves,
  blankRows,
  firstRowNumber,
  pageNumber,
  pageTotal,
}) => {
  const lines: (Dest01PrintCalf | null)[] = [...calves, ...Array.from({ length: blankRows }, () => null)];

  return (
    <Paper
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
        '@media print': { boxShadow: 'none', border: 'none', borderRadius: 0, p: '10mm', m: 0, minHeight: '297mm', height: '297mm' },
      }}
    >
      <Box>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#000', letterSpacing: '-1px', textTransform: 'uppercase', fontSize: '1.4rem' }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#444', fontWeight: 600, mt: -0.5, fontSize: '0.72rem' }}>
              Desmadre de crías al pie • Al cargarse destina las crías al lote de destete y registra sus movimientos
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.65rem', textAlign: 'right' }}>
            DOCUMENTO DE REGISTRO OFICIAL
          </Typography>
        </Box>

        {/* Establishment, template code and page box */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '2px solid #000', color: '#000' }}>
          <tbody>
            <tr>
              <td style={{ ...headCellStyle, width: '58%' }}><HeadLabel>Establecimiento ganadero</HeadLabel></td>
              <td style={{ ...headCellStyle, backgroundColor: '#000', width: '20%', textAlign: 'center' }}><HeadLabel color="#fff">Template code</HeadLabel></td>
              <td style={{ ...headCellStyle, width: '22%', textAlign: 'center' }}><HeadLabel>Hoja N de M</HeadLabel></td>
            </tr>
            <tr style={{ height: 28 }}>
              <td style={valueCellStyle}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#000' }}>{establishment}</Typography>
              </td>
              <td style={{ ...valueCellStyle, textAlign: 'center', backgroundColor: '#fafafa' }}>
                <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#000', fontFamily: 'monospace', letterSpacing: '1px' }}>{code}</Typography>
              </td>
              <td style={{ ...valueCellStyle, textAlign: 'center', border: '2px solid #000' }}>
                <Typography sx={{ fontWeight: 900, fontSize: '0.9rem', color: '#000', fontFamily: 'monospace' }}>
                  HOJA {pageNumber ?? '___'} DE {pageTotal ?? '___'}
                </Typography>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Weaning header */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', border: '2px solid #000', color: '#000' }}>
          <tbody>
            <tr>
              <td style={{ ...headCellStyle, width: '55%', backgroundColor: '#0f172a' }}>
                <HeadLabel color="#fff">Lote de destete (nombre: existente o nuevo)</HeadLabel>
              </td>
              <td style={{ ...headCellStyle, width: '45%' }}><HeadLabel>Fecha de destete</HeadLabel></td>
            </tr>
            <tr style={{ height: 40 }}>
              <td style={{ ...valueCellStyle, border: '3px solid #000', backgroundColor: '#f8fafc' }}>
                <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: '#000' }}>{header.lote_destete}</Typography>
              </td>
              <td style={valueCellStyle}>
                <Typography sx={valueSx}>{formatDate(header.fecha_destete)}</Typography>
              </td>
            </tr>
            <tr>
              <td style={headCellStyle}><HeadLabel>Tipo de destete (marcar)</HeadLabel></td>
              <td style={headCellStyle}><HeadLabel>Lote de cría (origen)</HeadLabel></td>
            </tr>
            <tr style={{ height: 30 }}>
              <td style={valueCellStyle}>
                <Typography sx={{ ...valueSx, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                  {WEANING_TYPES.map((type) => `${header.tipo_destete === type ? '☒' : '☐'} ${type}`).join('    ')}
                </Typography>
              </td>
              <td style={valueCellStyle}>
                <Typography sx={valueSx}>{header.lote_origen}</Typography>
              </td>
            </tr>
            <tr>
              <td style={headCellStyle}><HeadLabel>Responsable / Firma</HeadLabel></td>
              <td style={headCellStyle}><HeadLabel>Observaciones</HeadLabel></td>
            </tr>
            <tr style={{ height: 30 }}>
              <td style={valueCellStyle}>
                <Typography sx={valueSx}>{header.responsable}</Typography>
              </td>
              <td style={valueCellStyle} />
            </tr>
          </tbody>
        </table>

        <Box sx={{ border: '1.5px solid #000', bgcolor: '#fffbeb', p: '4px 8px', mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.58rem', fontWeight: 800, color: '#92400e' }}>
            UNA CRÍA POR FILA • Mismo lote y fecha de destete en todas las hojas • Peso y caravana de la madre opcionales
          </Typography>
          <Typography sx={{ fontSize: '0.52rem', color: '#78350f' }}>
            Si alguna fila tiene un problema, el sistema no carga la planilla hasta repararla. Escanear todas las hojas juntas.
          </Typography>
        </Box>

        <Table
          sx={{
            borderCollapse: 'collapse',
            width: '100%',
            '& .MuiTableCell-root': { border: '1px solid #000', padding: '3px 6px', fontSize: '0.68rem', color: '#000', height: 26, boxSizing: 'border-box' },
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fafafa' }}>
              <TableCell sx={{ width: '6%', fontWeight: 800, textAlign: 'center' }}>#</TableCell>
              <TableCell sx={{ width: '26%', fontWeight: 800, textTransform: 'uppercase' }}>Caravana de la cría</TableCell>
              <TableCell sx={{ width: '24%', fontWeight: 800, textTransform: 'uppercase' }}>Caravana de la madre</TableCell>
              <TableCell sx={{ width: '16%', fontWeight: 800, textTransform: 'uppercase' }}>Peso destete (kg)</TableCell>
              <TableCell sx={{ width: '28%', fontWeight: 800, textTransform: 'uppercase' }}>Observaciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((calf, index) => (
              <TableRow key={calf ? `calf-${calf.calfId}` : `blank-${index}`}>
                <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.65rem' }}>{firstRowNumber + index}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800 }}>{calf?.calfIdentification ?? ''}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace' }}>{calf?.motherIdentification ?? ''}</TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mt: 2 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', border: '1.5px solid #000', color: '#000' }}>
          <tbody>
            <tr>
              {['Firma y Aclaración: Encargado de Manga', 'Firma y Aclaración: Responsable del Destete'].map((label) => (
                <td key={label} style={{ border: '1px solid #000', padding: '10px 12px 4px 12px', width: '50%', height: 44, verticalAlign: 'bottom' }}>
                  <div style={{ borderTop: '1px dashed #000', paddingTop: '4px', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#000', fontSize: '0.6rem' }}>{label}</Typography>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <Box sx={{ pt: 1, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', fontSize: '0.65rem' }}>
            Destete y Lote de Destete ({code}) • Jhoangel AI Microservice
          </Typography>
          <Typography variant="caption" sx={{ color: '#333', fontWeight: 700, fontSize: '0.65rem' }}>
            HOJA {pageNumber ?? '___'} DE {pageTotal ?? '___'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default Dest01Page;
