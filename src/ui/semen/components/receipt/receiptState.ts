import { SemenReceiptPayload, SemenType } from '@/core/semen/domain/entities/Semen';
import { rowKey } from '@/ui/fiscal-documents/components/entry/fiscalEntryState';

/** A row of the semen entry: sire, type, lot (optional, SL6), straws and cost per straw. */
export interface SemenReceiptLine {
	key: string;
	sireId: number | null;
	semenType: SemenType | '';
	lotCode: string;
	collectionDate: string;
	quantity: string;
	unitCost: string;
}

export interface SemenReceiptHeader {
	occurredAt: string;
	warehouseId: number | null;
	providerId: number | null;
	notes: string;
}

export const emptyReceiptLine = (): SemenReceiptLine => ({
	key: rowKey(),
	sireId: null,
	semenType: 'CONVENTIONAL',
	lotCode: '',
	collectionDate: '',
	quantity: '',
	unitCost: ''
});

export const isBlankReceipt = (l: SemenReceiptLine): boolean => !l.sireId && !l.lotCode.trim() && !l.quantity.trim();

/** There is always one empty row at the end to keep typing. */
export const withTrailingReceipt = (lines: SemenReceiptLine[]): SemenReceiptLine[] =>
	lines.length === 0 || !isBlankReceipt(lines[lines.length - 1]) ? [...lines, emptyReceiptLine()] : lines;

export const lineAmount = (l: SemenReceiptLine): number => (Number(l.quantity) || 0) * (Number(l.unitCost) || 0);

export function receiptTotals(lines: SemenReceiptLine[]): { straws: number; amount: number; withoutLot: number } {
	const filled = lines.filter((l) => !isBlankReceipt(l));
	return {
		straws: filled.reduce((t, l) => t + (Number(l.quantity) || 0), 0),
		amount: filled.reduce((t, l) => t + lineAmount(l), 0),
		withoutLot: filled.filter((l) => !l.lotCode.trim()).length
	};
}

export function buildReceiptPayload(header: SemenReceiptHeader, lines: SemenReceiptLine[], key: string): { payload: SemenReceiptPayload; lineKeys: string[] } {
	const sent = lines.filter((l) => !isBlankReceipt(l));

	return {
		lineKeys: sent.map((l) => l.key),
		payload: {
			occurred_at: header.occurredAt,
			warehouse_id: header.warehouseId,
			provider_id: header.providerId,
			notes: header.notes.trim() || null,
			idempotency_key: key,
			lines: sent.map((l) => ({
				semen_sire_id: l.sireId,
				semen_type: l.semenType || null,
				lot_code: l.lotCode.trim() || null,
				collection_date: l.collectionDate || null,
				quantity: l.quantity.trim(),
				unit_cost: l.unitCost.trim() === '' ? '0' : l.unitCost.trim().replace(',', '.')
			}))
		}
	};
}
