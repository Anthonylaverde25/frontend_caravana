import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useSnackbar } from 'notistack';
import { useFiscalCatalog } from '@/features/fiscal/hooks/useFiscalDocuments';
import { useInvoiceDraft } from '@/features/fiscal/hooks/useDeliveryNotes';
import { readApiErrors } from '@/ui/items/components/apiErrors';
import FiscalDocumentsView from './FiscalDocumentsView';
import FiscalDocumentEntryDialog from '../components/entry/FiscalDocumentEntryDialog';

/**
 * `/fiscal-documents/new`: "Cargar comprobante" as a full-screen dialog over the register. With
 * `?type=CREDIT_NOTE_A&provider=14&related=31` it opens a credit note for that invoice, with
 * `?type=DELIVERY_NOTE` a delivery note, and with `?deliveryNotes=77,80` the invoice converted from
 * those delivery notes (DC5).
 */
export default function FiscalDocumentEntryView() {
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();
	const [params] = useSearchParams();
	const { data: catalog } = useFiscalCatalog();
	const noteIds = useMemo(
		() =>
			(params.get('deliveryNotes') ?? '')
				.split(',')
				.map(Number)
				.filter((n) => Number.isInteger(n) && n > 0),
		[params]
	);
	const { data: draft, error: draftError } = useInvoiceDraft(noteIds);
	const typeCode = params.get('type') ?? 'INVOICE_A';
	const typeId = catalog?.types.find((t) => t.code === typeCode)?.id ?? null;
	const initial = useMemo(
		() => ({
			typeId,
			providerId: Number(params.get('provider')) || null,
			relatedId: Number(params.get('related')) || null
		}),
		[typeId, params]
	);

	useEffect(() => {
		if (!draftError) return;

		const { fields, domain } = readApiErrors(draftError, 'No se pudieron convertir los remitos.');
		enqueueSnackbar(domain ?? Object.values(fields)[0] ?? 'No se pudieron convertir los remitos.', {
			variant: 'error'
		});
		navigate('/fiscal-documents/delivery-notes');
	}, [draftError, enqueueSnackbar, navigate]);

	const ready = !!catalog && (noteIds.length === 0 || !!draft);

	return (
		<>
			<FiscalDocumentsView />
			{ready && (
				<FiscalDocumentEntryDialog
					key={`${typeId}-${initial.providerId}-${initial.relatedId}-${noteIds.join('.')}`}
					initial={initial}
					draft={draft ?? null}
					onClose={() => navigate(noteIds.length ? '/fiscal-documents/delivery-notes' : '/fiscal-documents')}
					onDone={(document) => navigate(`/fiscal-documents/${document.id}`)}
				/>
			)}
		</>
	);
}
