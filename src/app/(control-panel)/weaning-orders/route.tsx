import { lazy } from 'react';
import { Navigate, useLocation } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const CalvesHubView = lazy(() => import('src/ui/gestation/views/CalvesHubView'));
const WeaningOrderFormView = lazy(() => import('src/ui/weaning-orders/views/WeaningOrderFormView'));

/** The list lives in the second tab of the hub; `?orderId=` and the rest of the query travel along. */
function WeaningOrdersRedirect() {
  const params = new URLSearchParams(useLocation().search);
  params.set('tab', 'orders');

  return <Navigate to={`/gestation/births?${params.toString()}`} replace />;
}

/**
 * Weaning orders in both directions: the list is the second tab of "Crías al pie y destete"
 * (`/weaning-orders` redirects there; an order opens in a drawer, `?orderId=`), a new order issued
 * before the chute and a weaning registered after it. Each one starts in a full-screen dialog over
 * that view (`/new`, `/register`: calves, batch, type). A new order — or a draft, reopened there —
 * is confirmed in a modal over the dialog; a registration, or an order that declares the C/S of each
 * calf, still ends in its confirmation (`/new/confirm`, `/register/confirm`).
 */
const route: FuseRouteItemType[] = [
  {
    path: 'weaning-orders',
    element: <WeaningOrdersRedirect />
  },
  {
    path: 'weaning-orders/new',
    element: <CalvesHubView tab="orders" starting="order" />
  },
  {
    path: 'weaning-orders/new/confirm',
    element: <WeaningOrderFormView mode="order" />
  },
  {
    path: 'weaning-orders/register',
    element: <CalvesHubView tab="orders" starting="register" />
  },
  {
    path: 'weaning-orders/register/confirm',
    element: <WeaningOrderFormView mode="register" />
  }
];

export default route;
