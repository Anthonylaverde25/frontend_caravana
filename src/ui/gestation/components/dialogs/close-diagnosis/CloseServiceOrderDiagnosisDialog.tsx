import { Box, Button, Chip, CircularProgress, Dialog, DialogContent, IconButton, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useLocation, useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import type { DiagnosisEntryState } from '../../diagnosis-entry/diagnosisEntryModel';
import { type TactoEntryState, tactoStartPath } from '../../tacto-start/tactoStart';
import CloseConfirmationStep from './CloseConfirmationStep';
import BullsDecisionStep from './BullsDecisionStep';
import NotInseminatedSummary from '../../insemination-entry/NotInseminatedSummary';
import { useCloseDiagnosisFlow } from './useCloseDiagnosisFlow';
import type { CloseStep } from './closeDiagnosisModel';

interface CloseServiceOrderDiagnosisDialogProps {
  open: boolean;
  order: ServiceOrder;
  onClose: () => void;
  onClosed?: () => void;
  /** Verdicts loaded in "Cargar tacto" (close mode), sent with the closing. */
  entries?: DiagnosisEntryState;
  /** Day of those verdicts: the closing day. */
  closingDate?: string;
  /** The backend found pending females; by default the user is taken to load them. */
  onPendingRejected?: (femaleIds: number[], message: string) => void;
}

const primarySx = {
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  px: 3.5,
  fontWeight: 700,
  borderRadius: '6px',
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': { bgcolor: 'primary.dark' },
} as const;
const secondarySx = { fontWeight: 600, color: 'primary.main', textTransform: 'none' } as const;

/**
 * "Cerrar orden" (thin orchestrator): what the order closes with and, while the bulls are still in
 * the batch, what happens to them. The missing verdicts are never loaded here: that is "Cargar
 * tacto" in close mode, which ends in this dialog.
 */
export default function CloseServiceOrderDiagnosisDialog({
  open,
  order,
  onClose,
  onClosed,
  entries,
  closingDate,
  onPendingRejected,
}: CloseServiceOrderDiagnosisDialogProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const loadPending = () => {
    onClose();
    const state: TactoEntryState = { mode: 'close', returnTo: `${location.pathname}${location.search}` };
    navigate(tactoStartPath(order.id), { state });
  };

  const flow = useCloseDiagnosisFlow(order, {
    entries,
    closingDate,
    onDone: () => {
      onClose();
      onClosed?.();
    },
    onPending: (ids, message) => {
      if (onPendingRejected) {
        onPendingRejected(ids, message);
        return;
      }
      enqueueSnackbar(message, { variant: 'warning' });
      loadPending();
    },
  });
  const { ctx, step, decisions } = flow;

  const steps: { key: CloseStep; label: string }[] = [
    { key: 'confirm', label: '1 · Confirmación' },
    ...(flow.needsBullDecision ? [{ key: 'bulls' as const, label: '2 · Toros' }] : []),
  ];
  const isLastStep = step === 'bulls' || !flow.needsBullDecision;

  return (
    <Dialog
      open={open}
      onClose={flow.isSubmitting ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
    >
      <Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
            Cerrar orden · {order.code}
          </Typography>
          {steps.length > 1 &&
            steps.map((item) => (
              <Chip key={item.key} label={item.label} size="small" color={item.key === step ? 'primary' : 'default'} variant={item.key === step ? 'filled' : 'outlined'} />
            ))}
        </Stack>
        <IconButton onClick={onClose} disabled={flow.isSubmitting} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {ctx.isLoading || !ctx.diagnosis ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : step === 'confirm' ? (
          <>
          <CloseConfirmationStep
            diagnosis={ctx.diagnosis}
            projection={flow.projection}
            decisions={decisions}
            onDecisions={flow.updateDecisions}
            destinations={ctx.destinations}
            offerEmptiesMove={!flow.needsBullDecision}
            canChooseDate={flow.canChooseDate}
            onLoadPending={loadPending}
          />
          <NotInseminatedSummary notInseminated={flow.notInseminated} />
          </>
        ) : (
          <BullsDecisionStep
            bulls={ctx.bulls.filter((bull) => ctx.activeBullIds.includes(bull.id))}
            projection={flow.projection}
            decisions={decisions}
            onDecisions={flow.updateDecisions}
            destinations={ctx.destinations}
          />
        )}
      </DialogContent>

      <Box sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="text" sx={secondarySx} disabled={flow.isSubmitting} onClick={() => (step === 'confirm' ? onClose() : flow.setStep('confirm'))}>
          {step === 'confirm' ? 'Cancelar' : 'Atrás'}
        </Button>
        <Button
          variant="contained"
          sx={primarySx}
          onClick={() => (isLastStep ? flow.submit() : flow.setStep('bulls'))}
          disabled={flow.isSubmitting || !ctx.diagnosis}
        >
          {flow.isSubmitting ? 'Cerrando…' : isLastStep ? 'Cerrar orden' : 'Siguiente'}
        </Button>
      </Box>
    </Dialog>
  );
}
