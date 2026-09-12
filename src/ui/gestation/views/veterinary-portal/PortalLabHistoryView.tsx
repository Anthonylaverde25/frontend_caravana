import React from "react";
import { useVeterinaryPortalContext } from "../../components/veterinary-portal/context/VeterinaryPortalContext";
import { PortalLabHistoryPanel } from "../../components/veterinary-portal/history/PortalLabHistoryPanel";

/**
 * Tab 4: Historial de Laboratorio View.
 * Displays completed and verified diagnostic protocols with Senasa/Renalab certificates.
 */
export const PortalLabHistoryView: React.FC = () => {
  const { acts, loadingActs } = useVeterinaryPortalContext();

  const pendingSignature = acts?.pending_signature ?? [];
  const pendingLabReport = acts?.pending_lab_report ?? [];

  const signedProtocols = [...pendingSignature, ...pendingLabReport].filter(
    (a) => a.is_signed,
  );

  return (
    <div className="mx-auto max-w-[1720px] space-y-4 px-4 py-4 sm:px-6">
      <PortalLabHistoryPanel
        protocols={signedProtocols}
        isLoading={loadingActs}
      />
    </div>
  );
};

export default PortalLabHistoryView;
