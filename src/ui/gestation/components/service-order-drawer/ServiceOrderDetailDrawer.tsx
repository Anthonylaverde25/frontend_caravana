import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Drawer, Box, Divider } from '@mui/material';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { useBatches } from '@/features/batches/hooks/useBatches';

import { ServiceOrderDrawerHeader } from './ServiceOrderDrawerHeader';
import { ServiceOrderStatusCard } from './ServiceOrderStatusCard';
import { ServiceOrderZootechnicalBalance } from './ServiceOrderZootechnicalBalance';
import { ServiceOrderBatchContext } from './ServiceOrderBatchContext';
import { ServiceOrderMaleTable } from './ServiceOrderMaleTable';
import { ServiceOrderBullReplacementsHistory } from './ServiceOrderBullReplacementsHistory';
import { ServiceOrderFemaleChips } from './ServiceOrderFemaleChips';
import { ServiceOrderObservations } from './ServiceOrderObservations';
import { ServiceOrderActionToolbar } from './ServiceOrderActionToolbar';
import ReplaceServiceBullDialog from '../dialogs/replace-bull/ReplaceServiceBullDialog';
import RetireServiceBullDialog from '../dialogs/RetireServiceBullDialog';
import ServiceOrderDiagnosisPanel from './ServiceOrderDiagnosisPanel';
import ServiceOrderInseminationsPanel from './ServiceOrderInseminationsPanel';

function resolveCaravans(ids: number[], caravanMap: Map<number, Caravan>): Caravan[] {
  return ids.reduce<Caravan[]>((acc, id) => {
    const found = caravanMap.get(id);
    if (found) acc.push(found);
    return acc;
  }, []);
}

interface ServiceOrderDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  order: ServiceOrder | null;
  caravans: Caravan[];
  batches?: Batch[];
  onPrintSheet?: (order: ServiceOrder) => void;
  onNavigateToServiceOrders?: () => void;
  /** Opened from the diagnosis tray: no link back to it. */
  inTray?: boolean;
  /** Rendered above the status card: the "Próximo paso" block of /gestation/services. */
  nextStep?: React.ReactNode;
}

/**
 * ServiceOrderDetailDrawer (Container / Orchestrator)
 *
 * The service is an order over an operational batch: everything shown here comes from the order
 * (its batch, its bulls and the exposure window of each female), never from a batch of its own.
 * Opened from the batch ("En servicio" chip, service history) and from /gestation/service-orders.
 * Rounds, bull withdrawal and closing are worked in the diagnosis tray, linked from the toolbar.
 */
