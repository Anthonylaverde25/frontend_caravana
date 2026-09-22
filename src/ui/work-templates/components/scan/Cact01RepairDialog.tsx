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
import { ScanCact01MetadataHeader } from './ScanCact01MetadataHeader';
import { ScanCact01DestinationsPanel } from './ScanCact01DestinationsPanel';
import { ScanCact01Table } from './ScanCact01Table';
import type { Cact01RepairState } from '../../hooks/useCact01Submission';
import type { Cact01PagesState } from '../../hooks/useCact01Pages';
import type { Cact01BatchOption, Cact01DestinationsState } from '../../hooks/useCact01Destinations';
import type { Cact01Row } from './types';

const FIELD_ERRORS = ['lote_origen', 'fecha_movimiento', 'destinations'];

interface ActivityOption {
  id: number;
  name: string;
  code: string;
}

interface BatchTypeOption {
  id: number;
  name: string;
  activity_id?: number | null;
  is_selectable?: boolean;
}

interface SourceBatchOption {
  id: number;
  name: string;
  activityName: string;
  count: number;
}

interface Cact01RepairDialogProps {
  open: boolean;
  repair: Cact01RepairState | null;
  state: Cact01PagesState;
  destinationsState: Cact01DestinationsState;
  batches: Cact01BatchOption[];
  activities: ActivityOption[];
  batchTypes: BatchTypeOption[];
  sourceBatchOptions: SourceBatchOption[];
  sourceMatched: boolean;
  onRowChange: (id: string, field: keyof Cact01Row, value: string) => void;
  isSaving: boolean;
  onRetry: () => void;
  onBack: () => void;
}

/**
 * Intermediate screen of the all-or-nothing CACT-01 load: nothing was saved — no weight,
 * no dentition, no movement and no new batch — and the operator repairs the header, the
 * destinations and the offending rows of every page before retrying.
 */
export const Cact01RepairDialog: React.FC<Cact01RepairDialogProps> = ({
  open,
  repair,
  state,
  destinationsState,
  batches,
  activities,
  batchTypes,
  sourceBatchOptions,
  sourceMatched,
  onRowChange,
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
  const generalErrors = repair.headerErrors.filter((e) => !FIELD_ERRORS.includes(e.field));

  return (
    <Dialog open={open} fullScreen onClose={onBack}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#7f1d1d' }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Volver a la revisión
          </Button>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
              Reparar planilla CACT-01
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              La carga está bloqueada: no se movió ningún animal, no se registró ningún peso y no se creó ningún lote.
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

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1280, width: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Alert severity="error" sx={{ borderRadius: '8px' }}>
          <AlertTitle sx={{ fontWeight: 800 }}>{repair.message}</AlertTitle>
          {repair.headerErrors.length > 0 && `${repair.headerErrors.length} problema(s) en el encabezado o los destinos. `}
          {rowProblems > 0 && `${rowProblems} fila(s) con problemas${pendingRows < rowProblems ? `, ${rowProblems - pendingRows} ya editada(s)` : ''}. `}
          Corregí o quitá lo marcado y reintentá: el sistema vuelve a validar todas las hojas.
        </Alert>

        {generalErrors.map((error) => (
          <Alert key={`${error.field}-${error.code}`} severity="warning" sx={{ borderRadius: '8px' }}>
            {error.message}
          </Alert>
        ))}

        <Paper variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden' }}>
          <ScanCact01MetadataHeader
            metadata={state.metadata}
            onChange={state.setMetadataField}
            sourceBatchId={state.sourceBatchId}
            onSourceBatchChange={state.setSourceBatchId}
            sourceBatchOptions={sourceBatchOptions}
            sourceMatched={sourceMatched}
            headerErrors={repair.headerErrors}
          />
          <ScanCact01DestinationsPanel
            state={destinationsState}
            batches={batches}
            activities={activities}
            batchTypes={batchTypes}
            headerErrors={repair.headerErrors}
          />
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              {showAllRows ? `Todos los animales (${state.rows.length})` : `Filas con problemas (${rowProblems})`}
            </Typography>
            <FormControlLabel
              control={<Switch size="small" checked={showAllRows} onChange={(e) => setShowAllRows(e.target.checked)} />}
              label={<Typography variant="caption" sx={{ fontWeight: 700 }}>Mostrar todas las filas</Typography>}
            />
          </Stack>
          <ScanCact01Table
            rows={state.rows}
            metadata={state.metadata}
            destinations={destinationsState.destinations}
            pageLabelByKey={state.pageLabelByKey}
            onRowChange={onRowChange}
            onDeleteRow={state.deleteRow}
            rowErrorsById={repair.rowErrorsById}
            editedRowIds={repair.editedRowIds}
            onlyWithErrors={!showAllRows}
          />
        </Paper>
      </Box>
    </Dialog>
  );
};

export default Cact01RepairDialog;
