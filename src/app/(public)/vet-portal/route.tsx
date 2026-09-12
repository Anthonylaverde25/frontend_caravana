import { lazy } from "react";
import { Navigate } from "react-router";
import { FuseRouteItemType } from "@fuse/utils/FuseUtils";

const PublicVeterinaryPortalView = lazy(
  () => import("./PublicVeterinaryPortalView"),
);
const VeterinaryPortalLayout = lazy(
  () => import("src/ui/gestation/views/VeterinaryPortalLayout"),
);
const PortalHomeView = lazy(
  () => import("src/ui/gestation/views/veterinary-portal/PortalHomeView"),
);
const VeterinaryPortalMangaView = lazy(
  () => import("src/ui/gestation/views/VeterinaryPortalMangaView"),
);
const PortalPendingActsView = lazy(
  () => import("src/ui/gestation/views/veterinary-portal/PortalPendingActsView"),
);
const PortalShipmentsView = lazy(
  () => import("src/ui/gestation/views/veterinary-portal/PortalShipmentsView"),
);
const PortalCustodyTubesView = lazy(
  () => import("src/ui/gestation/views/veterinary-portal/PortalCustodyTubesView"),
);
const PortalLabHistoryView = lazy(
  () => import("src/ui/gestation/views/veterinary-portal/PortalLabHistoryView"),
);

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

const portalChildren = [
  {
    index: true,
    element: <Navigate to="home" replace />,
  },
  {
    path: "home",
    element: <PortalHomeView />,
  },
  {
    path: "evaluacion",
    element: <VeterinaryPortalMangaView />,
  },
  {
    path: "actas",
    element: <PortalPendingActsView />,
  },
  {
    path: "actas/:actId/firmar",
    element: <PortalPendingActsView />,
  },
  {
    path: "actas/:actId/informe",
    element: <PortalPendingActsView />,
  },
  {
    path: "envios",
    element: <PortalShipmentsView />,
  },
  {
    path: "envios/nuevo",
    element: <PortalShipmentsView />,
  },
  {
    path: "tubos",
    element: <PortalCustodyTubesView />,
  },
  {
    path: "historial",
    element: <PortalLabHistoryView />,
  },
];

/**
 * Veterinary Portal Routes:
 * 1. Public entry point for query params (?token=...)
 * 2. External professionals door (/vet-portal/:token/...)
 * 3. Management inspection door (/vet-portal/inspect/:veterinarianId/...)
 */
const routes: FuseRouteItemType[] = [
  {
    path: "vet-portal",
    element: <PublicVeterinaryPortalView />,
    settings: bareLayout,
    auth: null,
  },
  {
    path: "vet-portal/inspect/:veterinarianId",
    element: <VeterinaryPortalLayout />,
    settings: bareLayout,
    children: portalChildren,
  },
  {
    path: "vet-portal/:token",
    element: <VeterinaryPortalLayout />,
    settings: bareLayout,
    auth: null,
    children: portalChildren,
  },
];

export default routes;
