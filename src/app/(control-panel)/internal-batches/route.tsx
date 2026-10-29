import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const AdministrativeBatchesView = lazy(() => import('src/ui/internal-batches/views/AdministrativeBatchesView'));

/**
 * Lotes Administrativos Hub route:
 * Unifies Consumo, Muertes, Egresos, Cuarentena, and Reserva.
 */
const route: FuseRouteItemType = {
	path: 'internal-batches',
	element: <AdministrativeBatchesView />
};

export default route;
