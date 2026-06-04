import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const UploadDocumentOcrView = lazy(() => import('src/ui/upload-document-ocr/UploadDocumentOcrView'));

/**
 * The Dedicated Labeled OCR Document Upload and Analysis page route.
 */
const route: FuseRouteItemType = {
  path: 'upload-document/ocr',
  element: <UploadDocumentOcrView />
};

export default route;
