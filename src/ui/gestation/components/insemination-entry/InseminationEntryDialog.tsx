import React, { forwardRef, useMemo, useState } from 'react';
import { Alert, Box, CircularProgress, Dialog, Paper, Slide, Stack, Typography } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import FullScreenEntryBar from '@/components/FullScreenEntryBar';
import { useServiceOrder, useServiceOrderDiagnosis } from '@/features/gestation/hooks/useServiceOrders';
import { useOrderInseminations } from '@/features/gestation/hooks/useInseminations';
import { useSemenOptions } from '@/features/semen/hooks/useSemenOptions';
import { useWarehouses } from '@/features/stock/hooks/useWarehouses';
import { sectionTitleSx } from '@/ui/weaning-orders/components/form/formStyles';
import SemenCoverageAlert from '@/ui/semen/components/coverage/SemenCoverageAlert';
import InseminationOrderContextCard from './InseminationOrderContextCard';
import InseminationDefaultsCard from './InseminationDefaultsCard';
import InseminationEntrySheet from './InseminationEntrySheet';
import VoidInseminationDialog from './VoidInseminationDialog';
import { femalesOf } from './inseminationEntryModel';
import { useInseminationEntryState } from './useInseminationEntryState';
import { useInseminationSubmit } from './useInseminationSubmit';

const SlideUp = forwardRef(function SlideUp(props: TransitionProps & { children: React.ReactElement }, ref: React.Ref<unknown>) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface InseminationEntryDialogProps {
  orderId: number;
  onClose: () => void;
}

/**
 * "Cargar inseminaciones" (`/gestation/service-orders/:orderId/inseminations`, semen S-B): one row
 * per female with everything prefilled; the operator marks who went through the chute and registers.
 * Each load takes the straws out of the tank, charged to the batch (IA7).
 */
export default function InseminationEntryDialog({ orderId, onClose }: InseminationEntryDialogProps) {
  const { data: order, isLoading: loadingOrder } = useServiceOrder(orderId);
  const { data: diagnosis } = useServiceOrderDiagnosis(orderId);
  const { data: inseminations = [], isLoading: loadingInseminations } = useOrderInseminations(orderId);
  const semen = useSemenOptions();
  const { data: warehouses = [] } = useWarehouses();
  const tanks = useMemo(() => warehouses.filter((w) => w.kind === 'CRYO_TANK' && w.isActive), [warehouses]);
  const defaultTankId = tanks.find((t) => t.isDefault)?.id ?? tanks[0]?.id ?? null;
  const [voiding, setVoiding] = useState<number | null>(null);

  const tags = useMemo(() => new Map((diagnosis?.females ?? []).map((f) => [f.female_caravan_id, f.identification])), [diagnosis]);
  const females = useMemo(() => (order ? femalesOf(order, inseminations, tags) : []), [order, inseminations, tags]);
  const entry = useInseminationEntryState(females, semen.byId, defaultTankId);
  const submit = useInseminationSubmit(orderId, females, entry);

  const loadStraws = useMemo(() => {
    const straws: Record<number, number> = {};
    females.forEach((f) => {
      const d = entry.drafts[f.id];
      if (entry.selected.has(f.id) && entry.editable.has(f.id) && d?.itemId) straws[d.itemId] = (straws[d.itemId] ?? 0) + d.straws;
    });
    return straws;
  }, [females, entry.drafts, entry.selected, entry.editable]);

  // Semen of the pending rows (planned or typed): each gets its lot once in "2. Carga".
  const semenInUse = useMemo(() => {
    const ids = new Set<number>();
    females.forEach((f) => {
      const id = entry.drafts[f.id]?.itemId;
      if (id && entry.editable.has(f.id)) ids.add(id);
    });
    return [...ids].map((id) => semen.byId.get(id)).filter((o): o is NonNullable<typeof o> => Boolean(o));
  }, [females, entry.drafts, entry.editable, semen.byId]);

  const voided = inseminations.find((i) => i.id === voiding);
  const closed = order && !['APPROVED', 'SERVICE_ENDED'].includes(order.status);

  return (
    <Dialog fullScreen open onClose={onClose} TransitionComponent={SlideUp} PaperProps={{ sx: { borderRadius: 0, bgcolor: 'background.default' } }}>
      <FullScreenEntryBar
        title={`Cargar inseminaciones${order ? ` · ${order.code}` : ''}`}
        subtitle="Marcá los vientres que pasaron por la manga: semen, partida, pajuelas, fecha y termo vienen precargados."
        primaryLabel={`Registrar ${submit.count} inseminación(es)`}
        primaryIcon="heroicons-outline:check"
        busy={submit.isSaving}
        onClose={onClose}
        onPrimary={submit.submit}
      />

      {loadingOrder || loadingInseminations || !order ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          {loadingOrder ? <CircularProgress size={28} /> : <Typography color="error">Orden de servicio no encontrada.</Typography>}
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: { xs: 2, md: 3 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0, 1fr)' },
            gap: 2.5,
            alignItems: 'start',
          }}
        >
          <Stack spacing={2.5}>
            <InseminationOrderContextCard order={order} />
            <InseminationDefaultsCard defaults={entry.defaults} tanks={tanks} semenInUse={semenInUse} onChange={entry.setDefaults} />
            {order.service_method !== 'AI' && <Alert severity="error">La orden {order.code} es de monta natural: no lleva inseminaciones.</Alert>}
            {closed && <Alert severity="info">La orden está cerrada: sus inseminaciones ya no cambian.</Alert>}
            {semen.options.length === 0 && !semen.isLoading && (
              <Alert severity="warning">No hay semen activo en el inventario. Ingresalo desde Ítems → Semen.</Alert>
            )}
            <SemenCoverageAlert straws={loadStraws} byId={semen.byId} includeCommitted={false} />
          </Stack>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: '8px' }}>
            <Typography sx={{ ...sectionTitleSx, mb: 1.5 }}>3. Vientres</Typography>
            <InseminationEntrySheet
              females={females}
              entry={entry}
              options={semen.options}
              byId={semen.byId}
              tanks={tanks}
              onVoid={setVoiding}
              maxHeight={{ xs: 520, lg: 'calc(100vh - 260px)' }}
            />
          </Paper>
        </Box>
      )}

      {voided && <VoidInseminationDialog orderId={orderId} insemination={voided} onClose={() => setVoiding(null)} />}
    </Dialog>
  );
}
