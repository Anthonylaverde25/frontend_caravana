import { lazy } from 'react';
import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const BirthOrdersView = lazy(() => import('src/ui/birth-orders/views/BirthOrdersView'));
const BirthOrderConfirmView = lazy(() => import('src/ui/birth-orders/views/BirthOrderConfirmView'));

/**
 * Birth orders in both directions: the list (an order opens in a drawer, `?orderId=`), a new order
 * issued before the calving rounds and calvings registered after them, each in a full-screen dialog
 * over the list. A new order (`/new`, `?batchId=` preselects a batch) ends in its confirmation
 * (`/new/confirm`, `?orderId=` reopens a draft); a registration (`/register`, `?batchId=` scopes it
 * to a batch) is one screen and creates its order already executed.
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
    element: <BirthOrderConfirmView />
  },
  {
    path: 'birth-orders/register',
    element: <BirthOrdersView starting="register" />
  },
  {
    // The registration was two steps; it is one screen now.
    path: 'birth-orders/register/confirm',
    element: <Navigate to="/birth-orders/register" replace />
  }
];

export default route;
