import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const McpConsentView = lazy(() => import('src/ui/mcp/views/McpConsentView'));

/**
 * OAuth consent for AI clients (MCP). Public: the view itself sends a guest to sign in, keeping the
 * OAuth query (see McpConsentView).
 */
const route: FuseRouteItemType = {
	path: 'oauth/consent',
	element: <McpConsentView />,
	settings: {
		layout: {
			config: {
				navbar: { display: false },
				toolbar: { display: false },
				footer: { display: false },
				leftSidePanel: { display: false },
				rightSidePanel: { display: false }
			}
		}
	},
	auth: null
};

export default route;
