import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Drawer, Box, Divider } from '@mui/material';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { useBatches } from '@/features/batches/hooks/useBatches';

import { ServiceOrderDrawerHeader } from './drawer/ServiceOrderDrawerHeader';
import { ServiceOrderStatusCard } from './drawer/ServiceOrderStatusCard';
import { ServiceOrderZootechnicalBalance } from './drawer/ServiceOrderZootechnicalBalance';
import { ServiceOrderBatchContext } from './drawer/ServiceOrderBatchContext';
import { ServiceOrderMaleTable } from './drawer/ServiceOrderMaleTable';
import { ServiceOrderBullReplacementsHistory } from './drawer/ServiceOrderBullReplacementsHistory';
import { ServiceOrderFemaleChips } from './drawer/ServiceOrderFemaleChips';
import { ServiceOrderObservations } from './drawer/ServiceOrderObservations';
import { ServiceOrderActionToolbar } from './drawer/ServiceOrderActionToolbar';
import ReplaceServiceBullDialog from '../dialogs/replace-bull/ReplaceServiceBullDialog';
import CloseServiceOrderDialog from '../dialogs/CloseServiceOrderDialog';

interface ServiceOrderDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  order: ServiceOrder | null;
  batch: Batch | null;
  batches?: Batch[];
  caravans: Caravan[];
  onPrintSheet?: (order: ServiceOrder) => void;
  onNavigateToServiceOrders?: () => void;
}

/**
 * ServiceOrderDetailDrawer (Container / Orchestrator)
 *
 * Coordinates drawer state, animal resolution, and delegates presentation
 * to modular drawer subcomponents adhering to SRP (< 180 lines).
 */
