import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  alpha,
  useTheme
} from '@mui/material';
import type { BirthOrderSummary } from '@/features/birth-orders/types';
import BirthOrdersTableRow from './BirthOrdersTableRow';
import { useBirthOrderTableStyles } from './birthOrderFormat';

interface BirthOrdersTableProps {
  orders: BirthOrderSummary[];
  onOpen: (order: BirthOrderSummary) => void;
  onIssue: (order: BirthOrderSummary) => void;
}

const GROUP_ROW_HEIGHT = 33;

/**
 * The birth orders in the canonical grouped datatable, read left to right as the season goes: which
 * females and over which window, where the document stands, and how far the calving got.
 */
export const BirthOrdersTable: React.FC<BirthOrdersTableProps> = ({ orders, onOpen, onIssue }) => {
  const theme = useTheme();
  const { headerCell, groupCell, border, isDark } = useBirthOrderTableStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  useEffect(() => setPage(0), [orders.length]);

  const visible = orders.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const column = { ...headerCell, top: GROUP_ROW_HEIGHT };

  return (
    <Paper
      elevation={0}
      sx={{ border: 1, borderColor: theme.palette.divider, borderRadius: '4px', overflow: 'hidden', bgcolor: 'background.paper' }}
    >
      <TableContainer sx={{ maxHeight: 'calc(100vh - 330px)' }}>
        <Table stickyHeader size="small" sx={{ minWidth: 1100, borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ ...groupCell, height: GROUP_ROW_HEIGHT }}>
                Datos de la orden
              </TableCell>
              <TableCell
                colSpan={3}
                align="center"
                sx={{ ...groupCell, color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, isDark ? 0.09 : 0.06) }}
              >
                Estado / Documento
              </TableCell>
              <TableCell colSpan={1} align="center" sx={{ ...groupCell, borderRight: 0 }}>
                Parición
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ ...column, width: 44, textAlign: 'center' }}>#</TableCell>
              <TableCell sx={{ ...column, minWidth: 190 }}>Orden</TableCell>
              <TableCell sx={{ ...column, minWidth: 220 }}>Vientres / Lote(s)</TableCell>
              <TableCell sx={{ ...column, minWidth: 160 }}>Período</TableCell>
              <TableCell sx={{ ...column, minWidth: 150 }}>Estado</TableCell>
              <TableCell sx={{ ...column, width: 80, textAlign: 'center' }}>Planilla</TableCell>
              <TableCell sx={{ ...column, minWidth: 120 }}>Papel</TableCell>
              <TableCell sx={{ ...column, minWidth: 200, borderRight: 0 }}>Avance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((order, index) => (
              <BirthOrdersTableRow
                key={order.id}
                order={order}
                position={page * rowsPerPage + index + 1}
                isZebra={index % 2 === 1}
                onOpen={onOpen}
                onIssue={onIssue}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={orders.length}
        page={page}
        onPageChange={(_, next) => setPage(next)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(Number(e.target.value));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 15, 25, 50]}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        sx={{ borderTop: 1, borderColor: border, bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#fafafa' }}
      />
    </Paper>
  );
};

export default BirthOrdersTable;
