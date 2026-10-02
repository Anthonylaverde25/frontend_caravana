import React, { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { Alert, Box, Button, Checkbox, FormControlLabel, Paper, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import ViewLayout from '@/components/ViewLayout';
import { useRegisterEntry } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { entryOrderApiError, entryOrderErrorMessage } from '@/features/entry-orders/types';
import CreateExternalBatchDialog from '@/ui/batches/components/external/CreateExternalBatchDialog';
import { ExternalBatchFormInput, externalBatchSchema, toEntryOrderPayload } from '@/ui/batches/components/external/externalBatchSchema';
import EntryTroopSummaryCard from '../components/EntryTroopSummaryCard';
import DteEntryForm from '../components/dte/DteEntryForm';
import { useDteDraft } from '../components/dte/useDteDraft';
import { useDeclaredTroop } from './useDeclaredTroop';

export interface RegisterEntryState {
  troop: ExternalBatchFormInput;
}

/**
 * Second step of "Registrar ingreso": the troop declared in the dialog, read-only (with "Editar"
 * to go back to it), and the DTE that is already in hand with its caravans. Everything is created
 * in one transaction; if a caravan is rejected, nothing is.
 */
export const RegisterEntryConfirmView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as RegisterEntryState | null;
  const register = useRegisterEntry();
  const draft = useDteDraft();
  const [isEditing, setIsEditing] = useState(false);
  const [closeNow, setCloseNow] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const parsed = useMemo(() => (state?.troop ? externalBatchSchema.safeParse(state.troop) : null), [state]);
  const declared = useDeclaredTroop(parsed?.success ? parsed.data : null);

  if (!state?.troop || !parsed?.success || !declared) {
    return <Navigate to="/batches/external" replace />;
  }

  const values = parsed.data;
  const short = draft.counts.total > 0 && draft.counts.total < values.head_count;

  const submit = () => {
    draft.setHeaderErrors([]);
    draft.setRowErrors([]);
    register.mutate(
      {
        ...toEntryOrderPayload(values),
        dte: draft.payload(),
        close_incomplete_reason: short && closeNow ? closeReason.trim() || null : null
      },
      {
        onSuccess: (result) => navigate(`/entry-orders?orderId=${result.order.id}`, { replace: true }),
        onError: (error) => {
          const body = entryOrderApiError(error);

          draft.setHeaderErrors(
            (body?.header_errors ?? []).length > 0
              ? body!.header_errors!
              : Object.entries(body?.errors ?? {})
                  .filter(([field]) => field.startsWith('dte.'))
                  .map(([field, messages]) => ({ field: field.replace('dte.', ''), code: 'INVALID', message: messages[0] }))
          );
          draft.setRowErrors(body?.row_errors ?? []);
          toast.error(entryOrderErrorMessage(error, 'No se pudo registrar el ingreso'));
        }
      }
    );
  };

  return (
    <ViewLayout
      title="Registrar ingreso"
      subtitle="La hacienda llegó con su DTE: se crean la orden, el lote externo y las caravanas en un solo paso."
      actions={
        <Button
          variant="text"
          onClick={() => navigate('/batches/external')}
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrow-left</FuseSvgIcon>}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Volver a lotes externos
        </Button>
      }
    >
      <Stack spacing={3} sx={{ maxWidth: 1200 }}>
        <EntryTroopSummaryCard title="Tropa comprada" subtitle={declared.subtitle} items={declared.items} onEdit={() => setIsEditing(true)} />

        <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '8px', p: 2.5 }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>DTE</Typography>
          <DteEntryForm draft={draft} troop={declared.context} />
        </Paper>

        {short && (
          <Alert severity="warning" sx={{ borderRadius: '6px' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              El DTE trae {draft.counts.total} de {values.head_count} cabezas. La orden queda en "DTE parcial", esperando otro documento.
            </Typography>
            <FormControlLabel
              control={<Checkbox size="small" checked={closeNow} onChange={(e) => setCloseNow(e.target.checked)} />}
              label={<Typography variant="body2">No llegarán más DTE: cerrarla incompleta ahora</Typography>}
            />
            {closeNow && (
              <TextField
                size="small"
                fullWidth
                label="Motivo"
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                placeholder="Ej: murió un animal en el viaje"
                sx={{ mt: 1, bgcolor: 'background.paper' }}
              />
            )}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button onClick={() => navigate('/batches/external')} disabled={register.isPending} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={submit}
            disabled={
              register.isPending ||
              draft.rows.length === 0 ||
              draft.dteNumber.trim() === '' ||
              (short && closeNow && closeReason.trim().length < 3)
            }
            sx={{ px: 3, fontWeight: 700, borderRadius: '6px', textTransform: 'none' }}
          >
            {register.isPending ? 'Registrando…' : `Registrar ingreso (${draft.rows.length})`}
          </Button>
        </Box>
      </Stack>

      <CreateExternalBatchDialog
        open={isEditing}
        mode="register"
        initialValues={state.troop}
        onClose={() => setIsEditing(false)}
        onContinue={(troop) => {
          setIsEditing(false);
          navigate(location.pathname, { replace: true, state: { troop } satisfies RegisterEntryState });
        }}
      />
    </ViewLayout>
  );
};

export default RegisterEntryConfirmView;
