import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { InstitutionMetaFields } from '../../institutions/InstitutionMetaFields';
import {
  InstitutionMeta,
  SampleDestinationPlan,
  SAMPLE_DESTINATION_PLAN_LABELS,
} from '@/core/veterinary/domain/VeterinaryTypes';

/** ADR-23: how the act reaches the professional who has to sign it. */
export type SheetSignatureDelivery = 'PORTAL_INBOX' | 'SIGNATURE_LINK';

/**
 * ADR-16: how wide the temporary grant is.
 *
 * `ACT` is the narrowest and the default — a one-shot credential for one document, so a link
 * that leaks or gets forwarded exposes that act and nothing else. `STANDING` is for the
 * professional you work with every campaign: one link, all their acts, and no new credential
 * every time a sheet closes.
 */
export type SignatureLinkScope = 'ACT' | 'STANDING';

export interface SheetCloseValues {
  /** ADR-39: the centre the professional is working with. Optional. */
  institution: InstitutionMeta;
  /** ADR-40: an intention declared here, where the professional actually knows it. */
  destination_plan: SampleDestinationPlan;
  dispatch_note_number: string;
  dispatched_at: string;
  observations: string;
  signature_delivery: SheetSignatureDelivery;
  /** Only used when the act travels as a temporary signature link. */
  signature_link_scope: SignatureLinkScope;
  recipient_email: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: SheetCloseValues) => void;
  isSaving: boolean;
  bullsCount: number;
  tubesCount: number;
  veterinarianName?: string;
  /** ADR-23: whether the professional has a portal account, which decides the delivery. */
  hasPortalAccount: boolean;
  professionalEmail?: string | null;
  /**
   * A standing grant this professional already holds, if any. Its plaintext is long gone — only
   * its hash is stored — so what this enables is not reusing the secret but NOT minting a second
   * credential for somebody who can already get in.
   */
  standingGrantExpiresAt?: string | null;
}

/**
 * Closing the sheet.
 *
 * ADR-18: this screen never signs, and it no longer pretends to. The old radio offered "the M.V.
 * is at the chute and signs now", which produced exactly the same unsigned row as the other
 * option and then redirected the producer to a portal they cannot open — the label asserted a
 * fact the system had not captured, while the snackbar on the same screen said the opposite.
 *
 * ADR-23: what genuinely has to be decided here is how the act is DELIVERED for signature. The
 * system never waits for the professional to stumble upon it.
 */
