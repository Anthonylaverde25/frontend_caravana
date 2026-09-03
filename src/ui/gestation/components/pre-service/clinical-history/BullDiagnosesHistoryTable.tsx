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
import { HistoricalDiagnosis } from '@/core/pre-service/domain/BullClinicalHistory';

interface BullDiagnosesHistoryTableProps {
  diagnoses: HistoricalDiagnosis[];
}

export const BullDiagnosesHistoryTable: React.FC<BullDiagnosesHistoryTableProps> = ({ diagnoses }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!diagnoses || diagnoses.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <Typography variant="body2" color="text.secondary">
          No hay afecciones clínicas o diagnósticos veterinarios registrados para este reproductor.
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
          Historial de Diagnósticos Clínicos &amp; Tratamientos Farmacológicos
        </Typography>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellStyle}>Fecha Diagnóstico</TableCell>
            <TableCell sx={headerCellStyle}>Patología / Afección</TableCell>
            <TableCell sx={headerCellStyle}>Impacto Zootécnico</TableCell>
            <TableCell sx={headerCellStyle}>Veterinario Actuante</TableCell>
            <TableCell sx={headerCellStyle}>Estado Clínico</TableCell>
            <TableCell sx={headerCellStyle}>Fecha Alta Médica</TableCell>
            <TableCell sx={headerCellStyle}>Notas de Tratamiento</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {diagnoses.map((diag) => {
            const isActive = diag.status === 'ACTIVE';

            return (
              <TableRow key={diag.id} hover>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                  {diag.diagnosis_date}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                  {diag.pathogen_name}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={diag.pathogen_is_disqualifying ? 'DESCARTE OBLIGATORIO' : 'TRATABLE EN CAMPO'}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      height: 20,
                      bgcolor: diag.pathogen_is_disqualifying ? '#fee2e2' : '#fef3c7',
                      color: diag.pathogen_is_disqualifying ? '#b91c1c' : '#b45309',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.78rem' }}>
                  {diag.veterinarian_name || 'Dr. Veterinario'}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={isActive ? 'EN TRATAMIENTO' : 'ALTA MÉDICA (RESUELTO)'}
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      height: 22,
                      bgcolor: isActive ? '#fee2e2' : '#dcfce7',
                      color: isActive ? '#dc2626' : '#15803d',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                  {diag.resolution_date || '-'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                  {diag.treatment_notes || '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default BullDiagnosesHistoryTable;
