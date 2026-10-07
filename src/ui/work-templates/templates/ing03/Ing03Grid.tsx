import React from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { ING03_FINDING_KEYS, type Ing03Column } from './ing03Columns';

interface Ing03GridProps {
  columns: Ing03Column[];
  /** Line numbers of this page. */
  lines: number[];
  /** Lines up to this number are the head expected; the rest are free, for animals of more. */
  expected: number;
  landscape: boolean;
}

const headRowSx = (landscape: boolean) => ({
  backgroundColor: landscape ? '#e2e8f0' : '#fafafa',
  '& .MuiTableCell-root': { fontWeight: 800, textTransform: 'uppercase', fontSize: '0.56rem', ...(landscape ? { borderBottom: '2px solid #000' } : {}) }
});

/** The empty square the chute marks with an X. */
const MarkBox: React.FC = () => <Box sx={{ width: 10, height: 10, border: '1px solid #000', mx: 'auto', bgcolor: '#fff' }} />;

/**
 * The blank grid of an ING-03 page: one numbered line per animal, the free ones after the head
 * expected shaded so the chute counts against the DTE at a glance. The boxes of what the animal
 * came off the truck with share one heading, LESIÓN AL ARRIBO, in the grid's own header — the
 * lines below keep one pattern.
 */
export const Ing03Grid: React.FC<Ing03GridProps> = ({ columns, lines, expected, landscape }) => {
  const findings = columns.filter((column) => ING03_FINDING_KEYS.includes(column.key));
  const firstFinding = columns.findIndex((column) => ING03_FINDING_KEYS.includes(column.key));
  const widthOf = (column: Ing03Column) => (column.width != null ? `${column.width}%` : undefined);

  return (
    <Table
      sx={{
        borderCollapse: 'collapse',
        width: '100%',
        tableLayout: 'fixed',
        '& .MuiTableCell-root': {
          border: landscape ? '1px solid #64748b' : '1px solid #000',
          padding: '2px 5px',
          fontSize: '0.66rem',
          color: '#000',
          height: landscape ? 22 : 25,
          boxSizing: 'border-box'
        }
      }}
    >
      {/* A fixed layout takes widths from the first row, where the boxes share one cell. */}
      <colgroup>
        {columns.map((column) => (
          <col key={column.key} style={{ width: widthOf(column) }} />
        ))}
      </colgroup>
      <TableHead>
        <TableRow sx={headRowSx(landscape)}>
          {columns.map((column, index) => {
            if (ING03_FINDING_KEYS.includes(column.key)) {
              return index === firstFinding ? (
                <TableCell key="findings" colSpan={findings.length} sx={{ textAlign: 'center', height: '14px !important', py: '1px !important' }}>
                  Lesión al arribo (X)
                </TableCell>
              ) : null;
            }

            return (
              <TableCell key={column.key} rowSpan={2} sx={column.center ? { textAlign: 'center' } : undefined}>
                {column.label}
              </TableCell>
            );
          })}
        </TableRow>
        <TableRow sx={headRowSx(landscape)}>
          {findings.map((column) => (
            <TableCell key={column.key} sx={{ textAlign: 'center', fontSize: '0.5rem !important', height: '14px !important', py: '1px !important' }}>
              {column.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {lines.map((line) => (
          <TableRow key={line} sx={line > expected ? { backgroundColor: '#eef1f5' } : undefined}>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                sx={
                  column.key === 'n'
                    ? { textAlign: 'center', fontWeight: 700, fontSize: '0.62rem', ...(landscape ? { bgcolor: '#eef1f5', color: '#475569' } : {}) }
                    : undefined
                }
              >
                {column.key === 'n' ? line : column.box ? <MarkBox /> : ''}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default Ing03Grid;
