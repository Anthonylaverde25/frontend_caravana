import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * Own batches were replaced by /herd (Hacienda Propia). Kept as a redirect for old links.
 */
const route: FuseRouteItemType = {
	path: 'batches/own',
	element: (
		<Navigate
			to="/herd"
			replace
		/>
	)
};

export default route;
