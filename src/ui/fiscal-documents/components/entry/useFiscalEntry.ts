import { useCallback, useState } from 'react';
import { DEFAULT_VAT_RATE_CODE, FiscalDocumentType, Tax, VAT_CODE } from '@/core/fiscal/domain/entities/FiscalCatalog';
import { Item } from '@/core/items/domain/entities/Item';
import { InvoiceDraft } from '@/core/fiscal/domain/entities/DeliveryNote';
import {
	DocumentTaxState,
	emptyDocumentTax,
	emptyLine,
	FiscalHeaderState,
	FiscalLineState,
	isBlankLine,
	LineReadSource
} from './fiscalEntryState';
import { readInputSource } from './image/linesFromRead';

const today = (): string => new Date().toISOString().slice(0, 10);

/** "10.0000" → "10": the API's scale is not what the operator reads on the paper. */
const plain = (value: string | null): string =>
	value === null ? '' : value.includes('.') ? value.replace(/\.?0+$/, '') : value;

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
		isValued: null,
		deliveryNoteIds: [],
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
				// What the paper said first; then the item's last invoice, or 21 %.
				setLines((current) =>
					current.map((l) =>
						(l.itemId || l.read?.vatRateId) && !l.vatRateId
							? { ...l, vatRateId: l.read?.vatRateId ?? defaultRateId }
							: l
					)
				);
			}
		},
		[types, defaultRateId]
	);

	const updateLine = useCallback((key: string, patch: Partial<FiscalLineState>) => {
		setLines((current) => withTrailingRow(current.map((l) => (l.key === key ? { ...l, ...patch } : l))));
	}, []);

	/**
	 * A new item resets what depended on the previous one, and preloads its VAT (letter A). On a row
	 * read from the paper, the paper's VAT wins, the unit is not assumed when the item has
	 * presentations (G7), and the row records who chose the item.
	 */
	const pickItem = useCallback(
		(key: string, item: Item | null, origin: Extract<LineReadSource, 'MANUAL' | 'LINKED'> = 'MANUAL') => {
			setLines((current) =>
				withTrailingRow(
					current.map((l) => {
						if (l.key !== key) return l;

						const read = l.read;
						const vatRateId =
							item && type?.discriminatesVat
								? (read?.vatRateId ?? item.lastVatRateId ?? defaultRateId)
								: null;

						return {
							...l,
							itemId: item?.id ?? null,
							inputSource: read
								? readInputSource(item ?? undefined, !!l.inputQuantity.trim())
								: item?.unit
									? `u:${item.unit.id}`
									: '',
							vatRateId,
							batchId: null,
							batchName: null,
							heads: '',
							read: read ? { ...read, source: origin } : null
						};
					})
				)
			);
		},
		[type, defaultRateId]
	);

	/** Rows read from an image (Delivery G): instead of what was typed, or after it (Q1). */
	const loadReadLines = useCallback((read: FiscalLineState[], how: 'replace' | 'append') => {
		setLines((current) =>
			withTrailingRow(how === 'replace' ? read : [...current.filter((l) => !isBlankLine(l)), ...read])
		);
	}, []);

	const removeLine = useCallback((key: string) => {
		setLines((current) => withTrailingRow(current.filter((l) => l.key !== key)));
	}, []);

	/** "Convertir a factura": the provider and every line of the notes, with what they already said (DC5). */
	const loadDraft = useCallback(
		(draft: InvoiceDraft) => {
			setHeaderState((current) => ({
				...current,
				providerId: draft.provider.id,
				deliveryNoteIds: draft.deliveryNotes.map((n) => n.id)
			}));
			const inherited = draft.deliveryNotes.flatMap((note) =>
				note.lines.map((l) => ({
					...emptyLine(),
					itemId: l.item.id,
					inputQuantity: plain(l.inputQuantity),
					inputSource: l.inputPresentationId
						? `p:${l.inputPresentationId}`
						: l.inputUnitId
							? `u:${l.inputUnitId}`
							: '',
					unitPrice: plain(l.unitPrice),
					vatRateId: type?.discriminatesVat ? defaultRateId : null,
					deliveryNoteLineId: l.deliveryNoteLineId,
					deliveryNoteId: note.id,
					notePrice: l.unitPrice
				}))
			);
			setLines(withTrailingRow(inherited));
		},
		[type, defaultRateId]
	);

	/** A note line left out of the invoice, or put back (Q4). */
	const toggleRemoved = useCallback((key: string) => {
		setLines((current) => current.map((l) => (l.key === key ? { ...l, removed: !l.removed } : l)));
	}, []);

	const addDocumentTax = useCallback(() => setDocumentTaxes((current) => [...current, emptyDocumentTax()]), []);
	const updateDocumentTax = useCallback((key: string, patch: Partial<DocumentTaxState>) => {
		setDocumentTaxes((current) => current.map((t) => (t.key === key ? { ...t, ...patch } : t)));
	}, []);
	const removeDocumentTax = useCallback(
		(key: string) => setDocumentTaxes((current) => current.filter((t) => t.key !== key)),
		[]
	);

	/** After registering: a clean sheet for the next paper, same provider and type. */
	const reset = useCallback(() => {
		setHeaderState((current) => ({
			...current,
			pointOfSale: current.pointOfSale,
			number: '',
			reference: '',
			declaredTotal: '',
			relatedId: null,
			notes: ''
		}));
		setLines([emptyLine()]);
		setDocumentTaxes([]);
	}, []);

	return {
		header,
		setHeader,
		type,
		lines,
		updateLine,
		pickItem,
		loadReadLines,
		removeLine,
		loadDraft,
		toggleRemoved,
		documentTaxes,
		addDocumentTax,
		updateDocumentTax,
		removeDocumentTax,
		reset
	};
}
