import React, { useMemo } from "react";
import { useVeterinaryPortalContext } from "../../components/veterinary-portal/context/VeterinaryPortalContext";
import { PortalShipmentsPanel } from "../../components/veterinary-portal/PortalShipmentsPanel";
import { DiagnosticProtocol } from "@/core/veterinary/domain/VeterinaryTypes";

/**
 * Tab 3: Envío de Muestras View.
 * Renders the tracking panel for TO_BE_DERIVED protocols, custody tubes, and laboratory dispatches.
 */
export const PortalShipmentsView: React.FC = () => {
  const {
    acts,
    loadingActs,
    pendingTubes,
    loadingTubes,
    shipments,
    onOpenShipment,
    onSignAct,
    onVoidShipment,
    isReadOnly,
  } = useVeterinaryPortalContext();

  const derivedProtocols = useMemo(() => {
    const map = new Map<number, DiagnosticProtocol>();
    (acts?.pending_signature ?? []).forEach((a) => {
      if (a.destination_plan === "TO_BE_DERIVED") {
        map.set(a.id, a);
      }
    });
    (acts?.pending_lab_report ?? []).forEach((a) => {
      if (a.destination_plan === "TO_BE_DERIVED") {
        map.set(a.id, a);
      }
    });
    return Array.from(map.values());
  }, [acts]);

  return (
    <div className="mx-auto max-w-[1720px] space-y-4 px-4 py-4 sm:px-6">
      <PortalShipmentsPanel
        pendingTubes={pendingTubes}
        shipments={shipments}
        derivedProtocols={derivedProtocols}
        onRegisterShipment={isReadOnly ? undefined : onOpenShipment}
        onSignAct={isReadOnly ? undefined : onSignAct}
        onVoid={
          isReadOnly
            ? undefined
            : (s) => onVoidShipment(s, "Anulado desde el portal")
        }
        isLoading={loadingTubes || loadingActs}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};

export default PortalShipmentsView;
