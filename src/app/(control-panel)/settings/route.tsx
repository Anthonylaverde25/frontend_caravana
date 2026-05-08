import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const GeneralConfig = lazy(() => import('./GeneralConfig'));

/**
 * The Settings page route.
 */
const route: FuseRouteItemType = {
    path: 'settings',
    element: <GeneralConfig />
};

export default route;
