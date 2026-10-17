import { useState } from 'react';
import { Badge, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { SHRUNK_CONDITION_LABELS, ShrunkCondition, WeighingType } from '@/core/weighing/domain/entities/Weighing';
import { BatchWeighingFormErrors, BatchWeighingFormState } from './batchWeighingFormModel';
import { SmallDialog } from './SmallDialog';

interface BatchWeighingHeaderFieldsProps {
  form: BatchWeighingFormState;
  errors: BatchWeighingFormErrors;
  types: WeighingType[];
  onChange: (patch: Partial<BatchWeighingFormState>) => void;
  onAssignResponsible?: () => void;
}

const compactSx = { '& .MuiFilledInput-root': { bgcolor: 'action.hover' } } as const;

const actionIconSx = {
  width: 48,
  height: 48,
  borderRadius: '6px',
  bgcolor: (theme: any) => alpha(theme.palette.primary.main, 0.08),
  color: 'primary.main',
  flexShrink: 0,
  '&:hover': {
    bgcolor: (theme: any) => alpha(theme.palette.primary.main, 0.16),
  },
} as const;

/** Why, when and on which gut-fill basis the batch was weighed, in two compact rows. */
export function BatchWeighingHeaderFields({
  form,
  errors,
  types,
  onChange,
  onAssignResponsible,
}: BatchWeighingHeaderFieldsProps) {
  const [responsibleOpen, setResponsibleOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const selected = types.find((t) => t.code === form.type);
  const calculated = form.shrunkCondition === 'CALCULATED';

  const changeType = (code: string) => {
    const type = types.find((t) => t.code === code);
    onChange({
      type: type?.code ?? form.type,
      shrunkCondition: type?.default_shrunk_condition ?? form.shrunkCondition,
      shrinkPct: '',
    });
  };

  const handleResponsibleClick = onAssignResponsible ?? (() => setResponsibleOpen(true));

  const openNote = () => {
    setDraft(form.observations);
    setNoteOpen(true);
  };

  return (
    <>
      <Stack spacing={1.5}>
        {/* Fila 1: Tipo de pesaje y Desbaste */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
          <TextField
            select
            size="small"
            label="Tipo de pesaje"
            value={form.type}
            onChange={(e) => changeType(e.target.value)}
            variant="filled"
            sx={{ ...compactSx, flex: 1, minWidth: 0, width: '100%' }}
          >
            {types.map((t) => (
              <MenuItem key={t.code} value={t.code}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Desbaste"
            value={form.shrunkCondition}
            onChange={(e) => onChange({ shrunkCondition: e.target.value as ShrunkCondition, shrinkPct: '' })}
            variant="filled"
            sx={{
              ...compactSx,
              flex: calculated ? undefined : 1,
              width: calculated ? { xs: '100%', sm: 180 } : '100%',
              minWidth: 0,
            }}
          >
            {(Object.keys(SHRUNK_CONDITION_LABELS) as ShrunkCondition[]).map((c) => (
              <MenuItem key={c} value={c}>
                {SHRUNK_CONDITION_LABELS[c]}
              </MenuItem>
            ))}
          </TextField>

          {calculated && (
            <TextField
              size="small"
              label="%"
              type="number"
              value={form.shrinkPct}
              onChange={(e) => onChange({ shrinkPct: e.target.value })}
              variant="filled"
              required
              inputProps={{ min: 0, max: 30, step: 0.5 }}
              error={!!errors.shrinkPct}
              helperText={errors.shrinkPct}
              sx={{ ...compactSx, width: { xs: '100%', sm: 80 }, flexShrink: 0 }}
            />
          )}
        </Stack>

        {selected?.description && (
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: -0.5, display: 'block' }}>
            {selected.description}
          </Typography>
        )}

        {/* Fila 2: Fecha, Hora y Acciones de Icono (Responsable, Observación) */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
          <TextField
            size="small"
            label="Fecha"
            type="date"
            value={form.date}
            onChange={(e) => onChange({ date: e.target.value })}
            variant="filled"
            required
            InputLabelProps={{ shrink: true }}
            error={!!errors.date}
            helperText={errors.date}
            sx={{ ...compactSx, flex: 1, minWidth: 0, width: '100%' }}
          />

          <TextField
            size="small"
            label="Hora"
            type="time"
            value={form.time}
            onChange={(e) => onChange({ time: e.target.value })}
            variant="filled"
            InputLabelProps={{ shrink: true }}
            sx={{ ...compactSx, width: { xs: '100%', sm: 110 }, flexShrink: 0 }}
          />

          <Stack direction="row" spacing={1} sx={{ alignSelf: 'flex-start', flexShrink: 0 }}>
            <Tooltip title="Asignar responsable">
              <IconButton onClick={handleResponsibleClick} sx={actionIconSx} size="small">
                <FuseSvgIcon size={20}>heroicons-outline:user-plus</FuseSvgIcon>
              </IconButton>
            </Tooltip>

            <Tooltip title={form.observations ? 'Editar observación' : 'Agregar observación'}>
              <IconButton onClick={openNote} sx={actionIconSx} size="small">
                <Badge color="primary" variant="dot" invisible={!form.observations}>
                  <FuseSvgIcon size={20}>heroicons-outline:chat-bubble-bottom-center-text</FuseSvgIcon>
                </Badge>
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>

      {!onAssignResponsible && (
        <SmallDialog open={responsibleOpen} title="Asignar responsable" onClose={() => setResponsibleOpen(false)} />
      )}

      <SmallDialog
        open={noteOpen}
        title="Observación"
        confirmLabel="Guardar"
        onClose={() => setNoteOpen(false)}
        onConfirm={() => {
          onChange({ observations: draft.trim() });
          setNoteOpen(false);
        }}
      >
        <TextField
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ej.: se pesó después de la lluvia, piso de la jaula con barro."
          variant="filled"
          multiline
          minRows={3}
          fullWidth
          hiddenLabel
          sx={{ '& .MuiFilledInput-root': { bgcolor: 'action.hover' } }}
        />
      </SmallDialog>
    </>
  );
}
