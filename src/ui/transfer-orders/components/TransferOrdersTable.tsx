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
import type { TransferOrderSummary } from '@/features/transfer-orders/types';
import TransferOrdersTableRow from './TransferOrdersTableRow';
import { useTransferOrderTableStyles } from './transferOrderFormat';

interface TransferOrdersTableProps {
  orders: TransferOrderSummary[];
  onOpen: (order: TransferOrderSummary) => void;
  /** Draft → issued, after the user confirms in a dialog. */
  onIssue: (order: TransferOrderSummary) => void;
}

/** Height of the group row: the column row sticks right under it. */
const GROUP_ROW_HEIGHT = 33;

/**
 * The orders, in the canonical datatable of /batches/external-assignment: a row of column groups
 * over the row of columns. It reads left to right as the order goes: what it is and where it
 * takes the animals, where the document stands (the group the user acts on, tinted like the one
 * it mirrors), and finally how far its execution got and when the movement was planned.
 */
export const TransferOrdersTable: React.FC<TransferOrdersTableProps> = ({ orders, onOpen, onIssue }) => {
  const theme = useTheme();
  const { headerCell, groupCell, border, isDark } = useTransferOrderTableStyles();
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
        <Table stickyHeader size="small" sx={{ minWidth: 1150, borderCollapse: 'collapse' }}>
          <TableHead>
            {/* Fila 1: grupos */}
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
              <TableCell colSpan={2} align="center" sx={{ ...groupCell, borderRight: 0 }}>
                Ejecución
              </TableCell>
            </TableRow>
            {/* Fila 2: columnas */}
            <TableRow>
              <TableCell sx={{ ...column, width: 44, textAlign: 'center' }}>#</TableCell>
              <TableCell sx={{ ...column, minWidth: 190 }}>Orden</TableCell>
              <TableCell sx={{ ...column, minWidth: 170 }}>Lote de origen</TableCell>
              <TableCell sx={{ ...column, minWidth: 190 }}>Destino</TableCell>
              <TableCell sx={{ ...column, minWidth: 150 }}>Estado</TableCell>
              <TableCell sx={{ ...column, width: 80, textAlign: 'center' }}>Planilla</TableCell>
              <TableCell sx={{ ...column, minWidth: 130 }}>Papel</TableCell>
              <TableCell sx={{ ...column, minWidth: 150 }}>Avance</TableCell>
              <TableCell sx={{ ...column, minWidth: 100, borderRight: 0 }}>Fecha mov.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((order, index) => (
              <TransferOrdersTableRow
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

export default TransferOrdersTable;
