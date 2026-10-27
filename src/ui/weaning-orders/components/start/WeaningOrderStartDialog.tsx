import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  MenuItem,
  Paper,
  Slide,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { useSnackbar } from 'notistack';
import FullScreenEntryBar from '@/components/FullScreenEntryBar';
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
  destinationSignature,
  newDestination,
  WeaningFormHeader,
  WeaningFormMode,
  WeaningOrderStart
} from '../../hooks/useWeaningOrderForm';
import { filledInputProps, sectionTitleSx } from '../form/formStyles';
import WeaningCalvesByBatchSelector from './WeaningCalvesByBatchSelector';
import WeaningBatchSelectField, { WeaningBatchOption } from './WeaningBatchSelectField';
import { STAY_IN_PLACE_ID, STAY_IN_PLACE_LABEL, weaningDestinationOptions } from './weaningDestinationOptions';
import { DestinationChoice, refOfBatch, refOfDraft, useCalfDestinations } from './useCalfDestinations';
import WeaningDestinationAssignBar from './WeaningDestinationAssignBar';
import { useCalfMeasures } from './useCalfMeasures';
import WeaningOrderConfirmDialog from '../confirm/WeaningOrderConfirmDialog';

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
 * they are weaned — and, on the grid, the batch of each calf when there is one per calf and, when the
 * weaning already happened, its weight and notes. It is confirmed in a modal over this dialog; only
 * an order that declares the C/S of each calf still goes to `…/confirm`.
 */
