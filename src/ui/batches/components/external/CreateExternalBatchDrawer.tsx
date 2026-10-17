import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { useCreateEntryOrder, useUpdateEntryOrderDraft } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import {
  EntryOrder,
  EntryOrderResult,
  StoreEntryOrderPayload,
  entryOrderApiError,
  entryOrderErrorMessage
} from '@/features/entry-orders/types';
import {
  ExternalBatchFormInput,
  ExternalBatchFormValues,
  draftErrorsOf,
  emptyExternalBatchForm,
  externalBatchSchema,
  formFromOrder,
  toDraftPayload,
  toEntryOrderPayload
} from './externalBatchSchema';
import { ExternalBatchForm } from './externalFormParts';
import ExternalOriginSection from './ExternalOriginSection';
import ExternalPurchaseSection from './ExternalPurchaseSection';
import ExternalTroopSection from './ExternalTroopSection';
import ExternalBreedsEditor from './ExternalBreedsEditor';
import ExternalDestinationSection from './destination/ExternalDestinationSection';
import ExternalBatchSection from './ExternalBatchSection';
import ExternalWeightsHealthSection from './ExternalWeightsHealthSection';
import type { ExternalBatchDialogMode } from './CreateExternalBatchDialog';

export interface CreateExternalBatchDrawerProps {
  open: boolean;
  onClose: () => void;
  mode?: ExternalBatchDialogMode;
  draft?: EntryOrder | null;
  initialValues?: ExternalBatchFormInput | null;
  onSaved?: (result: EntryOrderResult) => void;
  onContinue?: (values: ExternalBatchFormInput) => void;
}

/**
 * Slide-over drawer for "Nueva orden de ingreso" (ING-02).
 * Adheres strictly to canonical MUI filled fields (<TextField label="..." variant="filled" />)
 * ensuring floating labels animate cleanly without clipping or breaking.
 */
export const CreateExternalBatchDrawer: React.FC<CreateExternalBatchDrawerProps> = ({
  open,
  onClose,
  mode = 'order',
  draft,
  initialValues,
  onSaved,
  onContinue
}) => {
  const theme = useTheme();
  const create = useCreateEntryOrder();
  const update = useUpdateEntryOrderDraft();

  const form = useForm<ExternalBatchFormInput, unknown, ExternalBatchFormValues>({
    resolver: zodResolver(externalBatchSchema),
    defaultValues: emptyExternalBatchForm()
  }) as ExternalBatchForm;

  const { handleSubmit, reset, setError, clearErrors } = form;
  const isPending = create.isPending || update.isPending;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      reset(draft ? formFromOrder(draft) : (initialValues ?? emptyExternalBatchForm()));
    }
  }, [open, draft, initialValues, reset]);

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

  const revealFirstError = () =>
    requestAnimationFrame(() =>
      contentRef.current?.querySelector('.Mui-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    );

  const send = (payload: StoreEntryOrderPayload) => {
    const handlers = {
      onSuccess: (result: EntryOrderResult) => {
        onSaved?.(result);
        onClose();
      },
      onError: showServerError
    };

    if (draft) update.mutate({ id: draft.id, payload }, handlers);
    else create.mutate(payload, handlers);
  };

  const save = (confirm: boolean) =>
    handleSubmit((values) => {
      if (mode === 'register') {
        onContinue?.(form.getValues());
        return;
      }

      send({ ...toEntryOrderPayload(values), confirm });
    }, revealFirstError);

  const saveDraft = () => {
    const input = form.getValues();
    const errors = Object.entries(draftErrorsOf(input));

    clearErrors();

    if (errors.length > 0) {
      errors.forEach(([field, message]) => setError(field as keyof ExternalBatchFormInput, { message }));
      revealFirstError();
      return;
    }

    send({ ...toDraftPayload(input), confirm: false });
  };

  const title = draft
    ? `Borrador ${draft.code}`
    : mode === 'register'
      ? 'Registrar ingreso de hacienda externa'
      : 'Nueva orden de ingreso';

  const dteNote =
    mode === 'register'
      ? 'El DTE ya está en mano: después de la tropa se cargan sus caravanas.'
      : 'La orden nace sin caravanas: queda en espera del DTE.';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={isPending ? undefined : onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 700, md: 800 },
          maxWidth: '100vw',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderLeft: 1,
          borderColor: 'divider',
          boxShadow: theme.shadows[16]
        }
      }}
    >
      {/* 1. Header Limpio y Profesional */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          p: 2.5,
          px: { xs: 2.5, sm: 3.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 2
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.675rem',
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'block',
              mb: 0.25
            }}
          >
            Compras y Recepción · ING-02
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 700, color: 'text.primary' }}>
              {title}
            </Typography>
            <Chip
              label={draft ? 'Borrador' : 'Nueva Compra'}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: 'action.hover',
                color: 'text.primary',
                border: 1,
                borderColor: 'divider'
              }}
            />
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontSize: '0.825rem' }}>
            {dteNote}
          </Typography>
        </Box>

        <IconButton onClick={onClose} size="small" disabled={isPending} sx={{ color: 'text.secondary' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      {/* 2. Cuerpo del Formulario con TextFields Filled Nativos (Sin Overrides que Rompan Labels) */}
      <Box
        ref={contentRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: 'background.paper',

          // Secciones de dominio con encabezados claros y organizados
          '& section': {
            mb: 4.5,
            '&:last-of-type': { mb: 2 },
            '& > .MuiStack-root:first-of-type': {
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 1,
              mb: 2.5,
              minHeight: 32,
              '& .MuiTypography-root': {
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                '&::before': {
                  content: '""',
                  display: 'inline-block',
                  width: 3.5,
                  height: 16,
                  bgcolor: 'primary.main',
                  mr: 1.25,
                  borderRadius: '2px'
                }
              }
            }
          }
        }}
      >
        <Stack spacing={4}>
          {/* 1. Origen */}
          <ExternalOriginSection form={form} />

          {/* 2. Tropa y Categorías */}
          <ExternalTroopSection form={form} />

          {/* 3. Razas y Pelajes */}
          <ExternalBreedsEditor form={form} />

          {/* 4. Destino de los Animales y Lote */}
          <Box>
            <ExternalDestinationSection form={form} />
            <Box sx={{ mt: 2.5 }}>
              <ExternalBatchSection form={form} open={open} orderNumber={draft?.number} dteNote={dteNote} />
            </Box>
          </Box>

          {/* 5. Peso y Sanidad */}
          <ExternalWeightsHealthSection form={form} />

          {/* 6. Datos de Compra */}
          <ExternalPurchaseSection form={form} />
        </Stack>
      </Box>

      {/* 3. Footer Fijo con Acciones */}
      <Box
        sx={{
          p: 2,
          px: { xs: 2.5, sm: 3.5 },
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          zIndex: 2
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
          <FuseSvgIcon size={16}>heroicons-outline:information-circle</FuseSvgIcon>
          <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            Los campos marcados con (*) son obligatorios para confirmar
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            onClick={onClose}
            disabled={isPending}
            variant="text"
            sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'none' }}
          >
            Cancelar
          </Button>

          {mode === 'order' && (
            <Button
              onClick={saveDraft}
              disabled={isPending}
              variant="outlined"
              sx={{
                fontWeight: 600,
                borderRadius: '6px',
                textTransform: 'none',
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'text.secondary' }
              }}
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
              px: 3.5,
              fontWeight: 700,
              borderRadius: '6px',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {isPending ? 'Guardando...' : mode === 'register' ? 'Continuar con el DTE' : 'Confirmar compra'}
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default CreateExternalBatchDrawer;
