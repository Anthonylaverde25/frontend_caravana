import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Stack,
  Button,
  Typography,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { BullEvaluationSheetRow, BullEvaluationRowData } from './BullEvaluationSheetRow';

interface BullEvaluationSheetTableProps {
  rows: BullEvaluationRowData[];
  onChangeRow: (caravanId: number, field: keyof BullEvaluationRowData, value: any) => void;
  onRemoveRow: (caravanId: number) => void;
  onApplyBatchValue: (field: keyof BullEvaluationRowData, value: any) => void;
}

export const BullEvaluationSheetTable: React.FC<BullEvaluationSheetTableProps> = ({
  rows,
  onChangeRow,
  onRemoveRow,
  onApplyBatchValue,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const headerCellStyle = {
    fontWeight: 800,
    fontSize: '0.72rem',
    color: 'text.secondary',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    py: 1.25,
    px: 1,
    borderRight: '1px solid',
    borderBottom: '1px solid',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
  };

  if (rows.length === 0) {
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, color: 'text.secondary' }}>
          <FuseSvgIcon size={48}>heroicons-outline:document-magnifying-glass</FuseSvgIcon>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          No hay toros cargados en esta planilla
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Regresa al listado y selecciona los toros a evaluar en manga.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {/* 1-Click Fast Batch Action Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          bgcolor: isDark ? '#1e293b' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FuseSvgIcon size={18} color="action">heroicons-outline:sparkles</FuseSvgIcon>
          <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
            Acciones Rápidas en Lote:
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            size="small"
            variant="outlined"
            onClick={() => onApplyBatchValue('aplomo_notes', 'Aplomos correctos, sin afecciones.')}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              borderRadius: '6px',
              py: 0.5,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
            }}
          >
            ✓ Aplomos OK a Todos
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={() => onApplyBatchValue('libido', 'MEDIA')}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              borderRadius: '6px',
              py: 0.5,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
            }}
          >
            Líbido Media a Todos
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={() => onApplyBatchValue('body_condition_score', '3.5')}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              borderRadius: '6px',
              py: 0.5,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
            }}
          >
            CC 3.5 a Todos
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="warning"
            onClick={() => onApplyBatchValue('prepuce_scrape', true)}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              borderRadius: '6px',
              py: 0.5,
              fontWeight: 700,
            }}
          >
            ✓ Raspaje ETS a Todos
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => onApplyBatchValue('blood_serology', true)}
            sx={{
              textTransform: 'none',
              fontSize: '0.75rem',
              borderRadius: '6px',
              py: 0.5,
              fontWeight: 700,
            }}
          >
            ✓ Serología Sangre a Todos
          </Button>
        </Stack>
      </Paper>

      {/* Spreadsheet Grid Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '8px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          bgcolor: isDark ? '#1e293b' : '#ffffff',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={headerCellStyle}>Caravana</TableCell>
                <TableCell sx={headerCellStyle}>CE (cm)</TableCell>
                <TableCell sx={headerCellStyle}>Condición C.</TableCell>
                <TableCell sx={headerCellStyle}>Líbido</TableCell>
                <TableCell sx={headerCellStyle}>Aplomos & Locomoción</TableCell>
                <TableCell sx={{ ...headerCellStyle, bgcolor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7', color: '#b45309' }}>
                  Raspaje ETS
                </TableCell>
                <TableCell sx={{ ...headerCellStyle, bgcolor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#eff6ff', color: '#1e40af' }}>
                  Serología Sangre
                </TableCell>
                <TableCell sx={headerCellStyle}>Dictamen Manga</TableCell>
                <TableCell align="right" sx={{ ...headerCellStyle, borderRight: 0, width: 45 }}>
                  
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row, idx) => (
                <BullEvaluationSheetRow
                  key={row.caravan_id}
                  row={row}
                  index={idx}
                  onChange={(field, val) => onChangeRow(row.caravan_id, field, val)}
                  onRemove={onRemoveRow}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
};

export default BullEvaluationSheetTable;
