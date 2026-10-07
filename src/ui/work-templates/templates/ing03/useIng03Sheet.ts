import { useSearchParams } from 'react-router';
import { useEntryOrder } from '@/features/entry-orders/hooks/useEntryOrders';
import type { EntryOrder, EntryOrderReceiptSheet, EntryOrderSummary } from '@/features/entry-orders/types';

/** Lines per page: the same number the server counts pages with. */
export const ING03_ROWS_PER_PAGE = 20;

export interface Ing03Sheet {
  order: EntryOrder | null;
  sheet: EntryOrderReceiptSheet | null;
  isLoading: boolean;
}

/**
 * The ING-03 being printed: `?entryOrderId=&receiptSheetId=` names the order and the sheet issued
 * for one of its DTEs. Its lines are blank — one per head in transit when it was issued, plus the
 * free ones — so a reprint shows the same paper already in the field.
 */
export const useIng03Sheet = (): Ing03Sheet => {
  const [searchParams] = useSearchParams();
  const orderId = Number(searchParams.get('entryOrderId')) || null;
  const sheetId = Number(searchParams.get('receiptSheetId')) || null;
  const { data: order, isLoading } = useEntryOrder(orderId);
  const sheet = order?.receipt_sheets?.find((s) => s.id === sheetId) ?? null;

  return { order: order ?? null, sheet, isLoading: isLoading && orderId != null };
};

/** Where the ING-03 of a sheet is printed. */
export const ing03Url = (orderId: number, sheetId: number): string => `/work-templates/ING-03?entryOrderId=${orderId}&receiptSheetId=${sheetId}`;

/** "Braford Colorado", or "A · Braford Colorado" when the order has several breed lines. */
export const breedLabelOf = (order: Pick<EntryOrderSummary, 'breeds'>, position: number | null): string => {
  const line = position != null ? order.breeds.find((b) => b.position === position) : order.breeds.length === 1 ? order.breeds[0] : undefined;

  return line ? (order.breeds.length > 1 ? `${line.letter} · ${line.label}` : line.label) : 'Sin declarar';
};
