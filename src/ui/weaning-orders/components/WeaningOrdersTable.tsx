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
import type { WeaningOrderSummary } from '@/features/weaning-orders/types';
import WeaningOrdersTableRow from './WeaningOrdersTableRow';
import { useWeaningOrderTableStyles } from './weaningOrderFormat';

interface WeaningOrdersTableProps {
  orders: WeaningOrderSummary[];
  onOpen: (order: WeaningOrderSummary) => void;
  onIssue: (order: WeaningOrderSummary) => void;
}

const GROUP_ROW_HEIGHT = 33;

/**
 * The weaning orders in the canonical grouped datatable, read left to right as the order goes:
 * from which breeding batches to which weaning batches, where the document stands, and how far
 * the weaning got.
 */
export const WeaningOrdersTable: React.FC<WeaningOrdersTableProps> = ({ orders, onOpen, onIssue }) => {
  const theme = useTheme();
  const { headerCell, groupCell, border, isDark } = useWeaningOrderTableStyles();
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
        <Table stickyHeader size="small" sx={{ minWidth: 1200, borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ ...groupCell, height: GROUP_ROW_HEIGHT }}>
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
            <TableRow>
              <TableCell sx={{ ...column, width: 44, textAlign: 'center' }}>#</TableCell>
              <TableCell sx={{ ...column, minWidth: 190 }}>Orden</TableCell>
              <TableCell sx={{ ...column, minWidth: 190 }}>Rodeo(s) de origen</TableCell>
              <TableCell sx={{ ...column, minWidth: 190 }}>Lote(s) de destete</TableCell>
              <TableCell sx={{ ...column, minWidth: 140 }}>Destete</TableCell>
              <TableCell sx={{ ...column, minWidth: 150 }}>Estado</TableCell>
              <TableCell sx={{ ...column, width: 80, textAlign: 'center' }}>Planilla</TableCell>
              <TableCell sx={{ ...column, minWidth: 120 }}>Papel</TableCell>
              <TableCell sx={{ ...column, minWidth: 150 }}>Avance</TableCell>
              <TableCell sx={{ ...column, minWidth: 100, borderRight: 0 }}>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((order, index) => (
              <WeaningOrdersTableRow
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

export default WeaningOrdersTable;
