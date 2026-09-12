import React from "react";
import { PortalAccessManagerPanel } from "../../components/veterinary-portal/access/PortalAccessManagerPanel";

/**
 * Tab 5: Gestión de Accesos Temporales View.
 * Administration of temporary access tokens for external professionals.
 */
export const PortalAccessManagerView: React.FC = () => {
  return (
    <div className="mx-auto max-w-[1720px] space-y-4 px-4 py-4 sm:px-6">
      <PortalAccessManagerPanel />
    </div>
  );
};

export default PortalAccessManagerView;
