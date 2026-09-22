import React, { useMemo, useRef, useEffect } from 'react';
import { Drawer, Box, Divider, Typography } from '@mui/material';
import { Batch } from '@/core/batches/domain/entities/Batch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';

import { WeaningBatchDrawerHeader } from './drawer/WeaningBatchDrawerHeader';
import { WeaningBatchMetricsCard } from './drawer/WeaningBatchMetricsCard';
import { WeaningBatchCalvesList } from './drawer/WeaningBatchCalvesList';
import { WeaningBatchActionToolbar } from './drawer/WeaningBatchActionToolbar';

interface WeaningBatchDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  batch: Batch | null;
  caravans: Caravan[];
  onNavigateToCaravans: (batchId: number) => void;
}

export const WeaningBatchDetailDrawer: React.FC<WeaningBatchDetailDrawerProps> = ({
  open,
  onClose,
  batch,
  caravans,
  onNavigateToCaravans,
}) => {
  // Retain last selected batch in ref to prevent empty renders during exit animation
  const lastBatchRef = useRef<Batch | null>(batch);

  useEffect(() => {
    if (batch) lastBatchRef.current = batch;
  }, [batch]);

  const currentBatch = batch ?? (open ? batch : lastBatchRef.current);

  // Calves belonging to this batch
  const batchCalves = useMemo(() => {
    if (!currentBatch) return [];
    return caravans.filter((c) => c.batch_id === currentBatch.id);
  }, [currentBatch, caravans]);

  const males = useMemo(
    () => batchCalves.filter((c) => c.sex === 'M' || (c.sex as string) === 'MACHO'),
    [batchCalves]
  );
  const females = useMemo(
    () => batchCalves.filter((c) => c.sex === 'H' || (c.sex as string) === 'F' || (c.sex as string) === 'HEMBRA'),
    [batchCalves]
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460, md: 500 },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <WeaningBatchDrawerHeader batch={currentBatch} onClose={onClose} />

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        <WeaningBatchMetricsCard
          batch={currentBatch}
          calvesCount={batchCalves.length}
          malesCount={males.length}
          femalesCount={females.length}
        />

        {currentBatch?.observaciones && (
          <Box sx={{ mt: 2, p: 1.5, borderRadius: '6px', bgcolor: 'action.hover' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Observaciones / Notas:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.primary' }}>
              {currentBatch.observaciones}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2.5 }} />

        <WeaningBatchCalvesList
          calves={batchCalves}
          onNavigateToCaravans={() => currentBatch && onNavigateToCaravans(currentBatch.id)}
        />
      </Box>

      <WeaningBatchActionToolbar
        onClose={onClose}
        onNavigateToCaravans={() => currentBatch && onNavigateToCaravans(currentBatch.id)}
        calvesCount={batchCalves.length}
      />
    </Drawer>
  );
};

export default WeaningBatchDetailDrawer;
