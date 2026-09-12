import React from "react";
import { useSnackbar } from "notistack";
import { useVeterinaryPortalContext } from "../../components/veterinary-portal/context/VeterinaryPortalContext";
import { PortalPendingActsPanel } from "../../components/veterinary-portal/PortalPendingActsPanel";
import { useUpdateActDestinationPlan } from "@/features/gestation/hooks/useVeterinaryPortal";
import {
  DiagnosticProtocol,
  SampleDestinationPlan,
} from "@/core/veterinary/domain/VeterinaryTypes";
import { apiErrorMessage } from "@/core/veterinary/domain/apiErrorMessage";

/**
 * Tab 2: Mis Actas y Protocolos View.
 * Renders the inbox for acts pending signature or awaiting laboratory results.
 */
export const PortalPendingActsView: React.FC = () => {
  const {
    accessToken,
    acts,
    loadingActs,
    onSignAct,
    onReportAct,
    isReadOnly,
  } = useVeterinaryPortalContext();

  const { enqueueSnackbar } = useSnackbar();
  const updateDestinationPlan = useUpdateActDestinationPlan(accessToken);

  const pendingSignature = acts?.pending_signature ?? [];
  const pendingLabReport = acts?.pending_lab_report ?? [];

  const handleToggleDestinationPlan = async (act: DiagnosticProtocol) => {
    const nextPlan: SampleDestinationPlan =
      act.destination_plan === "TO_BE_DERIVED" ? "IN_SITU" : "TO_BE_DERIVED";

    try {
      await updateDestinationPlan.mutateAsync({
        actId: act.id,
        destinationPlan: nextPlan,
      });
      enqueueSnackbar(
        nextPlan === "TO_BE_DERIVED"
          ? `Acta ${act.protocol_number} marcada para derivación externa.`
          : `Acta ${act.protocol_number} marcada para procesamiento in situ.`,
        { variant: "success" }
      );
    } catch (err) {
      enqueueSnackbar(
        apiErrorMessage(err, "No se pudo actualizar el plan de destino del acta."),
        { variant: "error" }
      );
    }
  };

  return (
    <div className="mx-auto max-w-[1720px] space-y-4 px-4 py-4 sm:px-6">
      <PortalPendingActsPanel
        pendingSignature={pendingSignature}
        pendingLabReport={pendingLabReport}
        onSign={isReadOnly ? undefined : onSignAct}
        onReport={isReadOnly ? undefined : onReportAct}
        onToggleDestinationPlan={isReadOnly ? undefined : handleToggleDestinationPlan}
        isTogglingPlan={updateDestinationPlan.isPending}
        isLoading={loadingActs}
      />
    </div>
  );
};

export default PortalPendingActsView;
