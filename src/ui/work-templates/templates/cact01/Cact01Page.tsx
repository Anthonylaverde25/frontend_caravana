import React from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { Cact01PrintAnimal, Cact01PrintHeader } from './Cact01PrintContext';
import Cact01PageHeader from './Cact01PageHeader';

export interface Cact01PageProps {
  code: string;
  title: string;
  establishment: string;
  header: Cact01PrintHeader;
  animals: Cact01PrintAnimal[];
  blankRows: number;
  firstRowNumber: number;
  /** Printed only when the sheet uses one destination per animal. */
  showDestinationColumn: boolean;
  /** Head and total kilos of the whole selection; null prints empty boxes to fill by hand. */
  totalHead: number | null;
  totalWeight: number | null;
  pageNumber: number | null;
  pageTotal: number | null;
}

/**
 * One A4 page of the CACT-01 sheet, homologated to DEST-01.
 *
 * Two columns are printed in grey and never left blank for the operator: sex and
 * category come from the system and are there to help find the animal in the chute. The
 * weight cell, by contrast, is always empty — it is the measurement of the day, and the
 * widest cell on the sheet for that reason.
 */
export const Cact01Page: React.FC<Cact01PageProps> = ({
  code,
  title,
  establishment,
  header,
  animals,
  blankRows,
  firstRowNumber,
  showDestinationColumn,
  totalHead,
  totalWeight,
  pageNumber,
  pageTotal,
}) => {
  const lines: (Cact01PrintAnimal | null)[] = [...animals, ...Array.from({ length: blankRows }, () => null)];

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
        <Cact01PageHeader
          code={code}
          title={title}
          establishment={establishment}
          header={header}
          showDestinationColumn={showDestinationColumn}
          totalHead={totalHead}
          totalWeight={totalWeight}
          pageNumber={pageNumber}
          pageTotal={pageTotal}
        />

        <Table
          sx={{
            borderCollapse: 'collapse',
            width: '100%',
            '& .MuiTableCell-root': { border: '1px solid #000', padding: '3px 6px', fontSize: '0.68rem', color: '#000', height: 26, boxSizing: 'border-box' },
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fafafa' }}>
              <TableCell sx={{ width: '5%', fontWeight: 800, textAlign: 'center' }}>#</TableCell>
              <TableCell sx={{ width: showDestinationColumn ? '20%' : '24%', fontWeight: 800, textTransform: 'uppercase' }}>Caravana</TableCell>
              <TableCell sx={{ width: showDestinationColumn ? '15%' : '18%', fontWeight: 800, textTransform: 'uppercase' }}>Peso actual (kg)</TableCell>
              <TableCell sx={{ width: '7%', fontWeight: 800, textTransform: 'uppercase' }}>Sexo</TableCell>
              <TableCell sx={{ width: '14%', fontWeight: 800, textTransform: 'uppercase' }}>Categoría</TableCell>
              <TableCell sx={{ width: '11%', fontWeight: 800, textTransform: 'uppercase' }}>Dentición</TableCell>
              {showDestinationColumn && (
                <TableCell sx={{ width: '18%', fontWeight: 800, textTransform: 'uppercase' }}>Lote destino</TableCell>
              )}
              <TableCell sx={{ width: showDestinationColumn ? '10%' : '21%', fontWeight: 800, textTransform: 'uppercase' }}>Observaciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((animal, index) => (
              <TableRow key={animal ? `animal-${animal.caravanId}` : `blank-${index}`}>
                <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '0.65rem' }}>{firstRowNumber + index}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800 }}>{animal?.identification ?? ''}</TableCell>
                {/* Always blank: the weight is what the chute measures today. */}
                <TableCell />
                <TableCell sx={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.62rem' }}>{animal?.sex ?? ''}</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontSize: '0.62rem' }}>{animal?.category ?? ''}</TableCell>
                <TableCell sx={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.62rem' }}>{animal?.teeth ?? ''}</TableCell>
                {showDestinationColumn && <TableCell />}
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
              {['Firma y Aclaración: Encargado de Manga', 'Firma y Aclaración: Responsable del Movimiento'].map((label) => (
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
            Cambio de Actividad de Hacienda ({code}) • Jhoangel AI Microservice
          </Typography>
          <Typography variant="caption" sx={{ color: '#333', fontWeight: 700, fontSize: '0.65rem' }}>
            HOJA {pageNumber ?? '___'} DE {pageTotal ?? '___'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default Cact01Page;
