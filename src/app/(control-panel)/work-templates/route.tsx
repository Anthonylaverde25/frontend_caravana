import { Navigate } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import { settingsSectionPath } from '@/ui/settings/config/settingsNavigation';

/**
 * Work templates gallery moved into Settings; the old /work-templates URL seamlessly redirects there.
 */
function WorkTemplatesRedirect() {
	return <Navigate replace to={settingsSectionPath('work-templates')} />;
}

const route: FuseRouteItemType = {
	path: 'work-templates',
	element: <WorkTemplatesRedirect />
};

export default route;
