import { dec, toApi } from '@/core/stock/domain/rules/decimal';
import { inputSourcePayload } from '@/core/stock/domain/rules/lineConversion';
import { ConsumptionPayload } from '@/core/stock/domain/entities/ItemDocument';
import { rowKey } from '@/ui/fiscal-documents/components/entry/fiscalEntryState';

/** A row of the consumption: an article with stock, how much, in which unit or presentation. */
export interface ConsumptionLine {
	key: string;
	itemId: number | null;
	inputQuantity: string;
	inputSource: string;
}

export const emptyConsumptionLine = (): ConsumptionLine => ({ key: rowKey(), itemId: null, inputQuantity: '', inputSource: '' });
export const isBlankConsumption = (l: ConsumptionLine): boolean => !l.itemId && !l.inputQuantity.trim();

/** There is always one empty row at the end to keep typing. */
export const withTrailingConsumption = (lines: ConsumptionLine[]): ConsumptionLine[] =>
	lines.length === 0 || !isBlankConsumption(lines[lines.length - 1]) ? [...lines, emptyConsumptionLine()] : lines;

export interface ConsumptionHeader {
	/** Null: the default warehouse (DD6). */
	warehouseId: number | null;
	batchId: number | null;
	batchName: string | null;
	heads: string;
	occurredAt: string;
	notes: string;
}

export function buildConsumptionPayload(header: ConsumptionHeader, lines: ConsumptionLine[], key: string): { payload: ConsumptionPayload; lineKeys: string[] } {
	const sent = lines.filter((l) => !isBlankConsumption(l));
	const quantity = (value: string) => {
		const parsed = dec(value);
		return parsed === null ? value.trim() : toApi(parsed, 4);
	};

	return {
		lineKeys: sent.map((l) => l.key),
		payload: {
			warehouse_id: header.warehouseId,
			occurred_at: header.occurredAt,
			batch_id: header.batchId,
			heads_treated: header.batchId && header.heads ? Number(header.heads) : null,
			notes: header.notes.trim() || null,
			idempotency_key: key,
			lines: sent.map((l) => ({ item_id: l.itemId ?? 0, input_quantity: quantity(l.inputQuantity), ...inputSourcePayload(l.inputSource) }))
		}
	};
}
