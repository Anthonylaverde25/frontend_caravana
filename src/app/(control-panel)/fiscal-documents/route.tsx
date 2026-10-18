import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const FiscalDocumentsView = lazy(() => import('src/ui/fiscal-documents/views/FiscalDocumentsView'));
const FiscalDocumentEntryView = lazy(() => import('src/ui/fiscal-documents/views/FiscalDocumentEntryView'));
const FiscalDocumentDetailView = lazy(() => import('src/ui/fiscal-documents/views/FiscalDocumentDetailView'));

/**
 * The register of provider documents (invoices, credit notes, tickets), its full-screen entry and
 * each document's file.
 */
const route: FuseRouteItemType = {
	path: 'fiscal-documents',
	children: [
		{ index: true, element: <FiscalDocumentsView /> },
		{ path: 'new', element: <FiscalDocumentEntryView /> },
		{ path: ':documentId', element: <FiscalDocumentDetailView /> }
	]
};

export default route;
