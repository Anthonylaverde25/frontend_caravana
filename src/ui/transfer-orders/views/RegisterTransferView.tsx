import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Box, Stack } from '@mui/material';
import ViewLayout from '@/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useBatchTypes } from '@/features/batch-types/hooks/useBatchTypes';
import { useRegisterTransfer } from '@/features/transfer-orders/hooks/useTransferOrderMutations';
import TransferSummaryCards from '@/ui/activities/components/transfer/TransferSummaryCards';
import TransferAnimalsTable from '@/ui/activities/components/transfer/TransferAnimalsTable';
import { ConfigureDestinationBatchDialog } from '@/ui/activities/components/transfer/ConfigureDestinationBatchDialog';
import { useTransferOrderFormOptions } from '../hooks/useTransferOrderFormOptions';
import { useRegisterTransferForm } from '../hooks/useRegisterTransferForm';
import RegisterTransferHeader from '../components/register/RegisterTransferHeader';
import RegisterTransferActionBar from '../components/register/RegisterTransferActionBar';
import PasteCaravansField from '../components/register/PasteCaravansField';
import RegisterFieldChangesBar from '../components/register/RegisterFieldChangesBar';
import { useRegisterFieldEditor } from '../hooks/useRegisterFieldEditor';
import { useRegisterDestinations } from '../hooks/useRegisterDestinations';
import RegisterDestinationAutocomplete from '../components/register/destinations/RegisterDestinationAutocomplete';
import RegisterDestinationsSummary from '../components/register/destinations/RegisterDestinationsSummary';
import type { FieldSourceCaravan } from '../hooks/useRegisterFieldData';
import { describeChanges } from '../components/register/registerFieldData';
import ConfirmRegisterTransferDialog, {
  RegisterTransferSummary
} from '../components/register/ConfirmRegisterTransferDialog';

/**
 * "Registrar transferencia": the animals already moved in the field, and the system learns it
 * afterwards. Origin, destination and the day it happened on top; the animals that moved below.
 * The order it creates is born executed.
 */
