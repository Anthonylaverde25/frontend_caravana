import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const ItemDocumentsView = lazy(() => import('src/ui/item-documents/views/ItemDocumentsView'));
const ItemDocumentDetailView = lazy(() => import('src/ui/item-documents/views/ItemDocumentDetailView'));
const InitialStockEntryView = lazy(() => import('src/ui/item-documents/views/InitialStockEntryView'));

/** Stock operations: the list in load order, each operation, and the initial-stock entry. */
const route: FuseRouteItemType = {
	path: 'item-documents',
	children: [
		{ index: true, element: <ItemDocumentsView /> },
		{ path: 'new/initial-stock', element: <InitialStockEntryView /> },
		{ path: ':documentId', element: <ItemDocumentDetailView /> }
	]
};

export default route;
