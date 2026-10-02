import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const EntryOrdersView = lazy(() => import('src/ui/entry-orders/views/EntryOrdersView'));
const RegisterEntryConfirmView = lazy(() => import('src/ui/entry-orders/views/RegisterEntryConfirmView'));

/**
 * Entry orders of external livestock: the tray (an order opens in a drawer, `?orderId=`) and the
 * confirmation of "Registrar ingreso", where the DTE already in hand is loaded with the troop
 * declared in the dialog (it arrives as navigation state).
 */
const route: FuseRouteItemType[] = [
  {
    path: 'entry-orders',
    element: <EntryOrdersView />
  },
  {
    path: 'entry-orders/register/confirm',
    element: <RegisterEntryConfirmView />
  }
];

export default route;
