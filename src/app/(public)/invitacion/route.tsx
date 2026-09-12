import { lazy } from 'react';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

const InvitationAcceptView = lazy(() => import('./InvitationAcceptView'));

const bareLayout = {
  layout: {
    config: {
      navbar: { display: false },
      toolbar: { display: false },
      footer: { display: false },
      leftSidePanel: { display: false },
      rightSidePanel: { display: false },
    },
  },
};

/**
 * ADR-33: public on purpose. The invitation IS the credential, validated server side on every
 * call — the same rule the portal's temporary links follow.
 */
const route: FuseRouteItemType = {
  path: 'invitacion/:token',
  element: <InvitationAcceptView />,
  settings: bareLayout,
  auth: null,
};

export default route;
