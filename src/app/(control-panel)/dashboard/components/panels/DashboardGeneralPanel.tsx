import React from 'react';
import { Stack } from '@mui/material';
import { DashboardKPIs } from '../cards/DashboardSummaryCards';
import { QuarantineCaravan, ConsumptionCaravan, DeathCaravan } from './DashboardHealthPanel';
import { FioriDualAnalyticalContainer } from '../charts/FioriDualAnalyticalContainer';
import { FioriAlvGridTable } from '../tables/FioriAlvGridTable';

interface DashboardGeneralPanelProps {
  kpis: DashboardKPIs;
  quarantineData: QuarantineCaravan[];
  consumptionData: ConsumptionCaravan[];
  deathData: DeathCaravan[];
  onActionClick?: (action: string, tag: string) => void;
}

export const DashboardGeneralPanel: React.FC<DashboardGeneralPanelProps> = ({
  kpis,
  quarantineData,
  consumptionData,
  deathData,
}) => {
  return (
    <Stack spacing={3}>
      {/* 1. Unified Dual Analytical Container */}
      <FioriDualAnalyticalContainer
        quarantineCount={quarantineData.length || kpis.quarantineCount}
        consumptionCount={consumptionData.length || kpis.consumptionCount}
        deathCount={deathData.length || kpis.deathCount}
      />

      {/* 2. SAP ALV Grid: Comprehensive Breeding Herd Management */}
      <FioriAlvGridTable />
    </Stack>
  );
};

export default DashboardGeneralPanel;
