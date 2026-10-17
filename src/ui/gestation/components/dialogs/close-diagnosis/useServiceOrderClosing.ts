import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { ServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { type TactoEntryState, defaultReturnTo, pendingToClose, tactoStartPath } from '../../tacto-start/tactoStart';

/**
 * "Cerrar orden" from the diagnosis tray. With females still pending, the missing verdicts are
 * loaded first in "Cargar tacto" (close mode), which ends in the closing; without them, the
 * closing dialog opens right away.
 */
export function useServiceOrderClosing() {
  const navigate = useNavigate();
  const [closingOrder, setClosingOrder] = useState<ServiceOrder | null>(null);

  /** `returnTo`: where to land after closing; the tray, on that order, by default. */
  const requestClose = (order: ServiceOrder, returnTo?: string) => {
    if (pendingToClose(order) === 0) {
      setClosingOrder(order);
      return;
    }
    const state: TactoEntryState = { mode: 'close', returnTo: returnTo ?? defaultReturnTo(order.id) };
    navigate(tactoStartPath(order.id), { state });
  };

  return { closingOrder, requestClose, dismiss: () => setClosingOrder(null) };
}
