import React, { useState, useMemo } from 'react';
import { Box, Stack, CircularProgress, Typography, useTheme } from '@mui/material';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useBatchTypes } from '@/features/batch-types/hooks/useBatchTypes';
import { useFarms } from '@/features/suppliers/hooks/useFarms';
import { useCompany } from '@/contexts/CompanyContext';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { BatchFiltersBar } from '../filters/BatchFiltersBar';
import { useBatchFilters } from '../filters/useBatchFilters';
import { OwnBatchCard } from './OwnBatchCard';
import { OwnBatchesEmptyState } from './OwnBatchesEmptyState';
import AddCaravansDialog from '../AddCaravansDialog';
import { BatchDetailsDialog } from '../BatchDetailsDialog';
import StartBatchServiceDialog from '../dialogs/StartBatchServiceDialog';

interface OwnBatchesContainerProps {
  onCreateBatch?: () => void;
}

export const OwnBatchesContainer: React.FC<OwnBatchesContainerProps> = ({ onCreateBatch }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { activeCompanyId } = useCompany();

  // Dialog States
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isAddCaravansOpen, setIsAddCaravansOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [startServiceBatch, setStartServiceBatch] = useState<Batch | null>(null);

  // Queries
  const { data: batches, isLoading: isLoadingBatches, isError: isErrorBatches } = useBatches(
    undefined,
    undefined,
    'own'
  );
  const { data: activities } = useActivities(activeCompanyId);
  const { data: batchTypes } = useBatchTypes();
  const { data: farms } = useFarms();

  const safeBatches = useMemo(() => (Array.isArray(batches) ? batches : []), [batches]);
  const safeActivities = useMemo(() => (Array.isArray(activities) ? activities : []), [activities]);
  const safeBatchTypes = useMemo(() => (Array.isArray(batchTypes) ? batchTypes : []), [batchTypes]);
  const safeFarms = useMemo(() => (Array.isArray(farms) ? farms : []), [farms]);

  // Separate own batches (batches without provider)
  const ownBatches = useMemo(() => {
    return safeBatches.filter((b) => b && (b.provider_id === null || b.provider_id === undefined));
  }, [safeBatches]);

  // Filters Hook
  const {
    filters,
    setSearch,
    setActivityId,
    setBatchTypeId,
    setFarmId,
    setLifecycleStatus,
    setOperationalStatus,
    resetFilters,
    activeFiltersCount,
    activityOptions,
    batchTypeOptions,
    farmOptions,
    filteredBatches,
    summaryKPIs,
  } = useBatchFilters({
    batches: ownBatches,
    activities: safeActivities,
    batchTypes: safeBatchTypes,
    farms: safeFarms,
  });

  const handleViewDetails = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsDetailsOpen(true);
  };

  const handleAddCaravans = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsAddCaravansOpen(true);
  };

  const handleStartService = (batch: Batch) => {
    setStartServiceBatch(batch);
  };

  if (isLoadingBatches) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorBatches) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'error.lighter', color: 'error.main' }}>
        <Typography variant="h6">Error al cargar los lotes propios</Typography>
        <Typography variant="body2">Por favor, intente recargar la página más tarde.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Dynamic Filters Bar */}
      <BatchFiltersBar
        filters={filters}
        onSearchChange={setSearch}
        onActivityChange={setActivityId}
        onBatchTypeChange={setBatchTypeId}
        onFarmChange={setFarmId}
        onLifecycleStatusChange={setLifecycleStatus}
        onOperationalStatusChange={setOperationalStatus}
        onResetFilters={resetFilters}
        activeFiltersCount={activeFiltersCount}
        activityOptions={activityOptions}
        batchTypeOptions={batchTypeOptions}
        farmOptions={farmOptions}
        summaryKPIs={summaryKPIs}
        totalAvailableBatches={ownBatches.length}
      />

      {/* Batches Content List */}
      <Box
        sx={{
          p: 3,
          bgcolor: isDark ? 'background.default' : '#fafafa',
        }}
      >
        {filteredBatches.length > 0 ? (
          <Stack spacing={1.5}>
            {filteredBatches.map((batch) => (
              <OwnBatchCard
                key={batch.id}
                batch={batch}
                onViewDetails={handleViewDetails}
                onAddCaravans={handleAddCaravans}
                onStartService={handleStartService}
              />
            ))}
          </Stack>
        ) : (
          <OwnBatchesEmptyState
            hasActiveFilters={activeFiltersCount > 0}
            onResetFilters={resetFilters}
            onCreateBatch={onCreateBatch}
          />
        )}
      </Box>

      {/* Action Dialogs */}
      <AddCaravansDialog
        open={isAddCaravansOpen}
        onClose={() => setIsAddCaravansOpen(false)}
        batch={selectedBatch}
      />

      <BatchDetailsDialog
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        batch={selectedBatch}
        onStartService={(batch) => {
          setIsDetailsOpen(false);
          setStartServiceBatch(batch);
        }}
      />

      <StartBatchServiceDialog
        open={Boolean(startServiceBatch)}
        onClose={() => setStartServiceBatch(null)}
        batch={startServiceBatch}
      />
    </Box>
  );
};
