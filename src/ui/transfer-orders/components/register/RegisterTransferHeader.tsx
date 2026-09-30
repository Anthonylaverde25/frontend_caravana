import React from 'react';
import { Box, Paper } from '@mui/material';
import type { Activity } from '@/core/activities/domain/entities/Activity';
import type { BatchType } from '@/core/batch-types/domain/entities/BatchType';
import type { TransferFormActivity } from '../../hooks/useTransferOrderFormOptions';
import type { RegisterTransferForm } from '../../hooks/useRegisterTransferForm';
import TransferOrderSourceFields from '../create/TransferOrderSourceFields';
import TransferOrderDestinationFields from '../create/TransferOrderDestinationFields';
import RegisterNewBatchField from './RegisterNewBatchField';
import RegisterTransferFactsFields from './RegisterTransferFactsFields';

interface RegisterTransferHeaderProps {
  form: RegisterTransferForm;
  sourceActivities: TransferFormActivity[];
  destinationActivities: TransferFormActivity[];
  activities: Activity[];
  batchTypes: BatchType[];
  isLoadingBatchTypes: boolean;
}

/** From where, to where, and when: the three questions of the movement, side by side. */
export const RegisterTransferHeader: React.FC<RegisterTransferHeaderProps> = ({
  form,
  sourceActivities,
  destinationActivities,
  activities,
  batchTypes,
  isLoadingBatchTypes
}) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, md: 2.5 },
      borderRadius: '8px',
      border: 1,
      borderColor: 'divider',
      display: 'grid',
      gap: { xs: 3, md: 3 },
      gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }
    }}
  >
    <TransferOrderSourceFields
      activities={sourceActivities}
      activityId={form.sourceActivityId}
      onActivityChange={form.changeSourceActivity}
      batchId={form.sourceBatchId}
      onBatchChange={form.changeSourceBatch}
      // A registration is born closed: it does not take the batch, so an active order is no obstacle.
      activeOrder={null}
      isCheckingOrders={false}
      onOpenActiveOrder={() => undefined}
    />

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <TransferOrderDestinationFields
        activities={destinationActivities}
        activityId={form.destinationActivityId}
        onActivityChange={form.changeDestinationActivity}
        destination={form.destination}
        onDestinationChange={form.setDestination}
        sourceBatchId={form.sourceBatchId}
        perAnimalHelper="Elegí el lote de cada animal en la columna Lote destino."
        newBatchHelper="Configuralo acá abajo: nombre, tipo y manejo."
      />
      {form.destination?.kind === 'new' && (
        <RegisterNewBatchField
          draft={form.newBatch}
          onChange={form.setNewBatch}
          activities={activities.filter((activity) => Number(activity.id) === form.destinationActivityId)}
          batchTypes={batchTypes}
          isLoadingBatchTypes={isLoadingBatchTypes}
        />
      )}
    </Box>

    <RegisterTransferFactsFields facts={form.facts} onChange={form.setFacts} today={form.today} />
  </Paper>
);

export default RegisterTransferHeader;
