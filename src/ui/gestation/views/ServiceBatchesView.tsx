import React, { useState, useMemo } from 'react';
import {
  Stack,
  Button,
  useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useNavigate } from 'react-router';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useCompany } from '@/contexts/CompanyContext';
import { useServiceOrders, ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { ServiceBatchSummaryCards, ServiceBatchKPIs } from '../components/service-batches/ServiceBatchSummaryCards';
import { ServiceBatchDataTable } from '../components/service-batches/ServiceBatchDataTable';
import { ServiceOrderDetailDrawer } from '../components/service-batches/ServiceOrderDetailDrawer';
import CreateServiceBatchWizardDialog from '../components/dialogs/CreateServiceBatchWizardDialog';
import ServiceOrderPrintSheetDialog from '../components/dialogs/ServiceOrderPrintSheetDialog';

export const ServiceBatchesView: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const { activeCompanyId } = useCompany();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<ServiceOrder | null>(null);
  const [printSheetOrder, setPrintSheetOrder] = useState<ServiceOrder | null>(null);

  // Fetch batches, caravans & service orders
  const { data: batches = [], isLoading: isLoadingBatches, refetch: refetchBatches } = useBatches(
    undefined,
    undefined,
    'own'
  );
  const { data: caravans = [] } = useCaravans(activeCompanyId, 'own');
  const { data: serviceOrders = [] } = useServiceOrders();

  // Map service orders by service_batch_id and batch_id
  const serviceOrdersMap = useMemo(() => {
    const map = new Map<number, ServiceOrder>();
    serviceOrders.forEach((order) => {
      if (order.service_batch_id) {
        map.set(order.service_batch_id, order);
      }
      if (order.batch_id) {
        map.set(order.batch_id, order);
      }
    });
    return map;
  }, [serviceOrders]);

  // Filter Service Batches only
  const serviceBatches = useMemo(() => {
    return batches.filter((b) => b.isService());
  }, [batches]);

  // Aggregate stats per service batch (caravan counts & bull ratio)
  const batchStatsMap = useMemo(() => {
    const map = new Map<number, { females: number; males: number; ratio: number }>();
    serviceBatches.forEach((batch) => {
      const order = serviceOrdersMap.get(batch.id);

      let females = 0;
      let males = 0;

      if (order && ((order.female_caravan_ids && order.female_caravan_ids.length > 0) || (order.male_caravan_ids && order.male_caravan_ids.length > 0) || (order.male_details && order.male_details.length > 0))) {
        // High fidelity: Count animals committed in the active service order
        females = order.female_caravan_ids?.length ?? 0;
        
        // Count ONLY active bulls currently in service (exclude retired/injured bulls)
        if (order.male_details && order.male_details.length > 0) {
          males = order.male_details.filter((d) => d.status === 'ACTIVE').length;
        } else if (order.active_male_caravan_ids) {
          males = order.active_male_caravan_ids.length;
        } else {
          males = order.male_caravan_ids?.length ?? 0;
        }
      } else {
        // Fallback: Caravans physically in batch or in linked origin batch
        const relevantCaravans = caravans.filter((c) => {
          if (c.batch_id === batch.id) return true;
          if (batch.service_order_origin_batch_id && c.batch_id === batch.service_order_origin_batch_id) {
            return true;
          }
          return false;
        });

        females = relevantCaravans.filter(
          (c) => c.sex === 'H' || (c.sex as string) === 'F' || (c.sex as string) === 'HEMBRA'
        ).length;
        males = relevantCaravans.filter(
          (c) => c.sex === 'M' || (c.sex as string) === 'MACHO'
        ).length;
      }

      const ratio = females > 0 ? Number(((males / females) * 100).toFixed(1)) : 0;
      map.set(batch.id, { females, males, ratio });
    });
    return map;
  }, [serviceBatches, serviceOrdersMap, caravans]);

  // KPIs
  const kpis: ServiceBatchKPIs = useMemo(() => {
    let totalActive = 0;
    let totalFemales = 0;
    let totalMales = 0;
    let criticalRatioCount = 0;

    serviceBatches.forEach((b) => {
      const stats = batchStatsMap.get(b.id) || { females: 0, males: 0, ratio: 0 };
      if (b.isActive()) {
        totalActive++;
        totalFemales += stats.females;
        totalMales += stats.males;
        if (stats.ratio < 2.0) {
          criticalRatioCount++;
        }
      }
    });

    const avgRatio = totalFemales > 0 ? Number(((totalMales / totalFemales) * 100).toFixed(1)) : 0;

    return {
      totalBatches: serviceBatches.length,
      totalActive,
      totalFemales,
      totalMales,
      avgRatio,
      criticalRatioCount,
    };
  }, [serviceBatches, batchStatsMap]);

  const handleViewCaravans = (batchId: number) => {
    const order = serviceOrdersMap.get(batchId);
    const targetBatchId = order?.origin_batch_id ?? batchId;
    navigate(`/caravans?batch_id=${targetBatchId}`);
  };

  const handleOpenDetailDrawer = (batch: Batch, order?: ServiceOrder) => {
    setSelectedBatch(batch);
    setSelectedServiceOrder(order || null);
  };

  const selectedOrderBatch = useMemo(() => {
    if (selectedBatch) return selectedBatch;
    if (!selectedServiceOrder) return null;
    return (
      batches.find(
        (b) =>
          b.id === selectedServiceOrder.service_batch_id ||
          b.id === selectedServiceOrder.batch_id
      ) || null
    );
  }, [selectedBatch, selectedServiceOrder, batches]);

  return (
    <ViewLayout
      title="Lotes de Servicio Reproductivo (Entore)"
      subtitle="Supervisión, homogeneidad zootécnica y control de torada en lotes reproductivos"
      actions={
        <Button
          variant="contained"
          onClick={() => setIsWizardOpen(true)}
          startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '6px',
            px: 2.5,
            bgcolor: '#0a6ed1',
            '&:hover': { bgcolor: '#0854a0' },
          }}
        >
          Nuevo Lote de Servicio
        </Button>
      }
    >
      <Stack spacing={2.5}>
        {/* KPI Summary Cards (Pedigree Pattern) */}
        <ServiceBatchSummaryCards kpis={kpis} isDark={isDark} />

        {/* Tabular Service Batches DataTable */}
        <ServiceBatchDataTable
          batches={serviceBatches}
          batchStatsMap={batchStatsMap}
          serviceOrdersMap={serviceOrdersMap}
          isLoading={isLoadingBatches}
          onOpenWizard={() => setIsWizardOpen(true)}
          onViewCaravans={handleViewCaravans}
          onOpenDetailDrawer={handleOpenDetailDrawer}
        />
      </Stack>

      {/* Service Batch Creation Wizard Modal */}
      <CreateServiceBatchWizardDialog
        open={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={() => refetchBatches()}
      />

      {/* Service Order / Batch Detail Drawer */}
      <ServiceOrderDetailDrawer
        open={Boolean(selectedBatch || selectedServiceOrder)}
        onClose={() => {
          setSelectedBatch(null);
          setSelectedServiceOrder(null);
        }}
        order={selectedServiceOrder}
        batch={selectedOrderBatch}
        batches={batches}
        caravans={caravans}
        onPrintSheet={(order) => setPrintSheetOrder(order)}
        onNavigateToServiceOrders={() => navigate('/gestation/service-orders')}
      />

      {/* Service Order Printable Sheet Dialog */}
      <ServiceOrderPrintSheetDialog
        open={Boolean(printSheetOrder)}
        onClose={() => setPrintSheetOrder(null)}
        order={printSheetOrder}
        caravans={caravans}
      />
    </ViewLayout>
  );
};

export default ServiceBatchesView;
