import { Navigate, useParams } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * Keeps an old /caravans link working: sends it to the same screen under /herd.
 */
function RedirectToHerdBatch({ screen }: { screen: 'bulk-weight' | 'weight-sheet' }) {
	const { batchId } = useParams();

	return (
		<Navigate
			to={`/herd/batches/${batchId}/${screen}`}
			replace
		/>
	);
}

/**
 * /caravans was replaced by /herd (Hacienda Propia). Its screens live there now; these
 * redirects keep bookmarks and old links working.
 */
const route: FuseRouteItemType = {
	path: 'caravans',
	children: [
		{
			index: true,
			element: (
				<Navigate
					to="/herd"
					replace
				/>
			)
		},
		{
			path: 'movements',
			element: (
				<Navigate
					to="/herd/movements"
					replace
				/>
			)
		},
		{
			path: 'bulk-weight/:batchId',
			element: <RedirectToHerdBatch screen="bulk-weight" />
		},
		{
			path: 'weight-sheet/:batchId',
			element: <RedirectToHerdBatch screen="weight-sheet" />
		}
	]
};

export default route;
