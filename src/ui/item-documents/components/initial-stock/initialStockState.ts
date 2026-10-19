import { dec, toApi } from '@/core/stock/domain/rules/decimal';
import { inputSourcePayload } from '@/core/stock/domain/rules/lineConversion';
import { InitialStockPayload } from '@/core/stock/domain/entities/ItemDocument';
import { rowKey } from '@/ui/fiscal-documents/components/entry/fiscalEntryState';

/** A row of the initial stock: an article, how much there was and what it cost (0 if unknown). */
export interface InitialStockLine {
	key: string;
	itemId: number | null;
	inputQuantity: string;
	inputSource: string;
	unitPrice: string;
}

export const emptyInitialLine = (): InitialStockLine => ({ key: rowKey(), itemId: null, inputQuantity: '', inputSource: '', unitPrice: '' });
export const isBlankInitial = (l: InitialStockLine): boolean => !l.itemId && !l.inputQuantity.trim() && !l.unitPrice.trim();

const decimal = (value: string, scale: number): string => {
	const parsed = dec(value);
	return parsed === null ? value.trim() : toApi(parsed, scale);
};

export function buildInitialPayload(lines: InitialStockLine[], warehouseId: number | null, occurredAt: string, notes: string, key: string): { payload: InitialStockPayload; lineKeys: string[] } {
	const sent = lines.filter((l) => !isBlankInitial(l));

	return {
		lineKeys: sent.map((l) => l.key),
		payload: {
			warehouse_id: warehouseId,
			occurred_at: occurredAt,
			notes: notes.trim() || null,
			idempotency_key: key,
			lines: sent.map((l) => ({
				item_id: l.itemId ?? 0,
				input_quantity: decimal(l.inputQuantity, 4),
				...inputSourcePayload(l.inputSource),
				input_unit_price: decimal(l.unitPrice, 6)
			}))
		}
	};
}
