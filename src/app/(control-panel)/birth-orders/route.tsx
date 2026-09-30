import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const BirthOrdersView = lazy(() => import('src/ui/birth-orders/views/BirthOrdersView'));
const BirthOrderConfirmView = lazy(() => import('src/ui/birth-orders/views/BirthOrderConfirmView'));

/**
 * Birth orders in both directions: the list (an order opens in a drawer, `?orderId=`), a new order
 * issued before the calving rounds and calvings registered after them. Each one starts in a
 * full-screen dialog over the list (`/new`, `/register`; `?batchId=` preselects a batch) and ends in
 * its confirmation (`/new/confirm`, `/register/confirm`; `?orderId=` reopens a draft).
 */
const route: FuseRouteItemType[] = [
  {
    path: 'birth-orders',
    element: <BirthOrdersView />
  },
  {
    path: 'birth-orders/new',
    element: <BirthOrdersView starting="order" />
  },
  {
    path: 'birth-orders/new/confirm',
    element: <BirthOrderConfirmView mode="order" />
  },
  {
    path: 'birth-orders/register',
    element: <BirthOrdersView starting="register" />
  },
  {
    path: 'birth-orders/register/confirm',
    element: <BirthOrderConfirmView mode="register" />
  }
];

export default route;
