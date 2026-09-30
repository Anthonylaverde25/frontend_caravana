import React from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { Cact01PrintAnimal, Cact01PrintHeader } from './Cact01PrintContext';
import Cact01PageHeader from './Cact01PageHeader';

/**
 * How the C/S nueva column prints: absent when the category does not change, filled in when the
 * order declared it, blank when the chute decides it.
 */
export type Cact01CategoryColumn = 'none' | 'declared' | 'at_chute';

/**
 * Column widths, in percent. The weight stays the widest writable cell; what gives way to the
 * extra columns is the observations cell, which takes whatever is left.
 */
const columnWidths = (perRow: boolean, withManagement: boolean, withCategory: boolean) => {
  const widths = {
    number: 5,
    caravana: perRow ? (withCategory ? 16 : 20) : withCategory ? 22 : 24,
    peso: perRow ? (withCategory ? 13 : 14) : withCategory ? 16 : 18,
    sexo: 7,
    categoria: withCategory ? 12 : 14,
    dientes: withCategory ? 8 : 11,
    destino: perRow ? (withCategory ? 14 : 16) : 0,
    manejo: withManagement ? (withCategory ? 4 : 5) : 0,
    categoriaNueva: withCategory ? (perRow ? 13 : 15) : 0,
  };
  const used = Object.values(widths).reduce((sum, width) => sum + width, 0);

  return { ...widths, observaciones: Math.max(6, 100 - used) };
};

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
  /**
   * Whether the M cell is printed beside each destination.
   *
   * It goes out with the destination column, and only for a productive destination activity:
   * an internal stage has no management system to declare, so the cell would be a question
   * with no answer.
   */
  showManagementColumn: boolean;
  categoryColumn: Cact01CategoryColumn;
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
 * category come from the system and are there to help find the animal in the chute. When the
 * order says the category changes, the NEW one goes in a column of its own (C/S nueva), so the
 * current one keeps identifying the animal and a blank cell can still mean "no change". The
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
  showManagementColumn,
  categoryColumn,
  totalHead,
  totalWeight,
  pageNumber,
  pageTotal,
}) => {
  const lines: (Cact01PrintAnimal | null)[] = [...animals, ...Array.from({ length: blankRows }, () => null)];
  const withCategory = categoryColumn !== 'none';
  const width = columnWidths(showDestinationColumn, showManagementColumn, withCategory);
  const pct = (value: number) => `${value}%`;

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
          categoryColumn={categoryColumn}
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
              <TableCell sx={{ width: pct(width.number), fontWeight: 800, textAlign: 'center' }}>#</TableCell>
              <TableCell sx={{ width: pct(width.caravana), fontWeight: 800, textTransform: 'uppercase' }}>Caravana</TableCell>
              <TableCell sx={{ width: pct(width.peso), fontWeight: 800, textTransform: 'uppercase' }}>Peso actual (kg)</TableCell>
              <TableCell sx={{ width: pct(width.sexo), fontWeight: 800, textTransform: 'uppercase' }}>Sexo</TableCell>
              <TableCell sx={{ width: pct(width.categoria), fontWeight: 800, textTransform: 'uppercase' }}>
                {withCategory ? 'C/S actual' : 'Categoría'}
              </TableCell>
              <TableCell sx={{ width: pct(width.dientes), fontWeight: 800, textTransform: 'uppercase' }}>Dentición</TableCell>
              {showDestinationColumn && (
                <TableCell sx={{ width: pct(width.destino), fontWeight: 800, textTransform: 'uppercase' }}>Lote destino</TableCell>
              )}
              {showManagementColumn && (
                // One letter wide on purpose: C and P share no stroke, which is what makes a
                // handwritten cell this narrow readable at all.
                <TableCell sx={{ width: pct(width.manejo), fontWeight: 800, textAlign: 'center' }} title="Manejo: C = corral, P = pastura">
                  M
                </TableCell>
              )}
              {withCategory && (
                <TableCell
                  sx={{ width: pct(width.categoriaNueva), fontWeight: 800, textTransform: 'uppercase' }}
                  title="Categoría o subcategoría nueva. Vacía = no cambia."
                >
                  C/S nueva
                </TableCell>
              )}
              <TableCell sx={{ width: pct(width.observaciones), fontWeight: 800, textTransform: 'uppercase' }}>Observaciones</TableCell>
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
                {showDestinationColumn && (
                  // Printed when the system already decided it, blank when the batch of
                  // this animal is something the chute will settle.
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#334155' }}>
                    {animal?.destino ?? ''}
                  </TableCell>
                )}
                {showManagementColumn && (
                  // The letter of the batch beside it, never of the animal. Blank whenever
                  // that batch is still to be decided, or does not declare it.
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.62rem', textAlign: 'center', color: '#334155' }}>
                    {animal?.manejo ?? ''}
                  </TableCell>
                )}
                {withCategory && (
                  // Declared: printed in black, it is part of the order; a dash is "keeps its
                  // category". At the chute: blank, and blank still means no change.
                  <TableCell sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#0f172a' }}>
                    {categoryColumn === 'declared' && animal ? (animal.categoryNew ?? '—') : ''}
                  </TableCell>
                )}
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mt: 2 }}>
        {/* A one-letter column needs its legend on the paper: whoever fills it in at the
            chute does not have the screen in front of them. */}
        {showManagementColumn && (
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#000', mb: 0.5 }}>
            M = sistema de manejo del lote destino: C corral · P pastura.
            {header.actividad_destino ? ` Todo lote destino pertenece a ${header.actividad_destino}.` : ''}
          </Typography>
        )}
        {withCategory && (
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#000', mb: 0.5 }}>
            C/S nueva = categoría (Novillito) o subcategoría (Reposición), o ambas (Vaquillona / Reposición).
            {categoryColumn === 'declared'
              ? ' Impresa por la orden: tachar y escribir otra sólo si en la manga se decide distinto. — = no cambia.'
              : ' Escribir sólo si cambia: vacía = no cambia.'}
          </Typography>
        )}
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
