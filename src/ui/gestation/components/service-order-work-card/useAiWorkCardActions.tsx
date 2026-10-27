import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import AddRepasoBullsDialog from '../insemination-entry/AddRepasoBullsDialog';
import EndInseminationServiceDialog from '../insemination-entry/EndInseminationServiceDialog';

export const INSEMINATE_ICON = 'heroicons-outline:beaker';

/**
 * The AI actions of a tray order (semen S-B): load inseminations, add repaso bulls and end the service
 * from the menu. "Cargar inseminaciones" is the primary action while some female waits for her straw
 * and the tacto has not started; then the tray works it like any order.
 */
export function useAiWorkCardActions(order: ServiceOrder) {
  const navigate = useNavigate();
  const [dialog, setDialog] = useState<'end' | 'repaso' | null>(null);
  const ai = order.service_method === 'AI' ? order.insemination_summary : null;
  const inService = order.status === 'APPROVED';
  const summary = order.diagnosis_summary;
  const tactoStarted = (summary?.evaluated ?? 0) + (summary?.provisional_empty ?? 0) > 0;
  const repasoActive = (ai?.repaso_bulls_active ?? 0) > 0;

  return {
    isAi: ai !== null,
    inService,
    primaryIsInseminate: ai !== null && inService && ai.not_inseminated > 0 && !tactoStarted,
    /** The torada flag: natural in service, or AI with repaso bulls in the batch. */
    showsWithdrawal: inService && (ai === null || repasoActive),
    canAddRepaso: ai !== null && inService,
    canEndService: ai !== null && inService && !repasoActive,
    loadInseminations: () => navigate(`/gestation/service-orders/${order.id}/inseminations`),
    openEnd: () => setDialog('end'),
    openRepaso: () => setDialog('repaso'),
    dialogs: (
      <>
        {dialog === 'end' && <EndInseminationServiceDialog order={order} onClose={() => setDialog(null)} />}
        {dialog === 'repaso' && <AddRepasoBullsDialog order={order} onClose={() => setDialog(null)} />}
      </>
    ),
  };
}
