import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DiagnosticProtocol } from '@/core/veterinary/domain/VeterinaryTypes';
import { DiagnosticProtocolsRow } from './DiagnosticProtocolsRow';

interface DiagnosticProtocolsTableProps {
  protocols: DiagnosticProtocol[];
  onViewDetail: (id: number) => void;
}

export const DiagnosticProtocolsTable: React.FC<DiagnosticProtocolsTableProps> = ({
  protocols,
  onViewDetail,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const paginatedProtocols = useMemo(() => {
    const from = page * rowsPerPage;
    return protocols.slice(from, from + rowsPerPage);
  }, [protocols, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const headerCellStyle = {
    fontWeight: 800,
    fontSize: '0.72rem',
    color: 'text.secondary',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    py: 1.25,
    px: 1.5,
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
  };

  if (protocols.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          bgcolor: isDark ? '#1e293b' : '#ffffff',
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            mx: 'auto',
            mb: 2,
            borderRadius: '50%',
            bgcolor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#eff6ff',
            color: isDark ? '#60a5fa' : '#0a6ed1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FuseSvgIcon size={26}>heroicons-outline:document-magnifying-glass</FuseSvgIcon>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
          No se encontraron protocolos diagnósticos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto' }}>
          Ajusta los filtros de búsqueda o digitaliza un nuevo protocolo con los resultados del laboratorio.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
        bgcolor: isDark ? '#1e293b' : '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 960, borderCollapse: 'collapse' }} size="small">
          <TableHead sx={{ bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ ...headerCellStyle, width: 170 }}>N° Protocolo & Origen</TableCell>
              <TableCell sx={headerCellStyle}>Profesional Firmante</TableCell>
              <TableCell sx={headerCellStyle}>Laboratorio / Centro</TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 150 }}>Fechas (Informe / Muestra)</TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 130, textAlign: 'center' }}>Determinaciones</TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 130, textAlign: 'center' }}>Hallazgos Positivos</TableCell>
              <TableCell sx={{ ...headerCellStyle, width: 140, textAlign: 'center' }}>Estado & Aval</TableCell>
              <TableCell align="right" sx={{ ...headerCellStyle, width: 100, borderRight: 0 }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedProtocols.map((protocol, idx) => (
              <DiagnosticProtocolsRow
                key={protocol.id}
                protocol={protocol}
                index={page * rowsPerPage + idx}
                onViewDetail={onViewDetail}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 15, 25, 50]}
        component="div"
        count={protocols.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        sx={{
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: '0.75rem',
            color: 'text.secondary',
          },
        }}
      />
    </Paper>
  );
};

export default DiagnosticProtocolsTable;
