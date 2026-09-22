import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Toolbar,
  Typography,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Replay as ReplayIcon } from '@mui/icons-material';
import { ScanLser01MetadataHeader } from './ScanLser01MetadataHeader';
import { ScanLser01Table } from './ScanLser01Table';
import { Lser01Metadata, WorkTemplateScanRow } from './types';
import type { Lser01RepairState } from '../../hooks/useLser01Submission';

interface Lser01RepairDialogProps {
  open: boolean;
  repair: Lser01RepairState | null;
  metadata: Lser01Metadata;
  onMetadataChange: <K extends keyof Lser01Metadata>(field: K, value: Lser01Metadata[K]) => void;
  rows: WorkTemplateScanRow[];
  onRowChange: (index: number, field: keyof WorkTemplateScanRow, value: any) => void;
  onDeleteRow: (index: number) => void;
  rowKey: (row: WorkTemplateScanRow, index: number) => string;
  isSaving: boolean;
  onRetry: () => void;
  onBack: () => void;
}

/**
 * Intermediate screen of the all-or-nothing LSER-01 load: nothing was saved, and the operator
 * repairs the header and the offending rows here before retrying.
 */
export const Lser01RepairDialog: React.FC<Lser01RepairDialogProps> = ({
  open,
  repair,
  metadata,
  onMetadataChange,
  rows,
  onRowChange,
  onDeleteRow,
  rowKey,
  isSaving,
  onRetry,
  onBack,
}) => {
  const [showAllRows, setShowAllRows] = useState(false);

  if (!repair) {
    return null;
  }

  const rowProblems = Object.keys(repair.rowErrorsById).length;
  const pendingRows = Object.keys(repair.rowErrorsById).filter((key) => !repair.editedRowIds.has(key)).length;
  const generalErrors = repair.headerErrors.filter((e) => !['lote', 'toro_caravana', 'planned_start_date', 'planned_end_date'].includes(e.field));

  return (
    <Dialog open={open} fullScreen onClose={onBack}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#7f1d1d' }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Volver a la revisión
          </Button>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
              Reparar planilla LSER-01
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              La carga está bloqueada: no se guardó ningún lote, orden ni movimiento.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="inherit"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} /> : <ReplayIcon />}
            onClick={onRetry}
            sx={{ textTransform: 'none', fontWeight: 800, color: '#7f1d1d', bgcolor: '#fff', '&:hover': { bgcolor: '#fee2e2' } }}
          >
            {isSaving ? 'Validando…' : 'Reintentar carga'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, width: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Alert severity="error" sx={{ borderRadius: '8px' }}>
          <AlertTitle sx={{ fontWeight: 800 }}>{repair.message}</AlertTitle>
          {repair.headerErrors.length > 0 && `${repair.headerErrors.length} problema(s) en el encabezado. `}
          {rowProblems > 0 && `${rowProblems} fila(s) con problemas${pendingRows < rowProblems ? `, ${rowProblems - pendingRows} ya editada(s)` : ''}. `}
          Corregí o quitá lo marcado y reintentá: el sistema vuelve a validar toda la planilla.
        </Alert>

        {generalErrors.map((error) => (
          <Alert key={`${error.field}-${error.code}`} severity="warning" sx={{ borderRadius: '8px' }}>
            {error.message}
          </Alert>
        ))}

        <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
          <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
            Encabezado
          </Typography>
          <ScanLser01MetadataHeader metadata={metadata} onChange={onMetadataChange} headerErrors={repair.headerErrors} />
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              {showAllRows ? `Todos los vientres (${rows.length})` : `Filas con problemas (${rowProblems})`}
            </Typography>
            <FormControlLabel
              control={<Switch size="small" checked={showAllRows} onChange={(e) => setShowAllRows(e.target.checked)} />}
              label={<Typography variant="caption" sx={{ fontWeight: 700 }}>Mostrar todas las filas</Typography>}
            />
          </Stack>
          <ScanLser01Table
            rows={rows}
            onRowChange={onRowChange}
            onDeleteRow={onDeleteRow}
            rowErrorsById={repair.rowErrorsById}
            editedRowIds={repair.editedRowIds}
            onlyWithErrors={!showAllRows}
            rowKey={rowKey}
          />
        </Paper>
      </Box>
    </Dialog>
  );
};

export default Lser01RepairDialog;
