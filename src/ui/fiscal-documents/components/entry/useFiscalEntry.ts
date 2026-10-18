import { useCallback, useState } from 'react';
import { DEFAULT_VAT_RATE_CODE, FiscalDocumentType, Tax, VAT_CODE } from '@/core/fiscal/domain/entities/FiscalCatalog';
import { Item } from '@/core/items/domain/entities/Item';
import { DocumentTaxState, emptyDocumentTax, emptyLine, FiscalHeaderState, FiscalLineState, isBlankLine } from './fiscalEntryState';

const today = (): string => new Date().toISOString().slice(0, 10);

/** There is always one empty row at the end to keep typing. */
const withTrailingRow = (lines: FiscalLineState[]): FiscalLineState[] =>
	lines.length === 0 || !isBlankLine(lines[lines.length - 1]) ? [...lines, emptyLine()] : lines;

/**
 * State of "Cargar comprobante": the header, the lines and the document taxes. Changing the type to
 * one that discriminates nothing (B, C, ticket) clears every tax; back to letter A, VAT is preloaded
 * again from each item's last invoice, or 21 % (DS18).
 */
export function useFiscalEntry(initial: Partial<FiscalHeaderState>, types: FiscalDocumentType[], taxes: Tax[]) {
	const [header, setHeaderState] = useState<FiscalHeaderState>({
		providerId: null,
		typeId: null,
		pointOfSale: '',
		number: '',
		reference: '',
		issuedAt: today(),
		declaredTotal: '',
		relatedId: null,
		notes: '',
		...initial
	});
	const [lines, setLines] = useState<FiscalLineState[]>([emptyLine()]);
	const [documentTaxes, setDocumentTaxes] = useState<DocumentTaxState[]>([]);

	const type = types.find((t) => t.id === header.typeId);
	const vat = taxes.find((t) => t.code === VAT_CODE);
	const defaultRateId = vat?.rates.find((r) => r.code === DEFAULT_VAT_RATE_CODE)?.id ?? null;

	const setHeader = useCallback(
		(patch: Partial<FiscalHeaderState>) => {
			setHeaderState((current) => ({ ...current, ...patch }));
			if (patch.typeId === undefined) return;
			const next = types.find((t) => t.id === patch.typeId);
			if (!next?.discriminatesVat) {
				setLines((current) => current.map((l) => ({ ...l, vatRateId: null, otherTaxes: [] })));
				setDocumentTaxes([]);
			} else {
				setLines((current) => current.map((l) => (l.itemId && !l.vatRateId ? { ...l, vatRateId: defaultRateId } : l)));
			}
		},
		[types, defaultRateId]
	);

	const updateLine = useCallback((key: string, patch: Partial<FiscalLineState>) => {
		setLines((current) => withTrailingRow(current.map((l) => (l.key === key ? { ...l, ...patch } : l))));
	}, []);

	/** A new item resets what depended on the previous one, and preloads its VAT (letter A). */
	const pickItem = useCallback(
		(key: string, item: Item | null) => {
			updateLine(key, {
				itemId: item?.id ?? null,
				inputSource: item?.unit ? `u:${item.unit.id}` : '',
				vatRateId: item && type?.discriminatesVat ? (item.lastVatRateId ?? defaultRateId) : null,
				batchId: null,
				batchName: null,
				heads: ''
			});
		},
		[updateLine, type, defaultRateId]
	);

	const removeLine = useCallback((key: string) => {
		setLines((current) => withTrailingRow(current.filter((l) => l.key !== key)));
	}, []);

	const addDocumentTax = useCallback(() => setDocumentTaxes((current) => [...current, emptyDocumentTax()]), []);
	const updateDocumentTax = useCallback((key: string, patch: Partial<DocumentTaxState>) => {
		setDocumentTaxes((current) => current.map((t) => (t.key === key ? { ...t, ...patch } : t)));
	}, []);
	const removeDocumentTax = useCallback((key: string) => setDocumentTaxes((current) => current.filter((t) => t.key !== key)), []);

	/** After registering: a clean sheet for the next paper, same provider and type. */
	const reset = useCallback(() => {
		setHeaderState((current) => ({ ...current, pointOfSale: current.pointOfSale, number: '', reference: '', declaredTotal: '', relatedId: null, notes: '' }));
		setLines([emptyLine()]);
		setDocumentTaxes([]);
	}, []);

	return { header, setHeader, type, lines, updateLine, pickItem, removeLine, documentTaxes, addDocumentTax, updateDocumentTax, removeDocumentTax, reset };
}
