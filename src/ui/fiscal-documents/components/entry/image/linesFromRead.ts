import { Item } from '@/core/items/domain/entities/Item';
import { ResolvedFiscalLine } from '@/core/fiscal/domain/entities/ProviderRecognition';
import { emptyLine, FiscalLineState } from '../fiscalEntryState';

/** "1250.0000" → "1250": the API's scale is not what the operator reads on the paper. */
const plain = (value: string | null): string =>
	value === null ? '' : value.includes('.') ? value.replace(/\.?0+$/, '') : value;

/**
 * The unit of a read row (Delivery G, G7): the paper counts in its own units (bottles, bags), so the
 * item's base unit is assumed only when it is the only choice, i.e. the item has no presentations.
 */
export const readInputSource = (item: Item | undefined, hasReadQuantity: boolean): string =>
	!item?.unit || (hasReadQuantity && item.presentationsCount > 0) ? '' : `u:${item.unit.id}`;

interface Context {
	items: Item[];
	discriminates: boolean;
	/** A delivery note without prices: the price is not loaded. */
	unpriced: boolean;
}

/** Rows of the sheet from the lines read: the item when it was resolved, and what the paper says. */
export function linesFromRead(
	lines: ResolvedFiscalLine[],
	{ items, discriminates, unpriced }: Context
): FiscalLineState[] {
	return lines.map((line) => {
		const item = items.find((i) => i.id === line.resolution.itemId);
		const itemId = item ? item.id : null;

		return {
			...emptyLine(),
			itemId,
			inputQuantity: plain(line.quantity),
			inputSource: itemId ? readInputSource(item, line.quantity !== null) : '',
			unitPrice: unpriced ? '' : plain(line.unitPrice),
			vatRateId: discriminates ? line.vatTaxRateId : null,
			read: {
				description: line.description,
				code: line.code,
				quantity: plain(line.quantity) || null,
				// An item outside the screen's list (e.g. not stocked on a delivery note) stays unresolved.
				source: itemId ? line.resolution.source : 'NONE',
				level: line.resolution.level,
				reason: line.resolution.reason,
				suggestedItemId: line.resolution.suggestedItemId ?? (itemId ? null : line.resolution.itemId),
				note: line.resolution.note,
				vatRateId: line.vatTaxRateId
			}
		};
	});
}
