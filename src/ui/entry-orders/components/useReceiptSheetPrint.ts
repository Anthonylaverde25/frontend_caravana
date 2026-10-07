import { useNavigate } from 'react-router';
import { useIssueReceiptSheet } from '@/features/entry-orders/hooks/useEntryOrderMutations';
import type { EntryOrderSummary } from '@/features/entry-orders/types';
import { ing03Url } from '@/ui/work-templates/templates/ing03';

type SheetDte = EntryOrderSummary['dtes'][number];

/**
 * Opens the ING-03 of a DTE to print it: the sheet still out, unless the DTE's head were corrected
 * since it was issued; otherwise a new one is issued (replacing it) and opened. Shared by the tray
 * and the order detail.
 */
export const useReceiptSheetPrint = () => {
  const navigate = useNavigate();
  const issue = useIssueReceiptSheet();

  const open = (order: EntryOrderSummary, dte: SheetDte) => {
    const current = order.receipt_sheets?.find((s) => s.dte_id === dte.id && s.is_active);

    if (current && !current.outdated) {
      navigate(ing03Url(order.id, current.id));
      return;
    }

    issue.mutate(
      { id: order.id, dteId: dte.id },
      {
        onSuccess: (result) => {
          const created = result.order.receipt_sheets.find((s) => s.number === result.sheet_number);

          if (created) navigate(ing03Url(order.id, created.id));
        }
      }
    );
  };

  return { open, isPending: issue.isPending };
};
