import { dec, toApi } from '@/core/stock/domain/rules/decimal';
import { inputSourcePayload } from '@/core/stock/domain/rules/lineConversion';
import { StockTransferPayload } from '@/core/stock/domain/entities/ItemDocument';
import { rowKey } from '@/ui/fiscal-documents/components/entry/fiscalEntryState';

/** A row of the transfer: an article with stock, how much, in which unit or presentation. */
export interface TransferLine {
	key: string;
	itemId: number | null;
	inputQuantity: string;
	inputSource: string;
}

export interface TransferHeader {
	fromWarehouseId: number | null;
	toWarehouseId: number | null;
	occurredAt: string;
	notes: string;
}

export const emptyTransferLine = (itemId: number | null = null, inputSource = ''): TransferLine => ({ key: rowKey(), itemId, inputQuantity: '', inputSource });
export const isBlankTransfer = (l: TransferLine): boolean => !l.itemId && !l.inputQuantity.trim();

/** There is always one empty row at the end to keep typing. */
export const withTrailingTransfer = (lines: TransferLine[]): TransferLine[] =>
	lines.length === 0 || !isBlankTransfer(lines[lines.length - 1]) ? [...lines, emptyTransferLine()] : lines;

export function buildTransferPayload(header: TransferHeader, lines: TransferLine[], key: string): { payload: StockTransferPayload; lineKeys: string[] } {
	const sent = lines.filter((l) => !isBlankTransfer(l));
	const quantity = (value: string) => {
		const parsed = dec(value);
		return parsed === null ? value.trim() : toApi(parsed, 4);
	};

	return {
		lineKeys: sent.map((l) => l.key),
		payload: {
			from_warehouse_id: header.fromWarehouseId ?? 0,
			to_warehouse_id: header.toWarehouseId ?? 0,
			occurred_at: header.occurredAt,
			notes: header.notes.trim() || null,
			idempotency_key: key,
			lines: sent.map((l) => ({ item_id: l.itemId ?? 0, input_quantity: quantity(l.inputQuantity), ...inputSourcePayload(l.inputSource) }))
		}
	};
}
