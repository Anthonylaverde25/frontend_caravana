import React, { useMemo, useRef, useEffect } from 'react';
import { Drawer, Box, Divider } from '@mui/material';
import { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';

import { ServiceOrderDrawerHeader } from './drawer/ServiceOrderDrawerHeader';
import { ServiceOrderStatusCard } from './drawer/ServiceOrderStatusCard';
import { ServiceOrderZootechnicalBalance } from './drawer/ServiceOrderZootechnicalBalance';
import { ServiceOrderBatchContext } from './drawer/ServiceOrderBatchContext';
import { ServiceOrderMaleTable } from './drawer/ServiceOrderMaleTable';
import { ServiceOrderFemaleChips } from './drawer/ServiceOrderFemaleChips';
import { ServiceOrderObservations } from './drawer/ServiceOrderObservations';
import { ServiceOrderActionToolbar } from './drawer/ServiceOrderActionToolbar';

interface ServiceOrderDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  order: ServiceOrder | null;
  batch: Batch | null;
  caravans: Caravan[];
  onPrintSheet?: (order: ServiceOrder) => void;
  onNavigateToServiceOrders?: () => void;
}

/**
 * ServiceOrderDetailDrawer (Container / Orchestrator)
 *
 * Coordinates drawer state, animal resolution, and delegates presentation
 * to modular drawer subcomponents adhering to SRP (< 120 lines).
 */
export const ServiceOrderDetailDrawer: React.FC<ServiceOrderDetailDrawerProps> = ({
  open,
  onClose,
  order,
  batch,
  caravans,
  onPrintSheet,
  onNavigateToServiceOrders,
}) => {
  // Retain last selected order & batch in an effect so close transition animates smoothly without mutating refs in render
  const lastOrderRef = useRef<ServiceOrder | null>(order);
  const lastBatchRef = useRef<Batch | null>(batch);

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
    if (currentOrder && (currentOrder.male_caravan_ids || []).length > 0) {
      return (currentOrder.male_caravan_ids || []).reduce<Caravan[]>((acc, id) => {
        const found = caravanMap.get(id);
        if (found) acc.push(found);
        return acc;
      }, []);
    }
    if (currentBatch) {
      return caravans.filter(
        (c) => c.batch_id === currentBatch.id && (c.sex as string) === 'M'
      );
    }
    return [];
  }, [currentOrder, currentBatch, caravanMap, caravans]);

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
        (c) => c.batch_id === currentBatch.id && (c.sex as string) === 'H'
      );
    }
    return [];
  }, [currentOrder, currentBatch, caravanMap, caravans]);

  // Bull ratio calculation
  const ratio = useMemo(() => {
    const fCount = femaleCaravans.length;
    const mCount = maleCaravans.length;
    if (fCount === 0) return 0;
    return Number(((mCount / fCount) * 100).toFixed(1));
  }, [femaleCaravans, maleCaravans]);

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
        <ServiceOrderZootechnicalBalance femaleCount={femaleCaravans.length} maleCount={maleCaravans.length} ratio={ratio} />
        <Divider sx={{ my: 2.5 }} />
        <ServiceOrderBatchContext order={currentOrder} batch={currentBatch} daysInService={daysInService} />
        <Divider sx={{ my: 2.5 }} />
        <ServiceOrderMaleTable maleCaravans={maleCaravans} />
        <Divider sx={{ my: 2.5 }} />
        <ServiceOrderFemaleChips femaleCaravans={femaleCaravans} />
        <ServiceOrderObservations observations={currentOrder?.observations || currentBatch?.observaciones || currentBatch?.service_detail?.notes} />
      </Box>

      <ServiceOrderActionToolbar
        order={currentOrder}
        onClose={onClose}
        onPrintSheet={onPrintSheet}
        onNavigateToServiceOrders={onNavigateToServiceOrders}
      />
    </Drawer>
  );
};

export default ServiceOrderDetailDrawer;
