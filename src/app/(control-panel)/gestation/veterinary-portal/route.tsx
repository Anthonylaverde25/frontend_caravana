import { lazy } from "react";
import { Navigate } from "react-router";
import { FuseRouteItemType } from "@fuse/utils/FuseUtils";

const PortalDirectoryView = lazy(
  () => import("src/ui/gestation/views/veterinary-portal/PortalDirectoryView"),
);

/**
 * Control Panel: Directory of Veterinary Portals.
 * Displays all external and registered veterinarians with their pending acts and access management.
 */
const routes: FuseRouteItemType[] = [
  {
    path: "gestation/veterinary-portal",
    element: <PortalDirectoryView />,
  },
  {
    path: "gestation/veterinary-portal/portales",
    element: <Navigate to="/gestation/veterinary-portal" replace />,
  },
  {
    path: "gestation/veterinary-portal/home",
    element: <Navigate to="/gestation/veterinary-portal" replace />,
  },
];

export default routes;
