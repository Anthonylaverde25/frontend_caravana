import { FiscalDocumentLine } from '@/core/fiscal/domain/entities/FiscalDocument';
import { formatQuantity, formatUnitCost } from '@/core/stock/domain/rules/quantityFormat';

/** Where the line went: a batch, the warehouse, or, for an unpriced delivery note, what waits for the invoice. */
export const destination = (line: FiscalDocumentLine): string => {
	const lot = line.unvaluedLot;

	if (lot) {
		const unit = line.item.unitSymbol;

		if (lot.status === 'VALUED')
			return `Valorizado por la factura a ${formatUnitCost(lot.valuedUnitCost)}${unit ? ` / ${unit}` : ''}`;

		if (lot.status === 'VOIDED') return 'Anulado';

		return `Sin valorizar: ${formatQuantity(lot.remainingQuantity, unit)} de ${formatQuantity(lot.quantity, unit)} · ${formatQuantity(lot.consumedQuantity, unit)} consumidas`;
	}

	if (line.deliveryNoteLabel) return 'Entró al almacén con el remito';

	if (line.batch) return `${line.batch.name} · ${line.headsTreated} cab.`;

	return line.item.trackStock ? 'Al almacén' : 'Gasto directo';
};

