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
import { ScanDest01BatchTarget } from './ScanDest01BatchTarget';
import { ScanDest01MetadataHeader } from './ScanDest01MetadataHeader';
import { ScanDest01Table } from './ScanDest01Table';
import type { Dest01RepairState } from '../../hooks/useDest01Submission';
import type { Dest01PagesState } from '../../hooks/useDest01Pages';
import type { Dest01Row } from './types';

const HEADER_FIELDS = ['lote_destete', 'fecha_destete'];

interface Dest01RepairDialogProps {
  open: boolean;
  repair: Dest01RepairState | null;
  state: Dest01PagesState;
  onRowChange: (id: string, field: keyof Dest01Row, value: string) => void;
  isSaving: boolean;
  onRetry: () => void;
  onBack: () => void;
}

/**
 * Intermediate screen of the all-or-nothing DEST-01 load: nothing was saved, and the operator
 * repairs the destination, the header and the offending rows of every page before retrying.
 */
export const Dest01RepairDialog: React.FC<Dest01RepairDialogProps> = ({ open, repair, state, onRowChange, isSaving, onRetry, onBack }) => {
  const [showAllRows, setShowAllRows] = useState(false);

  if (!repair) {
    return null;
  }

  const rowProblems = Object.keys(repair.rowErrorsById).length;
  const pendingRows = Object.keys(repair.rowErrorsById).filter((key) => !repair.editedRowIds.has(key)).length;
  const generalErrors = repair.headerErrors.filter((e) => !HEADER_FIELDS.includes(e.field));

  return (
    <Dialog open={open} fullScreen onClose={onBack}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#7f1d1d' }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Volver a la revisión
          </Button>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
              Reparar planilla DEST-01
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              La carga está bloqueada: no se destetó ninguna cría ni se creó ningún lote.
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

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, width: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Alert severity="error" sx={{ borderRadius: '8px' }}>
          <AlertTitle sx={{ fontWeight: 800 }}>{repair.message}</AlertTitle>
          {repair.headerErrors.length > 0 && `${repair.headerErrors.length} problema(s) en el encabezado. `}
          {rowProblems > 0 && `${rowProblems} fila(s) con problemas${pendingRows < rowProblems ? `, ${rowProblems - pendingRows} ya editada(s)` : ''}. `}
          Corregí o quitá lo marcado y reintentá: el sistema vuelve a validar todas las hojas.
        </Alert>

        {generalErrors.map((error) => (
          <Alert key={`${error.field}-${error.code}`} severity="warning" sx={{ borderRadius: '8px' }}>
            {error.message}
          </Alert>
        ))}

        <Paper variant="outlined" sx={{ borderRadius: '8px', overflow: 'hidden' }}>
          <ScanDest01BatchTarget
            sheetName={state.metadata.lote_destete}
            target={state.target}
            onChange={state.setTarget}
            headerErrors={repair.headerErrors}
          />
          <Box sx={{ p: 2 }}>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              Encabezado
            </Typography>
            <ScanDest01MetadataHeader metadata={state.metadata} onChange={state.setMetadataField} headerErrors={repair.headerErrors} />
          </Box>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              {showAllRows ? `Todas las crías (${state.rows.length})` : `Filas con problemas (${rowProblems})`}
            </Typography>
            <FormControlLabel
              control={<Switch size="small" checked={showAllRows} onChange={(e) => setShowAllRows(e.target.checked)} />}
              label={<Typography variant="caption" sx={{ fontWeight: 700 }}>Mostrar todas las filas</Typography>}
            />
          </Stack>
          <ScanDest01Table
            rows={state.rows}
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

export default Dest01RepairDialog;
