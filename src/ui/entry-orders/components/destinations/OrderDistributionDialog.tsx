import React, { useState } from 'react';
import { TextField } from '@mui/material';
import { toast } from 'sonner';
import { useOwnActiveBatches } from '@/features/batches/hooks/useOwnActiveBatches';
import { useRedistributeEntryOrder } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import { EntryOrder, entryOrderApiError, entryOrderErrorMessage } from '@/features/entry-orders/types';
import DistributeDestinationsDialog from '@/ui/batches/components/external/destination/DistributeDestinationsDialog';
import { needsTransitBatch } from '@/ui/batches/components/external/destination/coverage';
import { filledSx } from '@/ui/batches/components/external/externalFormParts';
import { batchNamesOfOrder, linesOfOrder, rulesOfOrder } from './orderDistribution';

interface OrderDistributionDialogProps {
  order: EntryOrder;
  open: boolean;
  onClose: () => void;
}

/**
 * "Editar distribución" of an order in course: where its animals go from now on. What was already
 * received stays where it is. Leaving something without a destination on an order that has no
 * transit batch asks the name of the one that is created.
 */
export const OrderDistributionDialog: React.FC<OrderDistributionDialogProps> = ({ order, open, onClose }) => {
  const { batches } = useOwnActiveBatches();
  const redistribute = useRedistributeEntryOrder();
  const [transitName, setTransitName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const lines = linesOfOrder(order);
  const asksName = (rules: ReturnType<typeof rulesOfOrder>) =>
    order.batch == null && needsTransitBatch(lines, order.sex_composition, rules);

  return (
    <DistributeDestinationsDialog
      open={open}
      lines={lines}
      composition={order.sex_composition}
      rules={rulesOfOrder(order)}
      batches={batches}
      batchNames={batchNamesOfOrder(order)}
      note={
        order.status === 'DRAFT'
          ? undefined
          : 'Rige para lo que se reciba desde ahora: lo ya recibido no se mueve (para eso está la transferencia).'
      }
      applyLabel="Guardar distribución"
      isPending={redistribute.isPending}
      footer={(rules) =>
        asksName(rules) && (
          <TextField
            label="Nombre del lote de tránsito"
            value={transitName}
            onChange={(e) => setTransitName(e.target.value)}
            variant="filled"
            fullWidth
            required
            error={!!nameError}
            helperText={nameError ?? 'Recibe los animales que quedan sin destino.'}
            sx={filledSx}
          />
        )
      }
      onClose={onClose}
      onApply={(rules) => {
        if (asksName(rules) && transitName.trim() === '') {
          setNameError('Escribí el nombre del lote de tránsito');
          return;
        }

        setNameError(null);
        redistribute.mutate(
          { id: order.id, payload: { destinations: rules, transit_batch_name: transitName.trim() || null } },
          {
            onSuccess: onClose,
            onError: (error) => {
              const body = entryOrderApiError(error);

              if (body?.field === 'transit_batch_name') setNameError(body.message ?? null);
              else toast.error(entryOrderErrorMessage(error, 'No se pudo guardar la distribución'));
            }
          }
        );
      }}
    />
  );
};

export default OrderDistributionDialog;
