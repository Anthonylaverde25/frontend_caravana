import { useSearchParams } from 'react-router';
import { useEntryOrder } from '@/features/entry-orders/hooks/useEntryOrders';
import type { EntryOrder, EntryOrderAnimal, EntryOrderBreed, EntryOrderReceiptSheet, EntryOrderSummary } from '@/features/entry-orders/types';

/** Lines per page and free lines after the listed caravans: the same numbers the server counts pages with. */
export const ING03_ROWS_PER_PAGE = 20;
export const ING03_FREE_ROWS = 4;

export interface Ing03Sheet {
  order: EntryOrder | null;
  sheet: EntryOrderReceiptSheet | null;
  /** The caravans the sheet printed, in print order. */
  animals: EntryOrderAnimal[];
  isLoading: boolean;
}

/**
 * The ING-03 being printed: `?entryOrderId=&receiptSheetId=` names the order and the sheet issued
 * for one of its DTEs. The caravans are the ones the sheet recorded when it was issued, not what is
 * in transit now: a reprint must show the same lines as the paper already in the field.
 */
export const useIng03Sheet = (): Ing03Sheet => {
  const [searchParams] = useSearchParams();
  const orderId = Number(searchParams.get('entryOrderId')) || null;
  const sheetId = Number(searchParams.get('receiptSheetId')) || null;
  const { data: order, isLoading } = useEntryOrder(orderId);
  const sheet = order?.receipt_sheets?.find((s) => s.id === sheetId) ?? null;
  const byCaravan = new Map((order?.dtes ?? []).flatMap((dte) => dte.animals ?? []).map((a) => [a.caravan_id, a]));
  const animals = (sheet?.caravan_ids ?? []).map((id) => byCaravan.get(id)).filter((a): a is EntryOrderAnimal => a != null);

  return { order: order ?? null, sheet, animals, isLoading: isLoading && orderId != null };
};

/** Where the ING-03 of a sheet is printed. */
export const ing03Url = (orderId: number, sheetId: number): string => `/work-templates/ING-03?entryOrderId=${orderId}&receiptSheetId=${sheetId}`;

/**
 * The breed line of a caravan: what the DTE says, or the order's only breed when the DTE left it
 * blank (a single-breed troop inherits it).
 */
export const breedOf = (order: Pick<EntryOrderSummary, 'breeds'>, animal: Pick<EntryOrderAnimal, 'breed_position'>): EntryOrderBreed | undefined =>
  animal.breed_position != null ? order.breeds.find((b) => b.position === animal.breed_position) : order.breeds.length === 1 ? order.breeds[0] : undefined;

/** The breed and coat of a caravan as the sheet prints them, each in its own column ("Angus", "Colorado"). */
export const breedAndCoatOf = (order: Pick<EntryOrderSummary, 'breeds'>, animal: Pick<EntryOrderAnimal, 'breed_position'>): { breed: string; coat: string } => {
  const line = breedOf(order, animal);

  return { breed: line?.breed_name ?? '', coat: line?.color_name ?? '' };
};
