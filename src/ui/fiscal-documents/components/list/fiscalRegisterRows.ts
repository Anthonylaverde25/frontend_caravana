import { FiscalDocument } from '@/core/fiscal/domain/entities/FiscalDocument';
import { add, type Dec, dec } from '@/core/stock/domain/rules/decimal';

const KIND_NAME: Record<FiscalDocument['type']['kind'], string> = {
	INVOICE: 'Factura',
	CREDIT_NOTE: 'Nota de crédito',
	TICKET: 'Ticket',
	DELIVERY_NOTE: 'Remito'
};

/** The letter printed in the box at the top of the paper; a delivery note is R. */
export const letterOf = (d: FiscalDocument): string | null => d.type.letter ?? (d.type.kind === 'DELIVERY_NOTE' ? 'R' : null);

/** "Nota de crédito · acredita 0001-00000123", "Factura · de 2 remitos", "Remito · Pendiente de factura". */
export function captionOf(d: FiscalDocument): string {
	const parts = [KIND_NAME[d.type.kind]];
	if (d.related?.label) parts.push(`acredita ${d.related.label.split(' ').pop()}`);
	if (d.deliveryNotes.length) parts.push(`de ${d.deliveryNotes.length} ${d.deliveryNotes.length === 1 ? 'remito' : 'remitos'}`);
	if (d.deliveryNoteStatus && d.status === 'REGISTERED') parts.push(d.deliveryNoteStatus.label);
	return parts.join(' · ');
}

/** VAT and every other tax of the paper; null when it has none (letter B, C, a ticket, a delivery note). */
export function taxesOf(d: FiscalDocument): Dec | null {
	const lines = dec(d.lineTaxesAmount);
	const document = dec(d.documentTaxesAmount);
	if (lines === null && document === null) return null;
	const total = add(lines ?? 0n, document ?? 0n);
	return total === 0n ? null : total;
}

export interface MonthGroup {
	key: string;
	label: string;
	documents: FiscalDocument[];
}

/** Rows grouped by the month they were issued, in the order they come (newest first). */
export function byMonth(documents: FiscalDocument[]): MonthGroup[] {
	const groups: MonthGroup[] = [];
	documents.forEach((d) => {
		const key = d.issuedAt.slice(0, 7);
		let group = groups.find((g) => g.key === key);
		if (!group) {
			const label = new Date(`${key}-01T12:00:00`).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
			group = { key, label: label.charAt(0).toUpperCase() + label.slice(1), documents: [] };
			groups.push(group);
		}
		group.documents.push(d);
	});
	return groups;
}
