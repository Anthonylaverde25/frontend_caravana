import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { useCreateEntryOrder, useUpdateEntryOrderDraft } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { EntryOrder, EntryOrderResult, entryOrderApiError, entryOrderErrorMessage } from '@/features/entry-orders/types';
import {
  ExternalBatchFormInput,
  ExternalBatchFormValues,
  emptyExternalBatchForm,
  externalBatchSchema,
  formFromOrder,
  toEntryOrderPayload
} from './externalBatchSchema';
import { ExternalBatchForm, ExternalFormSection, filledSx } from './externalFormParts';
import ExternalOriginSection from './ExternalOriginSection';
import ExternalBatchSection from './ExternalBatchSection';
import ExternalTroopSection from './ExternalTroopSection';
import ExternalBreedsEditor from './ExternalBreedsEditor';
import ExternalWeightsHealthSection from './ExternalWeightsHealthSection';

export type ExternalBatchDialogMode = 'order' | 'register';

interface CreateExternalBatchDialogProps {
  open: boolean;
  onClose: () => void;
  /**
   * `order`: the purchase is closed and the DTE has not arrived ("Guardar borrador" / "Confirmar
   * compra"). `register`: the DTE is in hand, so the form only gathers the troop and hands it to
   * the confirmation, where the DTE is loaded ("Continuar").
   */
  mode: ExternalBatchDialogMode;
  /** A draft to keep editing. */
  draft?: EntryOrder | null;
  /** The troop already declared, when coming back from the confirmation to edit it. */
  initialValues?: ExternalBatchFormInput | null;
  onSaved?: (result: EntryOrderResult) => void;
  onContinue?: (values: ExternalBatchFormInput) => void;
}

/**
 * "Alta de Lote Externo": declares a purchase — origin, batch name, troop, breeds, weights and
 * health — and creates its entry order. A confirmed purchase creates the batch empty, waiting for
 * its DTE. The batch is not classified here: its animals enter the productive flow only when they
 * are assigned to an own batch, which is the one that declares activity and type.
 */
export const CreateExternalBatchDialog: React.FC<CreateExternalBatchDialogProps> = ({
  open,
  onClose,
  mode,
  draft,
  initialValues,
  onSaved,
  onContinue
}) => {
  const create = useCreateEntryOrder();
  const update = useUpdateEntryOrderDraft();
  const form = useForm<ExternalBatchFormInput, unknown, ExternalBatchFormValues>({
    resolver: zodResolver(externalBatchSchema),
    defaultValues: emptyExternalBatchForm()
  }) as ExternalBatchForm;
  const { register, handleSubmit, reset, setError, formState } = form;
  const isPending = create.isPending || update.isPending;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) reset(draft ? formFromOrder(draft) : (initialValues ?? emptyExternalBatchForm()));
  }, [open, draft, initialValues, reset]);

  /** Server errors back onto their fields: form validation, domain errors with a field, or a toast. */
  const showServerError = (error: unknown) => {
    const body = entryOrderApiError(error);

    if (body?.errors) {
      Object.entries(body.errors).forEach(([field, messages]) =>
        setError(field as keyof ExternalBatchFormInput, {
          message: messages[0]
        })
      );
      return;
    }

    if (body?.field) {
      setError(body.field as keyof ExternalBatchFormInput, {
        message: body.message
      });
    }

    toast.error(entryOrderErrorMessage(error, 'No se pudo guardar la orden de ingreso'));
  };

  /** A long form: the first field the validation marked is brought into view. */
  const revealFirstError = () =>
    requestAnimationFrame(() => contentRef.current?.querySelector('.Mui-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));

  const save = (confirm: boolean) =>
    handleSubmit((values) => {
      if (mode === 'register') {
        onContinue?.(form.getValues());
        return;
      }

      const payload = { ...toEntryOrderPayload(values), confirm };
      const handlers = {
        onSuccess: (result: EntryOrderResult) => {
          onSaved?.(result);
          onClose();
        },
        onError: showServerError
      };

      if (draft) update.mutate({ id: draft.id, payload }, handlers);
      else create.mutate(payload, handlers);
    }, revealFirstError);

  const title = draft ? `Borrador ${draft.code}` : mode === 'register' ? 'Registrar ingreso de hacienda externa' : 'Alta de lote externo';

  const dteNote =
    mode === 'register'
      ? 'El DTE ya está en mano: después de la tropa se cargan sus caravanas.'
      : 'La orden nace sin caravanas: el lote queda en espera del DTE.';

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
    >
      <Box
        sx={{
          p: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" disabled={isPending} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent ref={contentRef} sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Stack spacing={4}>
          <ExternalOriginSection form={form} />
          <ExternalBatchSection form={form} open={open} orderNumber={draft?.number} dteNote={dteNote} />
          <ExternalTroopSection form={form} />
          <ExternalBreedsEditor form={form} />
          <ExternalWeightsHealthSection form={form} />
          <ExternalFormSection title="Compra">
            <Stack direction="row" spacing={2}>
              <TextField
                {...register('purchase_date')}
                label="Fecha de compra"
                type="date"
                variant="filled"
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: new Date().toISOString().slice(0, 10) }}
                error={!!formState.errors.purchase_date}
                helperText={formState.errors.purchase_date?.message}
                sx={{ ...filledSx, flex: 1 }}
              />
              <TextField {...register('responsable')} label="Responsable" variant="filled" sx={{ ...filledSx, flex: 1 }} />
            </Stack>
            <TextField {...register('observations')} label="Observaciones" variant="filled" fullWidth multiline rows={3} sx={filledSx} />
          </ExternalFormSection>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          px: 3,
          bgcolor: 'background.default',
          borderTop: 1,
          borderColor: 'divider',
          gap: 1.5
        }}
      >
        <Button
          onClick={onClose}
          disabled={isPending}
          variant="text"
          sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
        >
          Cancelar
        </Button>
        {mode === 'order' && (
          <Button
            onClick={save(false)}
            disabled={isPending}
            variant="outlined"
            sx={{ fontWeight: 600, borderRadius: '6px', textTransform: 'none' }}
          >
            {draft ? 'Guardar cambios' : 'Guardar borrador'}
          </Button>
        )}
        <Button
          onClick={save(true)}
          disabled={isPending}
          variant="contained"
          endIcon={mode === 'register' ? <FuseSvgIcon size={16}>heroicons-outline:arrow-right</FuseSvgIcon> : undefined}
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 4,
            fontWeight: 700,
            borderRadius: '6px',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          {isPending ? 'Guardando...' : mode === 'register' ? 'Continuar con el DTE' : 'Confirmar compra'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateExternalBatchDialog;