export const ServiceOrderDetailDrawer: React.FC<ServiceOrderDetailDrawerProps> = ({
  open,
  onClose,
  order,
  caravans,
  batches,
  onPrintSheet,
  onNavigateToServiceOrders,
  inTray = false,
  nextStep,
}) => {
  // Keep the last order while the drawer animates out.
  const lastOrderRef = useRef<ServiceOrder | null>(order);
  const [selectedBullToReplace, setSelectedBullToReplace] = useState<Caravan | null>(null);
  const [selectedBullToRetire, setSelectedBullToRetire] = useState<Caravan | null>(null);

  const { data: fetchedBatches = [] } = useBatches(undefined, undefined, 'own');
  const availableBatches = batches && batches.length > 0 ? batches : fetchedBatches;

  useEffect(() => {
    if (order) lastOrderRef.current = order;
  }, [order]);

  const currentOrder = order ?? lastOrderRef.current;
  const currentBatch = useMemo(
    () => availableBatches.find((b) => b.id === currentOrder?.batch_id) ?? null,
    [availableBatches, currentOrder]
  );

  const caravanMap = useMemo(() => new Map(caravans.map((c) => [c.id, c])), [caravans]);

  const maleCaravans = useMemo(
    () => resolveCaravans(currentOrder?.all_male_caravan_ids || currentOrder?.male_caravan_ids || [], caravanMap),
    [currentOrder, caravanMap]
  );

  const activeMaleCaravans = useMemo(() => {
    if (!currentOrder?.male_details || currentOrder.male_details.length === 0) return maleCaravans;
    const active = new Set(currentOrder.male_details.filter((d) => d.status === 'ACTIVE').map((d) => d.male_caravan_id));
    return maleCaravans.filter((m) => active.has(m.id));
  }, [currentOrder, maleCaravans]);

  const femaleCaravans = useMemo(
    () => resolveCaravans(currentOrder?.female_caravan_ids || [], caravanMap),
    [currentOrder, caravanMap]
  );

  // Females still sharing the paddock with the bulls (open exposure).
  const exposedCount = useMemo(() => {
    const exposures = currentOrder?.female_exposures;
    if (!exposures || exposures.length === 0) return femaleCaravans.length;
    return exposures.filter((e) => e.exposed_from !== null && e.exposed_until === null).length;
  }, [currentOrder, femaleCaravans]);

  const ratio = exposedCount === 0 ? 0 : Number(((activeMaleCaravans.length / exposedCount) * 100).toFixed(1));

  const daysInService = useMemo(() => {
    const startDate = currentOrder?.actual_start_date || currentOrder?.planned_start_date;
    if (!startDate) return null;
    const end = currentOrder?.actual_end_date ? new Date(currentOrder.actual_end_date) : new Date();
    const diff = Math.floor((end.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  }, [currentOrder]);

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: { xs: '100%', sm: 460, md: 520 }, display: 'flex', flexDirection: 'column' } }}
      >
        <ServiceOrderDrawerHeader order={currentOrder} batch={currentBatch} onClose={onClose} />

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
          {nextStep}
          <ServiceOrderStatusCard order={currentOrder} batch={currentBatch} />
          <ServiceOrderDiagnosisPanel order={currentOrder} />
          <ServiceOrderZootechnicalBalance femaleCount={exposedCount} maleCount={activeMaleCaravans.length} ratio={ratio} />
          <Divider sx={{ my: 2.5 }} />
          <ServiceOrderBatchContext order={currentOrder} batch={currentBatch} daysInService={daysInService} />
          <Divider sx={{ my: 2.5 }} />

          {/* AI without repaso (semen S-B): no bull ever served the batch. */}
          {(currentOrder?.service_method !== 'AI' || currentOrder?.insemination_summary?.had_repaso_bulls) && (
            <>
              <ServiceOrderMaleTable
                maleCaravans={maleCaravans}
                maleDetails={currentOrder?.male_details}
                onOpenReplaceDialog={(bull) => setSelectedBullToReplace(bull)}
                onOpenRetireDialog={(bull) => setSelectedBullToRetire(bull)}
              />
              <ServiceOrderBullReplacementsHistory serviceOrderId={currentOrder?.id} />
            </>
          )}

          <Divider sx={{ my: 2.5 }} />
          <ServiceOrderFemaleChips femaleCaravans={femaleCaravans} exposures={currentOrder?.female_exposures ?? []} />
          <ServiceOrderInseminationsPanel order={currentOrder} />
          <ServiceOrderObservations observations={currentOrder?.observations} />
        </Box>

        <ServiceOrderActionToolbar
          order={currentOrder}
          onClose={onClose}
          onPrintSheet={onPrintSheet}
          onNavigateToServiceOrders={onNavigateToServiceOrders}
          inTray={inTray}
        />
      </Drawer>

      {selectedBullToReplace && currentOrder && (
        <ReplaceServiceBullDialog
          open={Boolean(selectedBullToReplace)}
          onClose={() => setSelectedBullToReplace(null)}
          bull={selectedBullToReplace}
          order={currentOrder}
          batches={availableBatches}
          caravans={caravans}
        />
      )}

      <RetireServiceBullDialog
        open={selectedBullToRetire !== null}
        onClose={() => setSelectedBullToRetire(null)}
        bull={selectedBullToRetire}
        order={currentOrder}
        batches={availableBatches}
      />
    </>
  );
};

export default ServiceOrderDetailDrawer;
