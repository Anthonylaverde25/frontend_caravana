import React from 'react';
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Chip,
  Box,
  useTheme,
} from '@mui/material';
import { HistoricalLabSample } from '@/core/pre-service/domain/BullClinicalHistory';

interface BullLabSamplesHistoryTableProps {
  samples: HistoricalLabSample[];
}

export const BullLabSamplesHistoryTable: React.FC<BullLabSamplesHistoryTableProps> = ({ samples }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!samples || samples.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <Typography variant="body2" color="text.secondary">
          No hay muestras de laboratorio registradas para este reproductor.
        </Typography>
      </Paper>
    );
  }

  const headerCellStyle = {
    fontWeight: 800,
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    color: 'text.secondary',
    bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
    py: 1.25,
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'NEGATIVE_CLEARED':
        return {
          label: 'NEGATIVO (LIMPIO)',
          bgcolor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#dcfce7',
          color: isDark ? '#34d399' : '#15803d',
        };
      case 'POSITIVE_DETECTED':
        return {
          label: 'POSITIVO (DETECTADO)',
          bgcolor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
          color: isDark ? '#f87171' : '#b91c1c',
        };
      case 'PENDING_RESULTS':
      default:
        return {
          label: 'PENDIENTE RESULTADO',
          bgcolor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7',
          color: isDark ? '#fbbf24' : '#b45309',
        };
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
        bgcolor: isDark ? '#1e293b' : '#ffffff',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#0f172a' }}>
          Historial de Muestreos y Protocolos de Laboratorio
        </Typography>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellStyle}>Fecha de Muestra</TableCell>
            <TableCell sx={headerCellStyle}>Tipo de Muestra</TableCell>
            <TableCell sx={headerCellStyle}>Ronda</TableCell>
            <TableCell sx={headerCellStyle}>Tubo Rotulado</TableCell>
            <TableCell sx={headerCellStyle}>Protocolo Oficial</TableCell>
            <TableCell sx={headerCellStyle}>Fecha de Informe</TableCell>
            <TableCell sx={headerCellStyle}>Resultado Analítico</TableCell>
            <TableCell sx={headerCellStyle}>Patógeno Asociado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {samples.map((sample) => {
            const isScrape = sample.sample_type === 'PREPUCE_SCRAPE';
            const chip = getStatusChip(sample.status);

            return (
              <TableRow key={sample.id} hover>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                  {sample.sample_date}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={isScrape ? 'Raspaje Prepucial (ETS)' : 'Serología Sangre (BPA)'}
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      height: 22,
                      bgcolor: isScrape ? '#fef3c7' : '#eff6ff',
                      color: isScrape ? '#92400e' : '#1e40af',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  Ronda {sample.sample_round}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem' }}>
                  {sample.tube_number || '-'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                  {sample.protocol_number || 'En proceso'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                  {sample.result_date || '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={chip.label}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      height: 22,
                      bgcolor: chip.bgcolor,
                      color: chip.color,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                  {sample.pathogen_name || '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default BullLabSamplesHistoryTable;
