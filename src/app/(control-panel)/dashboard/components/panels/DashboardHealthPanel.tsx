import React from 'react';
import { Stack } from '@mui/material';
import { FioriHealthAnalyticalContainer } from './health/FioriHealthAnalyticalContainer';
import { FioriHealthAlvGrid } from './health/FioriHealthAlvGrid';

export interface QuarantineCaravan {
  id: string;
  tag: string;
  entryDate: string;
  diagnosis: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  daysIsolated: number;
}

export interface ConsumptionCaravan {
  id: string;
  tag: string;
  assignDate: string;
  weight: number;
  destination: string;
  status: string;
}

export interface DeathCaravan {
  id: string;
  tag: string;
  deathDate: string;
  cause: string;
  diagnosedBy: string;
  status: string;
}

interface DashboardHealthPanelProps {
  quarantineData: QuarantineCaravan[];
  consumptionData: ConsumptionCaravan[];
  deathData: DeathCaravan[];
  onActionClick: (action: string, tag: string) => void;
}

export const DashboardHealthPanel: React.FC<DashboardHealthPanelProps> = ({
  quarantineData,
  consumptionData,
  deathData,
  onActionClick,
}) => {
  return (
    <Stack spacing={3}>
      {/* 1. Unified Health Analytical Dual Container */}
      <FioriHealthAnalyticalContainer
        quarantineData={quarantineData}
        consumptionData={consumptionData}
        deathData={deathData}
      />

      {/* 2. SAP ALV Grid for Health Quarantine, Consumption & Deaths */}
      <FioriHealthAlvGrid
        quarantineData={quarantineData}
        consumptionData={consumptionData}
        deathData={deathData}
        onActionClick={onActionClick}
      />
    </Stack>
  );
};

export default DashboardHealthPanel;