export const WeaningOrderStartDialog: React.FC<WeaningOrderStartDialogProps> = ({ open, mode, initial, onClose, onExited }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const { data: allBirths = [], isLoading } = useBirthHistory();
  // "Registrar destetadas": only the calves of the order being executed are offered.
  const source = initial?.sourceOrder ?? null;
  const births = useMemo(() => (source ? allBirths.filter((r) => r.open_order_code === source.code) : allBirths), [allBirths, source]);
  // Every own batch: a weaning batch is recommended, not required.
  const { data: batches = [], isLoading: isLoadingBatches } = useBatches(undefined, undefined, 'own');
  const [calfIds, setCalfIds] = useState<number[]>([]);
  const [destinationMode, setDestinationMode] = useState<WeaningDestinationMode>('single');
  const [batchIds, setBatchIds] = useState<number[]>([]);
  // A draft may carry a batch to create at weaning (older orders): kept until it is removed.
  const [pendingNew, setPendingNew] = useState<DestinationDraft[]>([]);
  const [header, setHeader] = useState<WeaningFormHeader>(emptyHeader);
  const [categoryMode, setCategoryMode] = useState<WeaningOrderCategoryMode>('KEEP');
  // One batch per calf, all of them written at the chute: the order declares no batch (orders only).
  const [lotsAtChute, setLotsAtChute] = useState(false);
  // The order being confirmed in the modal; null while it is closed.
  const [confirming, setConfirming] = useState<WeaningOrderStart | null>(null);

  const weaningBatches = useMemo<WeaningBatchOption[]>(() => weaningDestinationOptions(batches), [batches]);
  // The batches declared for a batch per calf, as each row offers them.
  const choices = useMemo<DestinationChoice[]>(() => {
    const nameOf = new Map(weaningBatches.map((b) => [b.id, b.name]));

    return [
      ...batchIds.map((id) => ({ ref: refOfBatch(id), label: id === STAY_IN_PLACE_ID ? STAY_IN_PLACE_LABEL : (nameOf.get(id) ?? `Lote ${id}`) })),
      ...pendingNew.map((d) => ({ ref: refOfDraft(d), label: d.name }))
    ];
  }, [batchIds, pendingNew, weaningBatches]);
  const calfDestinations = useCalfDestinations(choices);
  // A weaning that already happened takes what the chute measured of each calf.
  const calfMeasures = useCalfMeasures();

  useEffect(() => {
    if (!open) return;

    const destinations = initial?.destinations ?? [];
    setCalfIds(initial?.calfIds ?? []);
    setDestinationMode(initial?.destinationMode ?? 'single');
    setBatchIds([
      ...(destinations.some((d) => d.kind === 'stay') ? [STAY_IN_PLACE_ID] : []),
      ...destinations.filter((d) => d.kind === 'existing' && d.batchId != null).map((d) => d.batchId as number)
    ]);
    setPendingNew(destinations.filter((d) => d.kind === 'new'));
    setHeader(initial?.header ?? emptyHeader());
    setCategoryMode(initial?.categoryMode ?? 'KEEP');
    setLotsAtChute(mode === 'order' && initial?.destinationMode === 'per_animal' && destinations.length === 0);
    calfDestinations.reset(initial);
    calfMeasures.reset(initial);
  }, [open]);

  const setField = <K extends keyof WeaningFormHeader>(field: K, value: WeaningFormHeader[K]) =>
    setHeader((prev) => ({ ...prev, [field]: value }));

  const single = destinationMode === 'single';
  const atChute = !single && lotsAtChute && mode === 'order';
  const singleIsPending = single && batchIds.length === 0 && pendingNew.length > 0;
  const perCalf = !single && !atChute && choices.length > 0;
  const emptyLabel = mode === 'register' ? 'Elegí el lote' : 'Se decide en la manga';

  const problems: string[] = [];
  if (calfIds.length === 0) problems.push('Elegí al menos una cría.');
  if (single && batchIds.length === 0 && !singleIsPending) problems.push('Elegí adónde van las crías: un lote o «Quedan en su lote».');
  if (!single && !atChute && batchIds.length + pendingNew.length === 0) problems.push('Elegí los lotes entre los que se reparten las crías.');
  if (perCalf && mode === 'register' && calfIds.some((id) => calfDestinations.refOf(id) === null)) {
    problems.push('Elegí el lote destino de cada cría marcada.');
  }
  if (mode === 'register' && calfMeasures.invalidIds(calfIds).length > 0) {
    problems.push('Revisá los pesos: el que se escribe tiene que ser un número mayor a cero.');
  }
  if (!header.weaningDate) problems.push('Indicá la fecha del destete.');
  if (mode === 'register' && header.weaningDate > today()) problems.push('La fecha de un destete registrado no puede ser futura.');

  /** The declared batches, keeping the key each one already had so calves keep their batch. */
  const destinations = (): DestinationDraft[] => {
    const previous = initial?.destinations ?? [];
    const existing = batchIds.map((batchId) =>
      batchId === STAY_IN_PLACE_ID
        ? (previous.find((d) => d.kind === 'stay') ?? { ...newDestination(), kind: 'stay' as const, name: STAY_IN_PLACE_LABEL })
        : (previous.find((d) => d.kind === 'existing' && d.batchId === batchId) ?? { ...newDestination(), kind: 'existing' as const, batchId })
    );

    if (single) return existing.length > 0 ? existing.slice(0, 1) : pendingNew.slice(0, 1);

    if (atChute) return [];

    return [...existing, ...pendingNew];
  };

  // Not blocking: what happened beats the plan, and the order records the difference.
  const deviations: string[] = [];
  if (source && destinationSignature(destinationMode, destinations()) !== source.plannedDestinations) deviations.push('el destino');
  // A type the order left for the chute is completed here, not changed: only a planned one can differ.
  if (source && source.plannedType !== '' && header.weaningType !== '' && header.weaningType !== source.plannedType) {
    deviations.push('el tipo de destete');
  }

  const withMeasures = (calves: WeaningOrderStart['calves']) => (mode === 'register' ? calfMeasures.apply(calfIds, calves ?? {}) : calves);

  const proceed = () => {
    if (problems.length > 0) {
      enqueueSnackbar(problems[0], { variant: 'warning' });
      return;
    }

    const declared = destinations();
    const start: WeaningOrderStart = {
      orderId: initial?.orderId ?? null,
      orderCode: initial?.orderCode ?? null,
      calfIds,
      destinationMode,
      destinations: declared,
      header,
      categoryMode,
      calves: withMeasures(perCalf ? calfDestinations.toCalves(calfIds, declared, initial?.calves) : initial?.calves),
      sourceOrder: initial?.sourceOrder ?? null,
      returnTo: initial?.returnTo
    };

    if (categoryMode !== 'DECLARED') {
      setConfirming(start);
      return;
    }

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
      <FullScreenEntryBar
        title={
          source
            ? `Registrar destetadas · ${source.code}`
            : mode === 'register'
              ? 'Registrar destete'
              : initial?.orderId
                ? `Editar borrador ${initial.orderCode ?? ''}`.trim()
                : 'Nueva orden de destete'
        }
        subtitle={
          source
            ? 'Las crías de la orden que se destetaron y su peso. Viene lo planificado: cambialo si fue distinto.'
            : mode === 'register'
              ? 'Qué crías se destetaron, a dónde fueron, cómo, cuándo y su peso. La orden queda registrada ya ejecutada.'
              : 'Qué crías, a dónde van, cómo y cuándo se destetan. Después se confirma la orden.'
        }
        primaryLabel={`Continuar con ${calfIds.length} cría(s)`}
        primaryIcon="heroicons-outline:arrow-right"
        busy={false}
        onClose={onClose}
        onPrimary={proceed}
      />

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
          {deviations.length > 0 && (
            <Alert severity="warning" sx={{ borderRadius: '6px', fontSize: '0.8rem', py: 0.5 }}>
              Difiere de lo planificado en {source?.code}: {deviations.join(' y ')}. Vale lo que declares acá; queda registrado en la
              orden.
            </Alert>
          )}
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
                  single ? 'Todas las crías van al mismo destino.' : 'Cada cría va a su propio lote de destete.'
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
                      : 'Elegí los lotes; el de cada cría se asigna en la grilla de crías.'
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
                    ? 'Las crías conservan su categoría actual.'
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
              focusIds={initial?.calfIds}
              heldBy={source?.code ?? null}
              maxHeight={{ xs: 440, lg: 'calc(100vh - 230px)' }}
              destination={
                perCalf ? { choices, emptyLabel, refOf: calfDestinations.refOf, onChange: (id, ref) => calfDestinations.assign([id], ref) } : undefined
              }
              measures={mode === 'register' ? { valueOf: calfMeasures.valueOf, onChange: calfMeasures.set } : undefined}
              toolbar={
                perCalf && (
                  <WeaningDestinationAssignBar
                    calves={births.filter((b) => calfIds.includes(b.calf_id))}
                    choices={choices}
                    emptyLabel={emptyLabel}
                    required={mode === 'register'}
                    refOf={calfDestinations.refOf}
                    onAssign={calfDestinations.assign}
                  />
                )
              }
            />
          )}
        </Paper>
      </Box>
      <WeaningOrderConfirmDialog mode={mode} start={confirming} deviations={deviations} onClose={() => setConfirming(null)} />
    </Dialog>
  );
};

export default WeaningOrderStartDialog;
