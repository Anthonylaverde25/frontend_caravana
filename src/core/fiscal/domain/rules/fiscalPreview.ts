import { add, type Dec, dec, div, mul, round, sum, ZERO } from '@/core/stock/domain/rules/decimal';
import { Tax, VAT_CODE } from '../entities/FiscalCatalog';

/** What a line of the sheet holds, as typed. */
export interface FiscalLineDraft {
	inputQuantity: string;
	unitPrice: string;
	/** VAT rate of the line (letter A only). */
	vatRateId: number | null;
	/** Other taxes of the line (fuel, internal): amounts as on paper. */
	otherTaxes: { taxId: number; amount: string }[];
}

export interface LinePreview {
	amount: Dec | null;
	vat: Dec | null;
	vatLabel: string | null;
	otherTaxes: Dec;
	nonRecoverable: Dec;
	cost: Dec | null;
}

const hundred = 100n * 10n ** 10n;

/**
 * Line amount, VAT and cost as the backend will compute them (plan 4.5): amount = quantity × price,
 * VAT = amount × rate / 100, cost = amount + non-recoverable taxes. Only for showing.
 */
export function previewLine(line: FiscalLineDraft, taxes: Tax[], discriminates: boolean): LinePreview {
	const quantity = dec(line.inputQuantity);
	const price = dec(line.unitPrice);
	const amount = quantity !== null && price !== null ? round(mul(quantity, price), 4) : null;
	const vatTax = taxes.find((t) => t.code === VAT_CODE);
	const rate = discriminates ? vatTax?.rates.find((r) => r.id === line.vatRateId) : undefined;
	const vat = amount !== null && rate ? round(div(mul(amount, dec(rate.rate) ?? ZERO), hundred) ?? ZERO, 4) : null;

	const others = discriminates ? line.otherTaxes : [];
	const otherTaxes = sum(others.map((t) => dec(t.amount) ?? ZERO));
	const nonRecoverable = sum(others.filter((t) => !taxes.find((x) => x.id === t.taxId)?.isRecoverable).map((t) => dec(t.amount) ?? ZERO));

	return {
		amount,
		vat,
		vatLabel: rate ? `${vatTax?.name} ${rate.name}` : null,
		otherTaxes,
		nonRecoverable,
		cost: amount === null ? null : add(amount, nonRecoverable)
	};
}

export interface SummaryRow {
	label: string;
	amount: Dec;
}

/** "2. Resumen": net amount, one row per VAT rate and per other tax, and the total. */
export function summarize(
	lines: { preview: LinePreview; otherTaxes: { taxId: number; amount: string }[] }[],
	documentTaxes: { taxId: number; amount: string }[],
	taxes: Tax[]
): { net: Dec; rows: SummaryRow[]; total: Dec } {
	const rows = new Map<string, Dec>();
	const push = (label: string, amount: Dec) => rows.set(label, add(rows.get(label) ?? ZERO, amount));
	const name = (taxId: number) => taxes.find((t) => t.id === taxId)?.name ?? 'Impuesto';

	lines.forEach(({ preview, otherTaxes }) => {
		if (preview.vat !== null && preview.vatLabel) push(preview.vatLabel, preview.vat);
		otherTaxes.forEach((t) => push(name(t.taxId), dec(t.amount) ?? ZERO));
	});
	documentTaxes.forEach((t) => push(name(t.taxId), dec(t.amount) ?? ZERO));

	const net = sum(lines.map((l) => l.preview.amount ?? ZERO));
	const summaryRows = [...rows.entries()].map(([label, amount]) => ({ label, amount }));

	return { net, rows: summaryRows, total: add(net, sum(summaryRows.map((r) => r.amount))) };
}
