import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const FiscalDocumentsView = lazy(() => import('src/ui/fiscal-documents/views/FiscalDocumentsView'));
const FiscalDocumentEntryView = lazy(() => import('src/ui/fiscal-documents/views/FiscalDocumentEntryView'));
const FiscalDocumentDetailView = lazy(() => import('src/ui/fiscal-documents/views/FiscalDocumentDetailView'));
const PendingDeliveryNotesView = lazy(() => import('src/ui/fiscal-documents/views/PendingDeliveryNotesView'));

/**
 * The register of provider documents (invoices, credit notes, tickets, delivery notes), its full-screen
 * entry, the delivery notes waiting for their invoice and each document's file.
 */
const route: FuseRouteItemType = {
	path: 'fiscal-documents',
	children: [
		{ index: true, element: <FiscalDocumentsView /> },
		{ path: 'new', element: <FiscalDocumentEntryView /> },
		{ path: 'delivery-notes', element: <PendingDeliveryNotesView /> },
		{ path: ':documentId', element: <FiscalDocumentDetailView /> }
	]
};

export default route;
