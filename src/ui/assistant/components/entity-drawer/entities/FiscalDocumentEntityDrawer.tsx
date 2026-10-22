import { useFiscalDocument } from '@/features/fiscal/hooks/useFiscalDocuments';
import SummaryTab from '@/ui/fiscal-documents/components/detail/drawer/SummaryTab';
import EntityDrawerShell from '../EntityDrawerShell';
import type { EntityDrawerProps } from './entityDrawerProps';

/** A purchase document's summary: provider, totals and what it is tied to. Voiding stays on its screen. */
export function FiscalDocumentEntityDrawer({ id, label, open, onClose, onNavigate }: EntityDrawerProps) {
	const { data: document, isLoading, isError } = useFiscalDocument(id);

	return (
		<EntityDrawerShell
			open={open}
			onClose={onClose}
			icon="heroicons-outline:document-text"
			title={document?.label ?? label ?? 'Comprobante'}
			subtitle={
				document
					? [document.provider.name, document.status === 'VOIDED' ? 'Anulado' : null]
							.filter(Boolean)
							.join(' · ')
					: undefined
			}
			isLoading={isLoading}
			isError={isError}
			screen={{ route: `/fiscal-documents/${id}`, label: 'Abrir comprobante' }}
			onNavigate={onNavigate}
		>
			{document && <SummaryTab document={document} />}
		</EntityDrawerShell>
	);
}

export default FiscalDocumentEntityDrawer;
