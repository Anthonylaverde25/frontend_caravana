import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const WeaningOrdersView = lazy(() => import('src/ui/weaning-orders/views/WeaningOrdersView'));
const WeaningOrderFormView = lazy(() => import('src/ui/weaning-orders/views/WeaningOrderFormView'));

/**
 * Weaning orders in both directions: the list (an order opens in a drawer, `?orderId=`), a new
 * order issued before the chute and a weaning registered after it. Each one starts in a
 * full-screen dialog over the list (`/new`, `/register`: calves, batch, type) and ends in its
 * confirmation (`/new/confirm`, `/register/confirm`; `?orderId=` reopens a draft).
 */
const route: FuseRouteItemType[] = [
  {
    path: 'weaning-orders',
    element: <WeaningOrdersView />
  },
  {
    path: 'weaning-orders/new',
    element: <WeaningOrdersView starting="order" />
  },
  {
    path: 'weaning-orders/new/confirm',
    element: <WeaningOrderFormView mode="order" />
  },
  {
    path: 'weaning-orders/register',
    element: <WeaningOrdersView starting="register" />
  },
  {
    path: 'weaning-orders/register/confirm',
    element: <WeaningOrderFormView mode="register" />
  }
];

export default route;
