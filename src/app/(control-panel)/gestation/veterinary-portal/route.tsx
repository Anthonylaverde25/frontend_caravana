import { Navigate } from "react-router";
import { FuseRouteItemType } from "@fuse/utils/FuseUtils";

/**
 * Control Panel: Directory of Veterinary Portals.
 * Canonical location is under the consolidated Sanidad & Veterinaria Hub (/health?tab=portal).
 */
const routes: FuseRouteItemType[] = [
  {
    path: "gestation/veterinary-portal",
    element: <Navigate to="/health?tab=portal" replace />,
  },
  {
    path: "gestation/veterinary-portal/portales",
    element: <Navigate to="/health?tab=portal" replace />,
  },
  {
    path: "gestation/veterinary-portal/home",
    element: <Navigate to="/health?tab=portal" replace />,
  },
];

export default routes;
