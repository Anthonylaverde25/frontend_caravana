import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  MenuItem,
  Paper,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useContrastTheme } from '@/contexts/ContrastThemeContext';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useBirthHistory } from '@/features/gestation/hooks/useBirthHistory';
import {
  WEANING_TYPES,
  WEANING_TYPE_LABELS,
  WeaningDestinationMode,
  WeaningOrderCategoryMode,
  WeaningType
} from '@/features/weaning-orders/types';
import {
  DestinationDraft,
  newDestination,
  WeaningFormHeader,
  WeaningFormMode,
  WeaningOrderStart
} from '../../hooks/useWeaningOrderForm';
import { filledInputProps, sectionTitleSx } from '../form/formStyles';
import WeaningCalvesByBatchSelector from './WeaningCalvesByBatchSelector';
import WeaningBatchSelectField, { WeaningBatchOption } from './WeaningBatchSelectField';

/** The slide-up of the Material UI full-screen dialog. */
const SlideUp = forwardRef(function SlideUp(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface WeaningOrderStartDialogProps {
  open: boolean;
  mode: WeaningFormMode;
  /** What was already declared: calves chosen in Partos, or the order coming back from its confirmation. */
  initial?: WeaningOrderStart | null;
  onClose: () => void;
  /** After the slide-down, when the page may leave the route. */
  onExited?: () => void;
}


const today = (): string => new Date().toISOString().slice(0, 10);

const emptyHeader = (): WeaningFormHeader => ({ weaningDate: today(), weaningType: '', responsable: '', observations: '' });

/**
 * "Nueva orden de destete" / "Registrar destete" (`/weaning-orders/new`, `/weaning-orders/register`):
 * everything the order says as a whole — the calves (chosen by batch), where they go, how and when
 * they are weaned. The confirmation (`…/confirm`) only shows it and asks what is said calf by calf.
 */
export const WeaningOrderStartDialog: React.FC<WeaningOrderStartDialogProps> = ({ open, mode, initial, onClose, onExited }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings: contrast } = useContrastTheme();
  // The brand of the app bar (ToolbarLayout1): the header colour, or the primary one of the buttons.
  const barBg = (contrast.enabled && (contrast.headerBg || contrast.primaryButtonBg)) || 'primary.main';
  const barText = (contrast.enabled && contrast.headerBg && contrast.headerText) || 'common.white';

  const { data: births = [], isLoading } = useBirthHistory();
  const { data: batches = [], isLoading: isLoadingBatches } = useBatches(undefined, 'WEANING');
  const [calfIds, setCalfIds] = useState<number[]>([]);
  const [destinationMode, setDestinationMode] = useState<WeaningDestinationMode>('single');
  const [batchIds, setBatchIds] = useState<number[]>([]);
  // A draft may carry a batch to create at weaning (older orders): kept until it is removed.
  const [pendingNew, setPendingNew] = useState<DestinationDraft[]>([]);
  const [header, setHeader] = useState<WeaningFormHeader>(emptyHeader);
  const [categoryMode, setCategoryMode] = useState<WeaningOrderCategoryMode>('KEEP');
  // One batch per calf, all of them written at the chute: the order declares no batch (orders only).
  const [lotsAtChute, setLotsAtChute] = useState(false);

  useEffect(() => {
    if (!open) return;

    const destinations = initial?.destinations ?? [];
    setCalfIds(initial?.calfIds ?? []);
    setDestinationMode(initial?.destinationMode ?? 'single');
    setBatchIds(destinations.filter((d) => d.kind === 'existing' && d.batchId != null).map((d) => d.batchId as number));
    setPendingNew(destinations.filter((d) => d.kind === 'new'));
    setHeader(initial?.header ?? emptyHeader());
    setCategoryMode(initial?.categoryMode ?? 'KEEP');
    setLotsAtChute(mode === 'order' && initial?.destinationMode === 'per_animal' && destinations.length === 0);
  }, [open]);

  const weaningBatches = useMemo<WeaningBatchOption[]>(
    () =>
      batches
        .filter((b) => b.is_active && b.batch_type_code === 'WEANING')
        .map((b) => ({ id: Number(b.id), name: b.name, caravans_count: b.caravans_count, is_confined: b.is_confined })),
    [batches]
  );


  const setField = <K extends keyof WeaningFormHeader>(field: K, value: WeaningFormHeader[K]) =>
    setHeader((prev) => ({ ...prev, [field]: value }));

  const single = destinationMode === 'single';
  const atChute = !single && lotsAtChute && mode === 'order';
  const singleIsPending = single && batchIds.length === 0 && pendingNew.length > 0;

  const problems: string[] = [];
  if (calfIds.length === 0) problems.push('Elegí al menos una cría.');
  if (single && batchIds.length === 0 && !singleIsPending) problems.push('Elegí el lote de destete, o creá uno nuevo desde la lista.');
  if (!single && !atChute && batchIds.length + pendingNew.length === 0) problems.push('Elegí los lotes entre los que se reparten las crías.');
  if (!header.weaningDate) problems.push('Indicá la fecha del destete.');
  if (mode === 'register' && header.weaningDate > today()) problems.push('La fecha de un destete registrado no puede ser futura.');

  /** The declared batches, keeping the key each one already had so calves keep their batch. */
  const destinations = (): DestinationDraft[] => {
    const previous = initial?.destinations ?? [];
    const existing = batchIds.map(
      (batchId) =>
        previous.find((d) => d.kind === 'existing' && d.batchId === batchId) ?? { ...newDestination(), kind: 'existing' as const, batchId }
    );

    if (single) return existing.length > 0 ? existing.slice(0, 1) : pendingNew.slice(0, 1);

    if (atChute) return [];

    return [...existing, ...pendingNew];
  };

  const proceed = () => {
    const start: WeaningOrderStart = {
      orderId: initial?.orderId ?? null,
      orderCode: initial?.orderCode ?? null,
      calfIds,
      destinationMode,
      destinations: destinations(),
      header,
      categoryMode,
      calves: initial?.calves
    };
    const confirm = `${location.pathname}/confirm${start.orderId ? `?orderId=${start.orderId}` : ''}`;

    // This step keeps what was declared, so going back from the confirmation finds it again.
    navigate(location.pathname, { replace: true, state: start });
    navigate(confirm, { state: start });
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={SlideUp}
      TransitionProps={{ onExited }}
      PaperProps={{ sx: { borderRadius: 0, bgcolor: 'background.default' } }}
    >
      <AppBar position="relative" elevation={0} sx={{ bgcolor: barBg, color: barText }}>
        <Toolbar sx={{ gap: 2 }}>
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="Cerrar">
            <FuseSvgIcon size={22}>heroicons-outline:x-mark</FuseSvgIcon>
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
              {mode === 'register' ? 'Registrar destete' : initial?.orderId ? `Editar borrador ${initial.orderCode ?? ''}`.trim() : 'Nueva orden de destete'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, display: { xs: 'none', md: 'block' } }} noWrap>
              {mode === 'register'
                ? 'Qué crías se destetaron, a dónde fueron, cómo y cuándo. Después se confirma cría por cría.'
                : 'Qué crías, a dónde van, cómo y cuándo se destetan. Después se confirma cría por cría.'}
            </Typography>
          </Box>
          <Button color="inherit" onClick={onClose} sx={{ textTransform: 'none', fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="inherit"
            disableElevation
            disabled={problems.length > 0}
            onClick={proceed}
            endIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-right</FuseSvgIcon>}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '6px',
              bgcolor: 'common.white',
              color: barBg,
              '&:hover': { bgcolor: 'grey.100' },
              '&.Mui-disabled': { bgcolor: 'rgba(255, 255, 255, 0.24)', color: 'rgba(255, 255, 255, 0.6)' }
            }}
          >
            Continuar con {calfIds.length} cría(s)
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          p: { xs: 2, md: 3 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '420px minmax(0, 1fr)' },
          gap: 2.5,
          alignItems: 'start'
        }}
      >
        <Stack spacing={2.5}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
            <Typography sx={sectionTitleSx}>1. Destino</Typography>
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              <TextField
                select
                fullWidth
                variant="filled"
                label="Modalidad de destino"
                value={destinationMode}
                onChange={(e) => {
                  const next = e.target.value as WeaningDestinationMode;
                  setDestinationMode(next);
                  if (next === 'single') setBatchIds((prev) => prev.slice(0, 1));
                }}
                InputProps={filledInputProps}
                helperText={
                  single ? 'Todas las crías se trasladarán juntas al mismo lote receptor.' : 'Cada cría va a su propio lote de destete.'
                }
              >
                <MenuItem value="single">Todas las crías al mismo lote</MenuItem>
                <MenuItem value="per_animal">Un lote por cría (reparto individual)</MenuItem>
              </TextField>

              {!single && mode === 'order' && (
                <TextField
                  select
                  fullWidth
                  variant="filled"
                  label="Lote de cada cría"
                  value={lotsAtChute ? 'AT_CHUTE' : 'DECLARED'}
                  onChange={(e) => setLotsAtChute(e.target.value === 'AT_CHUTE')}
                  InputProps={filledInputProps}
                  helperText={
                    lotsAtChute
                      ? 'La planilla DEST-01 saldrá con la columna de lote en blanco para anotar en la manga.'
                      : 'Elegí los lotes; el de cada cría se asigna en la confirmación.'
                  }
                >
                  <MenuItem value="DECLARED">Se declara ahora (elegir lotes)</MenuItem>
                  <MenuItem value="AT_CHUTE">En la manga (se escribe en la planilla)</MenuItem>
                </TextField>
              )}

              {single ? (
                <WeaningBatchSelectField
                  batches={weaningBatches}
                  isLoading={isLoadingBatches}
                  value={batchIds[0] ?? null}
                  onChange={(id) => setBatchIds(id == null ? [] : [id])}
                />
              ) : (
                !atChute && (
                  <WeaningBatchSelectField multiple batches={weaningBatches} isLoading={isLoadingBatches} value={batchIds} onChange={setBatchIds} />
                )
              )}

              {!atChute && pendingNew.map((d) => (
                <Alert
                  key={d.key}
                  severity="info"
                  sx={{ borderRadius: '6px' }}
                  action={
                    <Button size="small" color="inherit" onClick={() => setPendingNew((prev) => prev.filter((p) => p.key !== d.key))}>
                      Quitar
                    </Button>
                  }
                >
                  Lote a crear al destetar: <strong>{d.name}</strong>
                </Alert>
              ))}

            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
            <Typography sx={sectionTitleSx}>2. Cómo se desteta</Typography>
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              <TextField
                select
                fullWidth
                variant="filled"
                label="Tipo de destete"
                value={header.weaningType}
                onChange={(e) => setField('weaningType', e.target.value as WeaningType | '')}
                InputProps={filledInputProps}
                helperText={
                  header.weaningType === 'TRADITIONAL'
                    ? 'Destete convencional al pie de la madre (6 a 8 meses).'
                    : header.weaningType === 'ANTICIPATED'
                    ? 'Destete anticipado para alivio nutricional del vientre (4 a 5 meses).'
                    : header.weaningType === 'EARLY'
                    ? 'Destete precoz intensivo para recuperación rápida de la madre (60 a 90 días).'
                    : mode === 'register'
                    ? 'El tipo de destete no fue declarado.'
                    : 'La planilla DEST-01 se emitirá con el casillero en blanco para marcar a campo.'
                }
              >
                <MenuItem value="">
                  <em>{mode === 'register' ? 'Sin declarar' : 'Se marca en la manga'}</em>
                </MenuItem>
                {WEANING_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {WEANING_TYPE_LABELS[type]}
                    {type === 'TRADITIONAL' ? ' (6 a 8 meses)' : type === 'ANTICIPATED' ? ' (4 a 5 meses)' : ' (60 a 90 días)'}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                variant="filled"
                label="Categoría (C/S)"
                value={categoryMode}
                onChange={(e) => setCategoryMode(e.target.value as WeaningOrderCategoryMode)}
                InputProps={filledInputProps}
                helperText={
                  categoryMode === 'KEEP'
                    ? 'Las crías conservan su categoría actual en el nuevo lote.'
                    : categoryMode === 'DECLARED'
                    ? 'La nueva C/S se asignará en el paso de confirmación (por sexo o por animal).'
                    : 'La planilla DEST-01 saldrá con la columna C/S en blanco para anotar en la manga.'
                }
              >
                <MenuItem value="KEEP">No cambia (conserva categoría actual)</MenuItem>
                <MenuItem value="DECLARED">Se declara ahora (asignar nueva C/S)</MenuItem>
                {mode === 'order' && (
                  <MenuItem value="AT_CHUTE">En la manga (se decide e imprime en blanco)</MenuItem>
                )}
              </TextField>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
            <Typography sx={sectionTitleSx}>3. Cuándo y quién</Typography>
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              <Stack direction="row" spacing={1.5}>
                <TextField
                  label={mode === 'register' ? 'Fecha en que se destetó' : 'Fecha planificada'}
                  type="date"
                  variant="filled"
                  value={header.weaningDate}
                  onChange={(e) => setField('weaningDate', e.target.value)}
                  inputProps={mode === 'register' ? { max: today() } : undefined}
                  InputLabelProps={{ shrink: true }}
                  InputProps={filledInputProps}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Responsable"
                  variant="filled"
                  value={header.responsable}
                  onChange={(e) => setField('responsable', e.target.value)}
                  InputProps={filledInputProps}
                  sx={{ flex: 1 }}
                />
              </Stack>
              <TextField
                label="Observaciones"
                variant="filled"
                multiline
                minRows={2}
                value={header.observations}
                onChange={(e) => setField('observations', e.target.value)}
                InputProps={filledInputProps}
              />
            </Stack>
          </Paper>

          {problems.length > 0 ? (
            <Alert severity="info" sx={{ borderRadius: '6px' }}>
              {problems.join(' ')}
            </Alert>
          ) : (
            <Alert severity="success" sx={{ borderRadius: '6px' }}>
              Listo para continuar con {calfIds.length} cría(s) seleccionada(s).
            </Alert>
          )}
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px', position: { lg: 'sticky' }, top: 0 }}>
          <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>4. Crías al pie</Typography>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <WeaningCalvesByBatchSelector
              births={births}
              selected={calfIds}
              onChange={setCalfIds}
              maxHeight={{ xs: 440, lg: 'calc(100vh - 230px)' }}
            />
          )}
        </Paper>
      </Box>
    </Dialog>
  );
};

export default WeaningOrderStartDialog;
