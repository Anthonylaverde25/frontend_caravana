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

import { WeaningBatchSummaryCards, WeaningBatchKPIs } from '../components/weaning-batches/WeaningBatchSummaryCards';
import { WeaningBatchDataTable } from '../components/weaning-batches/WeaningBatchDataTable';
import { WeaningBatchDetailDrawer } from '../components/weaning-batches/WeaningBatchDetailDrawer';
import CreateWeaningBatchDialog from '../components/dialogs/CreateWeaningBatchDialog';

export const WeaningBatchesView: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const { activeCompanyId } = useCompany();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // Fetch batches & caravans
  const { data: batches = [], isLoading: isLoadingBatches, refetch: refetchBatches } = useBatches(
    undefined,
    undefined,
    'own'
  );
  const { data: caravans = [] } = useCaravans(activeCompanyId, 'own');

  // Filter Weaning Batches only
  const weaningBatches = useMemo(() => {
    return batches.filter((b) => b.isWeaning());
  }, [batches]);

  // Aggregate stats per weaning batch (calves count & sex distribution)
  const batchStatsMap = useMemo(() => {
    const map = new Map<number, { total: number; males: number; females: number }>();
    weaningBatches.forEach((batch) => {
      const batchCaravans = caravans.filter((c) => c.batch_id === batch.id);
      const males = batchCaravans.filter(
        (c) => c.sex === 'M' || (c.sex as string) === 'MACHO'
      ).length;
      const females = batchCaravans.filter(
        (c) => c.sex === 'H' || (c.sex as string) === 'F' || (c.sex as string) === 'HEMBRA'
      ).length;
      map.set(batch.id, {
        total: batchCaravans.length,
        males,
        females,
      });
    });
    return map;
  }, [weaningBatches, caravans]);

  // KPIs
  const kpis: WeaningBatchKPIs = useMemo(() => {
    let totalActive = 0;
    let totalCalves = 0;
    let totalMales = 0;
    let totalFemales = 0;
    let weightSum = 0;
    let weightCount = 0;

    weaningBatches.forEach((b) => {
      const stats = batchStatsMap.get(b.id) || { total: 0, males: 0, females: 0 };
      if (b.isActive()) {
        totalActive++;
        totalCalves += stats.total;
        totalMales += stats.males;
        totalFemales += stats.females;
      }
      const w = b.current_weight ?? b.weight;
      if (w != null && w > 0) {
        weightSum += w;
        weightCount++;
      }
    });

    const avgWeight = weightCount > 0 ? Number((weightSum / weightCount).toFixed(1)) : 0;

    return {
      totalBatches: weaningBatches.length,
      totalActive,
      totalCalves,
      totalMales,
      totalFemales,
      avgWeight,
    };
  }, [weaningBatches, batchStatsMap]);

  const handleViewCaravans = (batchId: number) => {
    navigate(`/caravans?batch_id=${batchId}`);
  };

  const handleOpenDetailDrawer = (batch: Batch) => {
    setSelectedBatch(batch);
  };

  return (
    <ViewLayout
      title="Lotes de Destete"
      subtitle="Supervisión zootécnica, pesaje de desmadre y acostumbramiento de terneros"
      actions={
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={() => navigate('/work-templates/DEST-01')}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '6px',
              px: 2,
            }}
          >
            Imprimir Planilla DEST-01
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate('/gestation/births')}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:sparkles</FuseSvgIcon>}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '6px',
              px: 2,
            }}
          >
            Registrar Destete (Partos)
          </Button>

          <Button
            variant="contained"
            onClick={() => setIsCreateOpen(true)}
            startIcon={<FuseSvgIcon size={18}>heroicons-outline:plus</FuseSvgIcon>}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '6px',
              px: 2.5,
              bgcolor: '#8b5cf6',
              '&:hover': { bgcolor: '#7c3aed' },
            }}
          >
            Nuevo Lote de Destete
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2.5}>
        {/* KPI Summary Cards */}
        <WeaningBatchSummaryCards kpis={kpis} isDark={isDark} />

        {/* Tabular Weaning Batches DataTable */}
        <WeaningBatchDataTable
          batches={weaningBatches}
          batchStatsMap={batchStatsMap}
          isLoading={isLoadingBatches}
          onOpenCreateDialog={() => setIsCreateOpen(true)}
          onViewCaravans={handleViewCaravans}
          onOpenDetailDrawer={handleOpenDetailDrawer}
        />
      </Stack>

      {/* Weaning Batch Creation Dialog */}
      <CreateWeaningBatchDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => refetchBatches()}
      />

      {/* Weaning Batch Detail Drawer */}
      <WeaningBatchDetailDrawer
        open={Boolean(selectedBatch)}
        onClose={() => setSelectedBatch(null)}
        batch={selectedBatch}
        caravans={caravans}
        onNavigateToCaravans={handleViewCaravans}
      />
    </ViewLayout>
  );
};

export default WeaningBatchesView;