export const SheetCloseDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  isSaving,
  bullsCount,
  tubesCount,
  veterinarianName,
  hasPortalAccount,
  professionalEmail,
  standingGrantExpiresAt,
}) => {
  const [showInstitution, setShowInstitution] = useState(false);
  const [values, setValues] = useState<SheetCloseValues>({
    institution: { nombre: '', cuit: '' },
    destination_plan: 'UNDECIDED',
    dispatch_note_number: '',
    dispatched_at: '',
    observations: '',
    // Defaults to whatever the professional can actually receive.
    signature_delivery: hasPortalAccount ? 'PORTAL_INBOX' : 'SIGNATURE_LINK',
    // ADR-16: the narrow grant stays the default. Widening it is a deliberate choice about a
    // professional, not the side effect of closing one sheet.
    signature_link_scope: 'ACT',
    recipient_email: professionalEmail ?? '',
  });

  // Typed per field: the form now holds an institution object alongside the strings, and a
  // `string` signature here would have silently accepted it.
  const set = <K extends keyof SheetCloseValues>(field: K, value: SheetCloseValues[K]) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleToggleInstitution = (checked: boolean) => {
    setShowInstitution(checked);
    if (!checked) {
      set('institution', { nombre: '', cuit: '', codigo_oficial: '', direccion: '' });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
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
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
          Cerrar planilla y emitir acta
        </Typography>
        <IconButton onClick={onClose} size="small" disabled={isSaving} sx={{ color: 'primary.main' }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Alert severity="info" sx={{ borderRadius: '6px' }}>
            Se emitirá <strong>un acta de extracción</strong> con {bullsCount}{' '}
            {bullsCount === 1 ? 'reproductor' : 'reproductores'} y {tubesCount}{' '}
            {tubesCount === 1 ? 'tubo' : 'tubos'}, a nombre de{' '}
            <strong>{veterinarianName ?? 'el profesional seleccionado'}</strong>. El número de acta lo
            genera el sistema.
          </Alert>

          {tubesCount === 0 && (
            <Alert severity="warning" sx={{ borderRadius: '6px' }}>
              Esta planilla <strong>no marcó ningún tubo</strong>. El acta va a documentar sólo la
              biometría de manga: no va a aparecer en la bandeja de llegada de muestras ni va a poder
              recibir un informe de laboratorio, porque no hay muestra que analizar. Si esperabas
              extraer, volvé a la planilla y tildá el raspaje o la serología en cada fila.
            </Alert>
          )}

          {/* ADR-39: Selector para declarar institución o laboratorio */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: '8px',
              border: 1,
              borderColor: showInstitution ? 'primary.main' : 'divider',
              bgcolor: 'action.hover',
              transition: 'border-color 0.2s ease',
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={showInstitution}
                  onChange={(e) => handleToggleInstitution(e.target.checked)}
                  disabled={isSaving}
                  size="small"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Declarar institución o laboratorio de análisis (opcional)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Habilitar datos de identificación (Nombre, CUIT, Código oficial SENASA/RENALAB y Dirección).
                  </Typography>
                </Box>
              }
              sx={{ m: 0, width: '100%', alignItems: 'flex-start' }}
            />

            <Collapse in={showInstitution} unmountOnExit>
              <Box sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                <InstitutionMetaFields
                  value={values.institution}
                  onChange={(institution) => set('institution', institution)}
                  disabled={isSaving}
                />
              </Box>
            </Collapse>
          </Box>

          {/* ADR-40: es una intención, no una regla. El informe puede contradecirla. */}
          <TextField
            select
            label="Destino previsto de las muestras"
            value={values.destination_plan}
            onChange={(e) => set('destination_plan', e.target.value as SampleDestinationPlan)}
            disabled={isSaving}
            variant="filled"
            size="small"
            sx={{ bgcolor: 'action.hover' }}
            helperText="Lo que se piensa hacer con los tubos. Si después cambia, el informe manda: nada queda mal por esto."
          >
            {(Object.keys(SAMPLE_DESTINATION_PLAN_LABELS) as SampleDestinationPlan[]).map((plan) => (
              <MenuItem key={plan} value={plan}>
                {SAMPLE_DESTINATION_PLAN_LABELS[plan]}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="N° de remito (opcional)"
              value={values.dispatch_note_number}
              onChange={(e) => set('dispatch_note_number', e.target.value)}
              variant="filled"
              size="small"
              sx={{ bgcolor: 'action.hover', flex: 1 }}
              helperText="El papel que acompaña la conservadora."
            />
            <TextField
              type="date"
              label="Fecha de despacho (opcional)"
              value={values.dispatched_at}
              onChange={(e) => set('dispatched_at', e.target.value)}
              variant="filled"
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: 'action.hover', flex: 1 }}
              helperText="Cuándo salieron los tubos."
            />
          </Stack>

          <TextField
            label="Observaciones del acta"
            value={values.observations}
            onChange={(e) => set('observations', e.target.value)}
            variant="filled"
            size="small"
            multiline
            rows={2}
            sx={{ bgcolor: 'action.hover' }}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              ¿Cómo le llega el acta al profesional para que la firme?
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              La firma ocurre en el portal, desde cualquier lugar y en cualquier momento posterior. Esta
              pantalla no firma nada.
            </Typography>

            <RadioGroup
              value={values.signature_delivery}
              onChange={(e) => set('signature_delivery', e.target.value as SheetSignatureDelivery)}
            >
              <FormControlLabel
                value="PORTAL_INBOX"
                disabled={!hasPortalAccount}
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Queda en su bandeja del portal
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {hasPortalAccount
                        ? 'El profesional entra con su usuario y la firma cuando puede.'
                        : 'Este profesional no tiene usuario en el sistema: no tiene bandeja.'}
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="SIGNATURE_LINK"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Enviar un enlace de firma acotado a esta acta
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Vence en 72 horas y sólo abre esta acta. Si vence, se reemite.
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>

            {values.signature_delivery === 'SIGNATURE_LINK' && (
              <Box sx={{ mt: 1.5, pl: 3.5 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  ¿Hasta dónde llega ese enlace?
                </Typography>

                <RadioGroup
                  value={values.signature_link_scope}
                  onChange={(e) => set('signature_link_scope', e.target.value as SignatureLinkScope)}
                >
                  <FormControlLabel
                    value="ACT"
                    control={<Radio size="small" />}
                    label={
                      <Typography variant="body2">
                        Sólo esta acta · 72 horas
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Si el enlace se reenvía o se filtra, no abre nada más.
                        </Typography>
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="STANDING"
                    control={<Radio size="small" />}
                    label={
                      <Typography variant="body2">
                        Todas sus actas · 30 días
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Para el profesional con el que se trabaja seguido: un solo enlace, sin uno nuevo por cada manga.
                        </Typography>
                      </Typography>
                    }
                  />
                </RadioGroup>

                {values.signature_link_scope === 'STANDING' && standingGrantExpiresAt && (
                  <Alert severity="info" sx={{ borderRadius: '6px', mt: 1 }}>
                    Este profesional <strong>ya tiene un acceso vigente</strong> hasta el{' '}
                    <strong>{standingGrantExpiresAt}</strong>, que abre todas sus actas — esta incluida. No se
                    va a emitir otro. Si perdió el enlace, se reemite desde el panel de accesos temporales.
                  </Alert>
                )}
              </Box>
            )}

            {values.signature_delivery === 'SIGNATURE_LINK' && !(
              values.signature_link_scope === 'STANDING' && standingGrantExpiresAt
            ) && (
              <TextField
                type="email"
                label="Correo del profesional"
                value={values.recipient_email}
                onChange={(e) => set('recipient_email', e.target.value)}
                variant="filled"
                size="small"
                fullWidth
                sx={{ bgcolor: 'action.hover', mt: 1.5 }}
                helperText="Si se deja vacío, el enlace se genera igual y se muestra para copiar."
              />
            )}
          </Box>

          <Alert severity="warning" sx={{ borderRadius: '6px' }}>
            El acta nace <strong>sin firmar</strong>. Hasta que el profesional la firme y alguien declare la
            llegada de los tubos, sus muestras <strong>no habilitan el entore</strong>.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', gap: 1.5 }}
      >
        <Button onClick={onClose} variant="text" disabled={isSaving} sx={{ fontWeight: 600, textTransform: 'none' }}>
          Volver a la planilla
        </Button>
        <Button
          onClick={() => onConfirm(values)}
          variant="contained"
          disabled={isSaving}
          sx={{
            px: 4,
            fontWeight: 700,
            borderRadius: '6px',
            textTransform: 'none',
            boxShadow: 'none',
          }}
        >
          {isSaving ? 'Emitiendo acta...' : 'Emitir acta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
