import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const AssistantWorkspaceView = lazy(() => import('src/ui/assistant/views/AssistantWorkspaceView'));

/**
 * Análisis XIMON: the Virtual Assistant at full width (charts and tables), sharing the conversation
 * with the drawer.
 */
const route: FuseRouteItemType = {
	path: 'assistant',
	element: <AssistantWorkspaceView />
};

export default route;