export const RegisterTransferView: React.FC = () => {
  const navigate = useNavigate();
  const { activeCompanyId } = useCompany();
  const { data: activities = [] } = useActivities(activeCompanyId);
  const { data: batchTypes = [], isLoading: isLoadingBatchTypes } = useBatchTypes();
  const { sourceActivities, destinationActivities } = useTransferOrderFormOptions();
  const form = useRegisterTransferForm();
  const register = useRegisterTransfer();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const destinationActivityId = form.destinationActivityId === '' ? null : form.destinationActivityId;
  const baseEditor = useRegisterFieldEditor(
    form.fieldData,
    form.sourceCaravans as unknown as FieldSourceCaravan[],
    activities.find((activity) => Number(activity.id) === Number(destinationActivityId))?.code ?? null
  );
  // The batches a row can go to: those of the declared destination activity, never the source.
  const destinationBatches = (
    destinationActivities.find((activity) => activity.id === destinationActivityId)?.batches ?? []
  ).filter((batch) => batch.id !== form.sourceBatchId);
  const destinations = useRegisterDestinations(form.perAnimal, destinationActivityId, destinationBatches);
  const fieldEditor = form.perAnimalMode
    ? {
        ...baseEditor,
        renderDestination: (caravanId: number) => (
          <RegisterDestinationAutocomplete
            state={destinations}
            caravanIds={[caravanId]}
            value={destinations.optionOf(caravanId)}
            placeholder="Buscar o crear lote…"
            ariaLabel="Lote destino"
          />
        ),
        renderBulkDestination: (caravanIds: number[]) => (
          <RegisterDestinationAutocomplete
            state={destinations}
            caravanIds={caravanIds}
            value={null}
            placeholder={`Asignar marcados (${caravanIds.length})…`}
            ariaLabel="Asignar lote a los marcados"
          />
        )
      }
    : baseEditor;

  const destinationName =
    form.destination?.kind === 'existing'
      ? (form.targetBatch?.name ?? null)
      : form.destination?.kind === 'new'
        ? form.newBatch.name.trim() || null
        : null;
  const usedPerAnimal = form.perAnimal.destinations.filter((d) =>
    form.selectedIds.some((id) => form.perAnimal.assignments[id] === d.key)
  );
  const perAnimalCount = usedPerAnimal.length;
  // One batch per animal that all landed in the same place still has a name to show.
  const perAnimalName = perAnimalCount === 1 ? usedPerAnimal[0].name.trim() || null : null;

  const summary: RegisterTransferSummary | null = form.sourceBatch
    ? {
        sourceName: form.sourceBatch.name,
        destinationName: form.perAnimalMode ? `${perAnimalCount} lote(s), uno por animal` : (destinationName ?? '—'),
        headCount: form.selectedIds.length,
        movementDate: form.facts.movementDate,
        isToday: form.facts.movementDate === form.today,
        responsable: form.facts.responsable.trim() || null,
        fieldChanges: describeChanges(form.fieldData.changes)
      }
    : null;

  const confirm = () => {
    if (!form.payload) return;

    const sentIds = form.payload.animals.map((animal) => animal.caravan_id);

    register.mutate(form.payload, {
      onSuccess: ({ order }) => {
        setIsConfirmOpen(false);
        navigate(`/transfer-orders?orderId=${order.id}`);
      },
      // A row the server refused goes back to its animal, and the screen stays as it was.
      onError: (error) => {
        setIsConfirmOpen(false);
        form.fieldData.applyServerErrors(
          (error as { response?: { data?: Parameters<typeof form.fieldData.applyServerErrors>[0] } })?.response?.data,
          sentIds
        );
      }
    });
  };

  return (
    <ViewLayout
      title="Registrar transferencia"
      subtitle="Un movimiento que ya se hizo en el campo. Queda como una orden ejecutada, con la fecha en que ocurrió."
      showBackButton
      backUrl="/transfer-orders"
      actions={
        <RegisterTransferActionBar
          selectedCount={form.selectedIds.length}
          blockedReason={form.blockedReason}
          isPending={register.isPending}
          onRegister={() => setIsConfirmOpen(true)}
        />
      }
    >
      <Stack spacing={2.5}>
        <RegisterTransferHeader
          form={form}
          sourceActivities={sourceActivities}
          destinationActivities={destinationActivities}
          activities={activities}
          batchTypes={batchTypes}
          isLoadingBatchTypes={isLoadingBatchTypes}
        />

        {form.sourceBatch == null ? (
          <Alert severity="info" sx={{ borderRadius: '6px' }}>
            Elegí la actividad y el lote de origen para ver sus animales.
          </Alert>
        ) : (
          <>
            <TransferSummaryCards
              sourceName={form.sourceBatch.name}
              destinationName={form.perAnimalMode ? perAnimalName : destinationName}
              isNewDestination={!form.perAnimalMode && form.destination?.kind === 'new'}
              isDestinationChosen={form.perAnimalMode ? perAnimalCount > 0 : destinationName != null}
              destinationCount={form.perAnimalMode ? perAnimalCount : 1}
              {...form.figures}
            />

            {form.perAnimalMode && destinationActivityId != null && (
              <RegisterDestinationsSummary perAnimal={form.perAnimal} state={destinations} selectedIds={form.selectedIds} />
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              <Box sx={{ flex: '1 1 360px' }}>
                <PasteCaravansField
                  caravans={form.sourceCaravans}
                  selectedIds={form.selectedIds}
                  onSelectionChange={form.setSelectedIds}
                />
              </Box>
              <RegisterFieldChangesBar state={form.fieldData} />
            </Box>

            <TransferAnimalsTable
              caravans={form.sourceCaravans}
              isLoading={form.isLoadingCaravans}
              selectedIds={form.selectedIds}
              onSelectionChange={form.setSelectedIds}
              destinations={form.perAnimalMode ? form.perAnimal.destinations : undefined}
              assignments={form.perAnimal.assignments}
              onAssign={form.perAnimalMode ? form.perAnimal.assign : undefined}
              fieldEditor={fieldEditor}
            />
          </>
        )}
      </Stack>

      <ConfigureDestinationBatchDialog
        open={destinations.pending != null}
        onClose={destinations.cancelNewBatch}
        onSave={destinations.saveNewBatch}
        draft={destinations.pending?.draft ?? { name: '' }}
        activities={activities.filter((activity) => Number(activity.id) === destinationActivityId)}
        batchTypes={batchTypes}
        isLoadingBatchTypes={isLoadingBatchTypes}
      />

      <ConfirmRegisterTransferDialog
        open={isConfirmOpen}
        summary={summary}
        isPending={register.isPending}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirm}
      />
    </ViewLayout>
  );
};

export default RegisterTransferView;
