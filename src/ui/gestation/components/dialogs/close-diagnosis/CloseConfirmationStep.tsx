import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import type { ServiceOrderDiagnosis } from '@/features/gestation/hooks/useServiceOrders';
import { formatDay, todayIso } from '@/ui/gestation/utils/reproductiveVerdict';
import type { BatchOption } from '../../diagnosis-entry/DiagnosisEntryRow';
import type { ClosingDecisions, ProjectedClosing } from './closeDiagnosisModel';

interface CloseConfirmationStepProps {
  diagnosis: ServiceOrderDiagnosis;
  projection: ProjectedClosing;
  decisions: ClosingDecisions;
  onDecisions: (patch: Partial<ClosingDecisions>) => void;
  destinations: BatchOption[];
  /** Without bulls to decide on, moving the final empties is the only decision of the order. */
  offerEmptiesMove: boolean;
  /** No verdicts came with the closing: its day is chosen here. */
  canChooseDate: boolean;
  /** Takes the user to "Cargar tacto" (close mode) for the females still pending. */
  onLoadPending: () => void;
}

function Figure({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', textAlign: 'center' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, color: tone ?? 'text.primary' }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    </Paper>
  );
}

/**
 * What the order closes with, read-only, and the order-level decisions. A female still pending on
 * the closing day is loaded in "Cargar tacto", never here.
 */
export default function CloseConfirmationStep({
  diagnosis,
  projection,
  decisions,
  onDecisions,
  destinations,
  offerEmptiesMove,
  canChooseDate,
  onLoadPending,
}: CloseConfirmationStepProps) {
  const openIncidents = diagnosis.incidents.filter((incident) => incident.status === 'OPEN');

  return (
    <Stack spacing={2.5}>
      {canChooseDate && (
        <TextField
          type="date"
          variant="filled"
          label="Fecha del cierre"
          value={decisions.closingDate}
          onChange={(e) => onDecisions({ closingDate: e.target.value || todayIso() })}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: todayIso() }}
          sx={{ bgcolor: 'action.hover', maxWidth: 240 }}
        />
      )}

      {projection.stillPending > 0 && (
        <Alert
          severity="warning"
          sx={{ fontSize: '0.8rem' }}
          action={
            <Button color="inherit" size="small" onClick={onLoadPending} sx={{ textTransform: 'none', fontWeight: 700 }}>
              Cargarlos
            </Button>
          }
        >
          Con cierre el {formatDay(decisions.closingDate)} quedan {projection.stillPending} vientre(s) sin veredicto final.
        </Alert>
      )}

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><Figure label="Preñadas" value={projection.pregnant} tone="success.main" /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><Figure label="Vacías" value={projection.empty} tone="error.main" /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><Figure label="Sin diagnóstico" value={projection.notDiagnosed} /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><Figure label="Salidas (muerte / venta)" value={projection.exited} /></Grid>
        <Grid size={{ xs: 12, md: 2.4 }}>
          <Figure label="Preñez final" value={projection.rate !== null ? `${projection.rate.toFixed(1)}%` : '—'} tone="primary.main" />
        </Grid>
      </Grid>

      <Typography variant="caption" color="text.secondary">
        La tasa es preñadas sobre preñadas + vacías: los vientres sin diagnóstico y las salidas quedan fuera.
        Cierre: {formatDay(decisions.closingDate)}.
      </Typography>

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Rondas</Typography>
        {diagnosis.rounds.map((round) => (
          <Typography key={round.id} variant="body2" color="text.secondary">
            Ronda {round.number} · {formatDay(round.round_date)}: {round.diagnosed} vientres ({round.pregnant} preñadas, {round.empty} vacías
            {round.rechecks > 0 ? `, ${round.rechecks} re-tactos` : ''})
          </Typography>
        ))}
        {projection.statedThisRound > 0 && (
          <Typography variant="body2" color="text.secondary">
            Ronda del cierre · {formatDay(decisions.closingDate)}: {projection.statedThisRound} vientres cargados ahora
          </Typography>
        )}
      </Box>

      {openIncidents.length > 0 && (
        <Alert severity="warning" sx={{ fontSize: '0.8rem' }}>
          {openIncidents.length} novedad(es) abierta(s): no impiden cerrar.
          {openIncidents.map((incident) => (
            <Typography key={incident.id} variant="caption" sx={{ display: 'block' }}>• {incident.detail}</Typography>
          ))}
        </Alert>
      )}

      {offerEmptiesMove && projection.emptiesInServiceBatch > 0 && (
        <TextField
          select
          SelectProps={{ displayEmpty: true }}
          fullWidth
          variant="filled"
          label={`Vacías que siguen en el lote de servicio (${projection.emptiesInServiceBatch})`}
          InputLabelProps={{ shrink: true }}
          value={decisions.emptiesTargetBatchId ?? ''}
          onChange={(e) => onDecisions({ emptiesTargetBatchId: e.target.value === '' ? null : Number(e.target.value) })}
          sx={{ bgcolor: 'action.hover' }}
        >
          <MenuItem value=""><em>Quedan en el lote</em></MenuItem>
          {destinations.map((batch) => (
            <MenuItem key={batch.id} value={batch.id}>Salen a: {batch.name}</MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        fullWidth
        multiline
        minRows={2}
        variant="filled"
        label="Observaciones del cierre (opcional)"
        value={decisions.observations}
        onChange={(e) => onDecisions({ observations: e.target.value })}
        sx={{ bgcolor: 'action.hover' }}
      />
    </Stack>
  );
}
