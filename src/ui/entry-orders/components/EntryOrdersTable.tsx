import React, { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, alpha, useTheme } from '@mui/material';
import type { EntryOrderSummary } from '@/features/entry-orders/types';
import EntryOrdersTableRow from './EntryOrdersTableRow';
import { useEntryOrderTableStyles } from './entryOrderFormat';

interface EntryOrdersTableProps {
  orders: EntryOrderSummary[];
  onOpen: (order: EntryOrderSummary) => void;
  onLoadDte: (order: EntryOrderSummary) => void;
}

const GROUP_ROW_HEIGHT = 33;

/**
 * The entry orders in the canonical grouped datatable, read left to right as a purchase goes:
 * what was bought and from whom, where the document stands, and how many head entered with DTEs.
 */
export const EntryOrdersTable: React.FC<EntryOrdersTableProps> = ({ orders, onOpen, onLoadDte }) => {
  const theme = useTheme();
  const { headerCell, groupCell, border, isDark } = useEntryOrderTableStyles();
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
                Compra
              </TableCell>
              <TableCell
                colSpan={3}
                align="center"
                sx={{ ...groupCell, color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, isDark ? 0.09 : 0.06) }}
              >
                Estado / Documento
              </TableCell>
              <TableCell colSpan={2} align="center" sx={{ ...groupCell, borderRight: 0 }}>
                Ingreso
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ ...column, width: 44, textAlign: 'center' }}>#</TableCell>
              <TableCell sx={{ ...column, minWidth: 180 }}>Orden</TableCell>
              <TableCell sx={{ ...column, minWidth: 200 }}>Origen</TableCell>
              <TableCell sx={{ ...column, minWidth: 210 }}>Tropa</TableCell>
              <TableCell sx={{ ...column, minWidth: 160 }}>Lote</TableCell>
              <TableCell sx={{ ...column, minWidth: 170 }}>Estado</TableCell>
              <TableCell sx={{ ...column, width: 96, textAlign: 'center' }}>Planilla</TableCell>
              <TableCell sx={{ ...column, minWidth: 140 }}>DTE</TableCell>
              <TableCell sx={{ ...column, minWidth: 150 }}>Avance</TableCell>
              <TableCell sx={{ ...column, minWidth: 100, borderRight: 0 }}>Compra</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((order, index) => (
              <EntryOrdersTableRow
                key={order.id}
                order={order}
                position={page * rowsPerPage + index + 1}
                isZebra={index % 2 === 1}
                onOpen={onOpen}
                onLoadDte={onLoadDte}
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

export default EntryOrdersTable;
