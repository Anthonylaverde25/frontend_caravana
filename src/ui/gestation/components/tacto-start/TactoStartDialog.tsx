import React, { forwardRef, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Dialog, Paper, Slide, Stack, Typography } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { useServiceOrders } from '@/features/gestation/hooks/useServiceOrders';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import { useDiagnosisEntryState } from '../diagnosis-entry/useDiagnosisEntryState';
import { useDiagnosisRoundContext } from '../diagnosis-entry/useDiagnosisRoundContext';
import CloseServiceOrderDiagnosisDialog from '../dialogs/close-diagnosis/CloseServiceOrderDiagnosisDialog';
import { todayIso } from '../../utils/reproductiveVerdict';
import FullScreenEntryBar from '@/components/FullScreenEntryBar';
import TactoOrderContextCard from './TactoOrderContextCard';
import TactoRoundCard from './TactoRoundCard';
import TactoEntrySheet from './TactoEntrySheet';
import { type TactoMode, diagnosableFemales } from './tactoStart';
import { useTactoSubmit } from './useTactoSubmit';

/** The slide-up of the Material UI full-screen dialog. */
const SlideUp = forwardRef(function SlideUp(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface TactoStartDialogProps {
  orderId: number;
  mode: TactoMode;
  returnTo: string;
  onClose: () => void;
}

/**
 * "Cargar tacto" (`/gestation/service-orders/:orderId/bulk-tacto`), one screen: the round day and
 * the result of each female that came down to the chute. In close mode ("Cerrar orden" with
 * females pending) every pending female needs a result and the rows go on to the closing.
 */
export default function TactoStartDialog({ orderId, mode, returnTo, onClose }: TactoStartDialogProps) {
  const { data: orders = [], isLoading: isLoadingOrders } = useServiceOrders();
  const order = orders.find((o) => o.id === orderId) ?? null;
  const ctx = useDiagnosisRoundContext(order);
  const entry = useDiagnosisEntryState(ctx.singleBullId);
  const females = useMemo(() => diagnosableFemales(ctx.diagnosis?.females ?? []), [ctx.diagnosis]);
  const [roundDate, setRoundDate] = useState(todayIso);
  const submit = useTactoSubmit({ order, mode, roundDate, returnTo, females, entry });

  const isLoading = isLoadingOrders || ctx.isLoading;
  const isClosing = mode === 'close';
  const { pregnant, empty, notDiagnosed } = submit.counts;
  const breakdown = [pregnant && `${pregnant} preñada(s)`, empty && `${empty} vacía(s)`, notDiagnosed && `${notDiagnosed} sin diagnóstico`]
    .filter(Boolean)
    .join(', ');

  return (
    <Dialog fullScreen open onClose={onClose} TransitionComponent={SlideUp} PaperProps={{ sx: { borderRadius: 0, bgcolor: 'background.default' } }}>
      <FullScreenEntryBar
        title={`${isClosing ? 'Cerrar orden' : 'Cargar tacto'}${order ? ` · ${order.code}` : ''}`}
        subtitle={
          isClosing
            ? 'Cada vientre pendiente necesita su resultado; el que no se tactó se declara "Sin diagnóstico". Se guarda todo junto al cerrar.'
            : 'El resultado de cada vientre que pasó por la manga. Los que quedan "Sin tactar" no se guardan.'
        }
        primaryLabel={isClosing ? 'Continuar al cierre' : `Registrar ${submit.statedCount} diagnóstico(s)`}
        primaryIcon={isClosing ? 'heroicons-outline:lock-closed' : 'heroicons-outline:check'}
        busy={submit.isSaving}
        onClose={onClose}
        onPrimary={submit.submit}
      />

      {isLoading || !order || !ctx.diagnosis ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          {isLoading ? <CircularProgress size={28} /> : <Typography color="error">Orden de servicio no encontrada.</Typography>}
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: { xs: 2, md: 3 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '340px minmax(0, 1fr)' },
            gap: 2.5,
            alignItems: 'start',
          }}
        >
          <Stack spacing={2.5}>
            <TactoOrderContextCard order={order} diagnosis={ctx.diagnosis} />
            <TactoRoundCard orderId={orderId} mode={mode} rounds={ctx.diagnosis.rounds} roundDate={roundDate} onRoundDate={setRoundDate} />
            {isClosing ? (
              <Alert severity={submit.missingToClose > 0 ? 'warning' : 'success'} sx={{ borderRadius: '6px' }}>
                {submit.missingToClose > 0
                  ? `Para cerrar faltan ${submit.missingToClose} de ${submit.pendingCount} pendiente(s) sin resultado.`
                  : `Todos los pendientes tienen resultado${breakdown ? `: ${breakdown}` : ''}. Podés seguir al cierre.`}
              </Alert>
            ) : (
              <Alert severity={submit.statedCount > 0 ? 'success' : 'info'} sx={{ borderRadius: '6px' }}>
                {submit.statedCount > 0 ? `${submit.statedCount} con resultado: ${breakdown}.` : 'Marcá el resultado de cada vientre que pasó por la manga.'}
              </Alert>
            )}
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', position: { lg: 'sticky' }, top: 0 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>3. Vientres</Typography>
            <TactoEntrySheet
              females={females}
              entry={entry}
              serviceBatchId={order.batch_id}
              roundDate={roundDate}
              suggestedDate={ctx.diagnosis.suggested_diagnosis_date}
              bulls={ctx.bulls}
              emptyDestinations={ctx.destinations}
              allowNotDiagnosed={isClosing || order.status === 'BULLS_WITHDRAWN'}
              maxHeight={{ xs: 520, lg: 'calc(100vh - 300px)' }}
            />
          </Paper>
        </Box>
      )}

      {submit.closingEntries && order && (
        <CloseServiceOrderDiagnosisDialog
          open
          order={order}
          entries={submit.closingEntries}
          closingDate={roundDate}
          onClose={submit.cancelClosing}
          onClosed={onClose}
          onPendingRejected={submit.onPendingRejected}
        />
      )}
    </Dialog>
  );
}
