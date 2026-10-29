import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const ExitOrdersView = lazy(() => import('src/ui/exit-orders/views/ExitOrdersView'));

/**
 * The exit orders (egreso plan v5, 06 §2): the tray, with the order in a drawer (`?orderId=`). Each
 * load starts in a full-screen dialog over the tray, like "Nueva orden de destete": issue, edit,
 * execute or register.
 */
const route: FuseRouteItemType[] = [
	{ path: 'exit-orders', element: <ExitOrdersView /> },
	{ path: 'exit-orders/new', element: <ExitOrdersView starting="issue" /> },
	{ path: 'exit-orders/register', element: <ExitOrdersView starting="register" /> },
	{ path: 'exit-orders/:id/edit', element: <ExitOrdersView starting="issue" /> },
	{ path: 'exit-orders/:id/execute', element: <ExitOrdersView starting="execute" /> }
];

export default route;