export const ServiceOrderDetailDrawer: React.FC<ServiceOrderDetailDrawerProps> = ({
  open,
  onClose,
  order,
  batch,
  batches,
  caravans,
  onPrintSheet,
  onNavigateToServiceOrders,
}) => {
  // Retain last selected order & batch in an effect so close transition animates smoothly without mutating refs in render
  const lastOrderRef = useRef<ServiceOrder | null>(order);
  const lastBatchRef = useRef<Batch | null>(batch);

  const [selectedBullToReplace, setSelectedBullToReplace] = useState<Caravan | null>(null);
  const [isCloseOrderDialogOpen, setIsCloseOrderDialogOpen] = useState(false);

  // Fallback to fetch batches if not passed
  const { data: fetchedBatches = [] } = useBatches(undefined, undefined, 'own');
  const availableBatches = batches && batches.length > 0 ? batches : fetchedBatches;

  useEffect(() => {
    if (order) lastOrderRef.current = order;
    if (batch) lastBatchRef.current = batch;
  }, [order, batch]);

  const currentOrder = order ?? (open ? order : lastOrderRef.current);
  const currentBatch = batch ?? (open ? batch : lastBatchRef.current);

  // Fast caravan lookup map (O(1))
  const caravanMap = useMemo(() => {
    const map = new Map<number, Caravan>();
    caravans.forEach((c) => map.set(c.id, c));
    return map;
  }, [caravans]);

  // Map male and female caravans using single-pass resolution
  const maleCaravans = useMemo(() => {
    const maleIds = currentOrder?.all_male_caravan_ids || currentOrder?.male_caravan_ids || [];
    if (currentOrder && maleIds.length > 0) {
      return maleIds.reduce<Caravan[]>((acc, id) => {
        const found = caravanMap.get(id);
        if (found) acc.push(found);
        return acc;
      }, []);
    }
    if (currentBatch) {
      return caravans.filter(
        (c) =>
          (c.batch_id === currentBatch.id ||
            (currentBatch.service_order_origin_batch_id &&
              c.batch_id === currentBatch.service_order_origin_batch_id)) &&
          ((c.sex as string) === 'M' || (c.sex as string) === 'MACHO')
      );
    }
    return [];
  }, [currentOrder, currentBatch, caravanMap, caravans]);

  // Active male caravans (exclude retired/injured bulls)
  const activeMaleCaravans = useMemo(() => {
    if (!currentOrder?.male_details || currentOrder.male_details.length === 0) {
      return maleCaravans;
    }
    const activeMap = new Set(
      currentOrder.male_details
        .filter((d) => d.status === 'ACTIVE')
        .map((d) => d.male_caravan_id)
    );
    return maleCaravans.filter((m) => activeMap.has(m.id));
  }, [currentOrder, maleCaravans]);

  const femaleCaravans = useMemo(() => {
    if (currentOrder && (currentOrder.female_caravan_ids || []).length > 0) {
      return (currentOrder.female_caravan_ids || []).reduce<Caravan[]>((acc, id) => {
        const found = caravanMap.get(id);
        if (found) acc.push(found);
        return acc;
      }, []);
    }
    if (currentBatch) {
      return caravans.filter(
        (c) =>
          (c.batch_id === currentBatch.id ||
            (currentBatch.service_order_origin_batch_id &&
              c.batch_id === currentBatch.service_order_origin_batch_id)) &&
          ((c.sex as string) === 'H' ||
            (c.sex as string) === 'F' ||
            (c.sex as string) === 'HEMBRA')
      );
    }
    return [];
  }, [currentOrder, currentBatch, caravanMap, caravans]);

  // Bull ratio calculation based strictly on active bulls in service
  const ratio = useMemo(() => {
    const fCount = femaleCaravans.length;
    const mCount = activeMaleCaravans.length;
    if (fCount === 0) return 0;
    return Number(((mCount / fCount) * 100).toFixed(1));
  }, [femaleCaravans, activeMaleCaravans]);

  // Calculate days in service
  const daysInService = useMemo(() => {
    const startDate =
      currentOrder?.actual_start_date ||
      currentOrder?.planned_start_date ||
      currentBatch?.service_detail?.planned_start_date;
    const endDate = currentOrder?.actual_end_date;

    if (!startDate) return null;
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  }, [currentOrder, currentBatch]);

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 460, md: 520 },
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <ServiceOrderDrawerHeader order={currentOrder} batch={currentBatch} onClose={onClose} />

        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
          <ServiceOrderStatusCard order={currentOrder} batch={currentBatch} />
          <ServiceOrderZootechnicalBalance femaleCount={femaleCaravans.length} maleCount={activeMaleCaravans.length} ratio={ratio} />
          <Divider sx={{ my: 2.5 }} />
          <ServiceOrderBatchContext order={currentOrder} batch={currentBatch} daysInService={daysInService} />
          <Divider sx={{ my: 2.5 }} />

          {/* Tabla de Toros con botón de sustitución rápida */}
          <ServiceOrderMaleTable
            maleCaravans={maleCaravans}
            maleDetails={currentOrder?.male_details}
            onOpenReplaceDialog={(bull) => setSelectedBullToReplace(bull)}
          />

          {/* Historial Auditado de Sustituciones */}
          <ServiceOrderBullReplacementsHistory serviceOrderId={currentOrder?.id} />

          <Divider sx={{ my: 2.5 }} />
          <ServiceOrderFemaleChips femaleCaravans={femaleCaravans} />
          <ServiceOrderObservations observations={currentOrder?.observations || currentBatch?.observaciones || currentBatch?.service_detail?.notes} />
        </Box>

        <ServiceOrderActionToolbar
          order={currentOrder}
          onClose={onClose}
          onPrintSheet={onPrintSheet}
          onNavigateToServiceOrders={onNavigateToServiceOrders}
          onOpenCloseServiceDialog={() => setIsCloseOrderDialogOpen(true)}
        />
      </Drawer>

      {/* Modal de Reemplazo de Toro */}
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

      {/* Modal de Cierre de Servicio y Retiro de Toros */}
      {isCloseOrderDialogOpen && currentOrder && (
        <CloseServiceOrderDialog
          open={isCloseOrderDialogOpen}
          onClose={() => setIsCloseOrderDialogOpen(false)}
          order={currentOrder}
          batch={currentBatch}
          batches={availableBatches}
          caravans={caravans}
          onSuccess={() => {
            setIsCloseOrderDialogOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default ServiceOrderDetailDrawer;
