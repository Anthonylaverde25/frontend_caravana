import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { Box, Button, Divider, Drawer, IconButton, Paper, Stack, Typography } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useCact01Print } from './Cact01PrintContext';
import { useTransferOrder } from '@/features/transfer-orders/hooks/useTransferOrder';
import type { TransferOrder } from '@/features/transfer-orders/types';
import Cact01ModeSelector from './Cact01ModeSelector';
import Cact01SourcePicker from './Cact01SourcePicker';
import Cact01DestinationSelector from './Cact01DestinationSelector';
import Cact01HeaderSection from './Cact01HeaderSection';

interface Cact01ConfigDrawerProps {
  open: boolean;
  onClose: () => void;
}

const sectionTitleSx = {
  fontWeight: 800,
  color: '#0f172a',
  fontSize: '0.85rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
} as const;

const managementLetter = (isConfined: boolean | null): 'C' | 'P' | '' =>
  isConfined === true ? 'C' : isConfined === false ? 'P' : '';

/** Thin orchestrator of the CACT-01 print setup: mode, source, destination and header. */
export const Cact01ConfigDrawer: React.FC<Cact01ConfigDrawerProps> = ({ open, onClose }) => {
  const {
    mode,
    setMode,
    setSourceBatchId,
    setDestinationMode,
    setHeaderField,
    applyOrderSelection,
    setTransferOrderId,
    setOrderLockReason,
    setRollAnimals,
    applyOrderCategories,
    reset,
  } = useCact01Print();
  const [searchParams] = useSearchParams();
  const fromBatch = mode === 'from_batch';

  // The transfer order to print, by id: the URL alone reprints it anywhere.
  const requestedOrderId = Number(searchParams.get('transferOrderId')) || null;
  const { data: order } = useTransferOrder(requestedOrderId);

  // Arriving from /activities with a batch already in mind, and no order. Applied once: a
  // later change of mind in the drawer must not be undone by the URL that opened it.
  const didApplyQueryParam = useRef(false);

  useEffect(() => {
    if (didApplyQueryParam.current || requestedOrderId) return;

    const requested = Number(searchParams.get('sourceBatchId'));

    if (!Number.isFinite(requested) || requested <= 0) return;

    didApplyQueryParam.current = true;
    setSourceBatchId(requested);
    setMode('from_batch');
  }, [searchParams]);

  // An order issued on the transfer screen: everything it decided is applied here, so the
  // operator is not asked a second time for answers already given, and the sheet prints the
  // order's code so the scan can find it again.
  // Keyed by status too: a draft approved from this very view is applied again as the issued
  // order it became, so the sheet gets its code and printing unlocks without a reload.
  const appliedOrder = useRef<string | null>(null);

  useEffect(() => {
    if (!order || appliedOrder.current === `${order.id}:${order.status}`) return;

    appliedOrder.current = `${order.id}:${order.status}`;
    applyOrder(order);
  }, [order]);

  const applyOrder = (source: TransferOrder) => {
    const single = source.destination_mode === 'single' ? source.destinations[0] : null;
    const byKey = new Map(source.destinations.map((d) => [d.key, d]));

    setTransferOrderId(source.id);
    // Only an issued or partial order goes out on paper. A draft is previewed; a closed order is
    // looked up. Neither prints: paper of an order that cannot be executed is loose paper.
    setOrderLockReason(
      source.is_editable
        ? 'Es un borrador: aprobalo y emitilo para imprimirlo.'
        : !source.is_open
          ? `Orden ${source.status_label.toLowerCase()}: la planilla es sólo de consulta.`
          : null
    );
    setSourceBatchId(source.source_batch.id);
    setMode('from_batch');
    setDestinationMode(source.destination_mode === 'per_animal' ? 'per_row' : 'single');
    setHeaderField('orden_transferencia', source.is_editable ? '' : source.code);
    setHeaderField('orden_es_borrador', source.is_editable);
    setHeaderField('lote_origen', source.source_batch.name ?? '');
    setHeaderField('actividad_origen', source.source_activity_name ?? '');
    setHeaderField('fecha_movimiento', source.movement_date);
    // The destination activity is applied in BOTH modes: the sheet whose batch column is filled
    // in by hand is the one that most needs the stage printed on it.
    setHeaderField('actividad_destino_id', source.destination_activity.id);
    setHeaderField('actividad_destino', source.destination_activity.name ?? '');
    setHeaderField('lote_destino', single?.label ?? '');
    setHeaderField(
      'sistema_manejo',
      single?.management_is_confined === true ? 'CORRAL' : single?.management_is_confined === false ? 'PASTURA' : ''
    );
    setHeaderField('responsable', source.responsable ?? '');

    const categoryTargets = Object.fromEntries(
      source.animals
        .filter((animal) => animal.target_category_label)
        .map((animal) => [animal.caravan_id, animal.target_category_label as string])
    );
    applyOrderCategories(source.category_mode ?? 'KEEP', categoryTargets);

    // A closed order is shown from its roll, whole: its animals already left the source batch.
    if (!source.is_open && !source.is_editable) {
      setRollAnimals(
        source.animals.map((animal) => {
          const destination = animal.destination_key ? byKey.get(animal.destination_key) : undefined;

          return {
            caravanId: animal.caravan_id,
            identification: animal.identification ?? `#${animal.caravan_id}`,
            sex: animal.sex,
            category: animal.category_label ?? animal.category_name,
            categoryNew: animal.target_category_label,
            teeth: null,
            currentWeight: null,
            destino: source.destination_mode === 'per_animal' ? (destination?.label ?? null) : null,
            manejo: destination ? managementLetter(destination.management_is_confined) || null : null,
          };
        })
      );
      return;
    }

    setRollAnimals(null);

    // Only the animals still pending: reprinting a partial order prints what is left to do.
    const pending = source.animals.filter((animal) => animal.status === 'PENDING');

    applyOrderSelection(
      pending.map((animal) => animal.caravan_id),
      source.destination_mode === 'per_animal'
        ? Object.fromEntries(
            pending
              .filter((animal) => animal.destination_key && byKey.has(animal.destination_key))
              .map((animal) => {
                const destination = byKey.get(animal.destination_key as string)!;

                return [
                  animal.caravan_id,
                  { lote: destination.label, manejo: managementLetter(destination.management_is_confined) },
                ];
              })
          )
        : null
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 460 }, p: 0, bgcolor: '#ffffff', boxSizing: 'border-box' } }}
    >
      <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ p: 1, borderRadius: '6px', bgcolor: '#0f172a', color: '#ffffff', display: 'flex' }}>
            <TuneIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
              Configuración CACT-01
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              Planilla en blanco o pre-cargada desde un lote de origen
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={sectionTitleSx}>1. Modo de impresión</Typography>
          <Cact01ModeSelector />
        </Box>

        {fromBatch && (
          <>
            <Divider sx={{ borderColor: '#e2e8f0' }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="subtitle2" sx={sectionTitleSx}>2. Animales del lote de origen</Typography>
              <Cact01SourcePicker />
            </Box>
          </>
        )}

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={sectionTitleSx}>{fromBatch ? '3' : '2'}. Destino</Typography>
          <Cact01DestinationSelector />
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" sx={sectionTitleSx}>{fromBatch ? '4' : '3'}. Encabezado</Typography>
          <Cact01HeaderSection />
        </Box>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderColor: '#e2e8f0', borderRadius: '8px' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#475569', display: 'block', mb: 0.5 }}>
            Al cargar la planilla
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.4, fontSize: '0.7rem' }}>
            • Se escanean todas las hojas y se confirman juntas.
            <br />
            • Primero se registran los pesos, con los animales todavía en el lote de origen, y después se mueven:
            así la curva separa el engorde real del cambio de composición.
            <br />
            • Sexo y categoría se cotejan contra el sistema y avisan, pero no se modifican.
            <br />
            • Si una fila tiene un problema no se guarda nada: se repara en una pantalla intermedia.
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ p: 2.5, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<RestartAltIcon />}
          onClick={reset}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px', height: '38px', bgcolor: '#ffffff' }}
        >
          Restablecer a Planilla en Blanco
        </Button>
        <Button
          fullWidth
          variant="contained"
          disableElevation
          onClick={onClose}
          sx={{ bgcolor: '#0f172a', color: '#ffffff', fontWeight: 700, textTransform: 'none', borderRadius: '6px', height: '38px', '&:hover': { bgcolor: '#1e293b' } }}
        >
          Aplicar y Cerrar
        </Button>
      </Box>
    </Drawer>
  );
};

export default Cact01ConfigDrawer;
