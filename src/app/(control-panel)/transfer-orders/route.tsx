import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const TransferOrdersView = lazy(() => import('src/ui/transfer-orders/views/TransferOrdersView'));
const RegisterTransferView = lazy(() => import('src/ui/transfer-orders/views/RegisterTransferView'));

/**
 * The list of transfer orders, in every state. An order opens in a drawer over the list,
 * addressable with `?orderId=`. "Registrar transferencia" loads a movement that already
 * happened, on a screen of its own.
 */
const route: FuseRouteItemType[] = [
  {
    path: 'transfer-orders',
    element: <TransferOrdersView />
  },
  {
    path: 'transfer-orders/register',
    element: <RegisterTransferView />
  }
];

export default route;
