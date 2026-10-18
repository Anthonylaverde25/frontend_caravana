import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useFiscalCatalog } from '@/features/fiscal/hooks/useFiscalDocuments';
import FiscalDocumentsView from './FiscalDocumentsView';
import FiscalDocumentEntryDialog from '../components/entry/FiscalDocumentEntryDialog';

/**
 * `/fiscal-documents/new`: "Cargar comprobante" as a full-screen dialog over the register. With
 * `?type=CREDIT_NOTE_A&provider=14&related=31` it opens a credit note for that invoice.
 */
export default function FiscalDocumentEntryView() {
	const navigate = useNavigate();
	const [params] = useSearchParams();
	const { data: catalog } = useFiscalCatalog();
	const typeCode = params.get('type') ?? 'INVOICE_A';
	const typeId = catalog?.types.find((t) => t.code === typeCode)?.id ?? null;
	const initial = useMemo(
		() => ({ typeId, providerId: Number(params.get('provider')) || null, relatedId: Number(params.get('related')) || null }),
		[typeId, params]
	);

	return (
		<>
			<FiscalDocumentsView />
			{catalog && (
				<FiscalDocumentEntryDialog
					key={`${typeId}-${initial.providerId}-${initial.relatedId}`}
					initial={initial}
					onClose={() => navigate('/fiscal-documents')}
					onDone={(document) => navigate(`/fiscal-documents/${document.id}`)}
				/>
			)}
		</>
	);
}
