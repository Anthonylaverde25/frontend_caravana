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
import { HistoricalEvaluation } from '@/core/pre-service/domain/BullClinicalHistory';

interface BullEvaluationsHistoryTableProps {
  evaluations: HistoricalEvaluation[];
}

export const BullEvaluationsHistoryTable: React.FC<BullEvaluationsHistoryTableProps> = ({ evaluations }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!evaluations || evaluations.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <Typography variant="body2" color="text.secondary">
          No hay evaluaciones andrológicas registradas para este reproductor.
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
          Historial de Evaluaciones Andrológicas y Examen Físico en Manga
        </Typography>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellStyle}>Fecha de Manga</TableCell>
            <TableCell sx={headerCellStyle}>Circ. Escrotal (CE)</TableCell>
            <TableCell sx={headerCellStyle}>Cond. Corporal (CC)</TableCell>
            <TableCell sx={headerCellStyle}>Líbido</TableCell>
            <TableCell sx={headerCellStyle}>Aplomos &amp; Locomoción</TableCell>
            <TableCell sx={headerCellStyle}>Dictamen en Manga</TableCell>
            <TableCell sx={headerCellStyle}>Observaciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {evaluations.map((evalItem) => {
            const isCeOk = evalItem.scrotal_circumference_cm !== null && evalItem.scrotal_circumference_cm >= 28.0;

            return (
              <TableRow key={evalItem.id} hover>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                  {evalItem.last_evaluation_date}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={evalItem.scrotal_circumference_cm !== null ? `${evalItem.scrotal_circumference_cm} cm` : 'S/D'}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      height: 22,
                      bgcolor: isCeOk ? (isDark ? 'rgba(22, 163, 74, 0.2)' : '#dcfce7') : (isDark ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2'),
                      color: isCeOk ? (isDark ? '#4ade80' : '#15803d') : (isDark ? '#f87171' : '#b91c1c'),
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  {evalItem.body_condition_score !== null ? `CC ${evalItem.body_condition_score.toFixed(1)}` : 'S/D'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>
                  {evalItem.libido}
                </TableCell>
                <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                  {evalItem.aplomo_notes || 'Correctos'}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={evalItem.status}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.68rem',
                      height: 22,
                      bgcolor: evalItem.status === 'APT' ? '#dcfce7' : '#f1f5f9',
                      color: evalItem.status === 'APT' ? '#15803d' : '#475569',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                  {evalItem.observations || '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default BullEvaluationsHistoryTable;
