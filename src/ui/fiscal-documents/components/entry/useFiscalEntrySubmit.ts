import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { FiscalDocumentType, Tax } from '@/core/fiscal/domain/entities/FiscalCatalog';
import { FiscalDocumentDetail } from '@/core/fiscal/domain/entities/FiscalDocument';
import { useRegisterFiscalDocument } from '@/features/fiscal/hooks/useFiscalDocuments';
import { useIdempotencyKey } from '@/features/stock/hooks/useIdempotencyKey';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import { buildPayload, cellOf, DocumentTaxState, FiscalHeaderState, FiscalLineState } from './fiscalEntryState';

/** The backend's answer placed where the operator sees it: header fields, row cells, tax rows. */
export interface FiscalEntryErrors {
	header: Record<string, string>;
	cells: Record<string, Record<string, string>>;
	documentTaxes: Record<string, string>;
	domain: string | null;
}

const NONE: FiscalEntryErrors = { header: {}, cells: {}, documentTaxes: {}, domain: null };

interface Args {
	header: FiscalHeaderState;
	lines: FiscalLineState[];
	documentTaxes: DocumentTaxState[];
	type: FiscalDocumentType | undefined;
	taxes: Tax[];
	onDone: (document: FiscalDocumentDetail) => void;
}

/**
 * "Registrar comprobante": sends the sheet once, with an idempotency key kept across retries (DS8),
 * and marks in red every cell the backend objected to (never live).
 */
export function useFiscalEntrySubmit({ header, lines, documentTaxes, type, taxes, onDone }: Args) {
	const { enqueueSnackbar } = useSnackbar();
	const { mutateAsync, isPending } = useRegisterFiscalDocument();
	const [key, renewKey] = useIdempotencyKey();
	const [errors, setErrors] = useState<FiscalEntryErrors>(NONE);

	const submit = async () => {
		const built = buildPayload(header, lines, documentTaxes, type, taxes, key);
		try {
			const document = await mutateAsync(built.payload);
			setErrors(NONE);
			renewKey();
			const stock = document.stockOperation ? ` · movimiento de stock N.º ${document.stockOperation.number}` : '';
			const open = document.discrepancies?.open ?? 0;
			enqueueSnackbar(
				open > 0
					? `Se registró ${document.label}${stock}. Quedaron ${open} diferencia(s) con los remitos para resolver con el proveedor.`
					: `Se registró ${document.label}${stock}.`,
				{ variant: open > 0 ? 'warning' : 'success' }
			);
			onDone(document);
		} catch (error) {
			const { fields, domain } = readApiErrors(error, 'No se pudo registrar el comprobante.');
			const next: FiscalEntryErrors = { header: {}, cells: {}, documentTaxes: {}, domain };
			Object.entries(fields).forEach(([field, message]) => {
				const line = /^lines\.(\d+)\.(.+)$/.exec(field);
				const tax = /^document_taxes\.(\d+)\./.exec(field);

				if (line && built.lineKeys[Number(line[1])]) {
					const rowKey = built.lineKeys[Number(line[1])];
					next.cells[rowKey] = { ...next.cells[rowKey], [cellOf(line[2])]: message };
				} else if (tax && built.documentTaxKeys[Number(tax[1])]) {
					next.documentTaxes[built.documentTaxKeys[Number(tax[1])]] = message;
				} else {
					next.header[field] = message;
				}
			});
			setErrors(next);
			enqueueSnackbar(domain ?? 'Revisá los datos marcados en rojo.', { variant: 'error' });
		}
	};

	return { submit, isSaving: isPending, errors };
}
