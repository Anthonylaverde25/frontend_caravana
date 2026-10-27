import { Batch } from '@/core/batches/domain/entities/Batch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import CloseServiceOrderDialog from '../../dialogs/CloseServiceOrderDialog';
import CloseServiceOrderDiagnosisDialog from '../../dialogs/close-diagnosis/CloseServiceOrderDiagnosisDialog';
import ReplaceServiceBullDialog from '../../dialogs/replace-bull/ReplaceServiceBullDialog';
import ServiceOrdersRejectDialog from '../../service-orders/ServiceOrdersRejectDialog';

/** A bull to swap for one from the resting torada, in the order it serves. */
export interface BullReplacement {
  order: ServiceOrder;
  bull: Caravan;
}

interface ServicesQueueDialogsProps {
  batches: Batch[];
  caravans: Caravan[];
  withdrawing: ServiceOrder | null;
  onWithdrawDone: () => void;
  replacing: BullReplacement | null;
  onReplaceDone: () => void;
  closingOrder: ServiceOrder | null;
  onClosingDone: () => void;
  rejecting: ServiceOrder | null;
  onRejectCancel: () => void;
  onRejectSubmit: (reason: string) => void;
  isRejecting: boolean;
}

/** The dialogs the next steps of the queue open: torada withdrawal, bull swap, closing, rejection. */
export default function ServicesQueueDialogs({
  batches,
  caravans,
  withdrawing,
  onWithdrawDone,
  replacing,
  onReplaceDone,
  closingOrder,
  onClosingDone,
  rejecting,
  onRejectCancel,
  onRejectSubmit,
  isRejecting,
}: ServicesQueueDialogsProps) {
  return (
    <>
      {withdrawing && (
        <CloseServiceOrderDialog
          open
          onClose={onWithdrawDone}
          order={withdrawing}
          batch={batches.find((b) => b.id === withdrawing.batch_id) ?? null}
          batches={batches}
          caravans={caravans}
          onSuccess={onWithdrawDone}
        />
      )}

      {replacing && (
        <ReplaceServiceBullDialog
          open
          onClose={onReplaceDone}
          bull={replacing.bull}
          order={replacing.order}
          batches={batches}
          caravans={caravans}
          onSuccess={onReplaceDone}
        />
      )}

      {closingOrder && <CloseServiceOrderDiagnosisDialog open order={closingOrder} onClose={onClosingDone} />}

      <ServiceOrdersRejectDialog open={rejecting !== null} onClose={onRejectCancel} onSubmit={onRejectSubmit} isSubmitting={isRejecting} />
    </>
  );
}
