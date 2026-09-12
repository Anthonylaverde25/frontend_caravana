import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useSnackbar } from "notistack";
import {
  usePortalPendingActs,
  usePortalPendingTubes,
  usePortalShipments,
  useRegisterLabReport,
  useRegisterShipment,
  useSignExtractionAct,
  useVeterinaryPortalSession,
  useVoidShipment,
} from "@/features/gestation/hooks/useVeterinaryPortal";
import {
  DiagnosticProtocol,
  RegisterLabReportInput,
  RegisterSampleShipmentInput,
  SampleShipment,
  SignExtractionActInput,
} from "@/core/veterinary/domain/VeterinaryTypes";
import { apiErrorMessage } from "@/core/veterinary/domain/apiErrorMessage";
import { setPortalViewAs } from "@/core/veterinary/infrastructure/repositories/ApiVeterinaryRepository";
import { useVeterinarians } from "@/features/gestation/hooks/useVeterinaryProtocols";
import { PortalFioriShellBar } from "../components/veterinary-portal/shell/PortalFioriShellBar";
import {
  PortalGridToolbar,
  PortalTabKey,
} from "../components/veterinary-portal/toolbar/PortalGridToolbar";
import { PortalPendingActsPanel } from "../components/veterinary-portal/PortalPendingActsPanel";
import { PortalShipmentsPanel } from "../components/veterinary-portal/PortalShipmentsPanel";
import { PortalShipmentDialog } from "../components/veterinary-portal/PortalShipmentDialog";
import { PortalLabHistoryPanel } from "../components/veterinary-portal/history/PortalLabHistoryPanel";
import { PortalActSignatureDialog } from "../components/veterinary-portal/PortalActSignatureDialog";
import { PortalLabReportDialog } from "../components/veterinary-portal/PortalLabReportDialog";
import { PortalAccessManagerPanel } from "../components/veterinary-portal/access/PortalAccessManagerPanel";
import { PortalSupervisionBar } from "../components/veterinary-portal/PortalSupervisionBar";
import VeterinaryPortalMangaView from "./VeterinaryPortalMangaView";

interface Props {
  /** Null when opened from inside the system; set when arriving on a temporary link. */
  accessToken?: string | null;
}

/**
 * Enterprise Veterinary Portal View matching SAP Fiori Horizon / ALV Spreadsheet aesthetics.
 * Orchestrates session bootstrap, navigation tabs, pending acts inbox, and chute evaluation.
 */
export const VeterinaryPortalView: React.FC<Props> = ({
  accessToken = null,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams] = useSearchParams();

  /**
   * Whose portal a management user is looking at. Set before the queries run, because the header
   * it installs is what the session request carries.
   */
  const [viewAs, setViewAs] = useState<number | "">("");
  const { data: veterinarians = [] } = useVeterinarians();

  setPortalViewAs(accessToken === null && viewAs !== "" ? viewAs : null);

  const {
    data: session,
    isLoading: loadingSession,
    error: sessionError,
  } = useVeterinaryPortalSession(accessToken);

  const isProfessional = Boolean(session) && !sessionError;
  const isReadOnly = Boolean(session?.is_read_only);

  // A manager has no portal of their own: the bar is how they reach somebody else's.
  const showSupervisionBar = accessToken === null && (isReadOnly || !isProfessional);
  const isExternalDoor = accessToken !== null;

  const { data: acts, isLoading: loadingActs } = usePortalPendingActs(
    accessToken,
    isProfessional,
  );
  const { data: pendingTubes = [], isLoading: loadingTubes } =
    usePortalPendingTubes(accessToken, isProfessional);
  const { data: shipments = [] } = usePortalShipments(accessToken, isProfessional);

  const signAct = useSignExtractionAct(accessToken);
  const registerReport = useRegisterLabReport(accessToken);
  const registerShipment = useRegisterShipment(accessToken);
  const voidShipment = useVoidShipment(accessToken);

  const [activeTab, setActiveTab] = useState<PortalTabKey>("evaluation");
  const [searchQuery, setSearchQuery] = useState("");
  const [actToSign, setActToSign] = useState<DiagnosticProtocol | null>(null);
  const [actToReport, setActToReport] = useState<DiagnosticProtocol | null>(
    null,
  );
  const [shipmentOpen, setShipmentOpen] = useState(false);

  /**
   * ADR-16: a signature link narrowed to one act lands here with `?act=123`, and the act it
   * names opens straight away.
   *
   * What this deep link is NOT any more is the chute sheet's redirect: the producer operating
   * the chute has no portal session, so that path could only ever produce a 403 and an empty
   * screen. The act is now delivered to the professional instead (ADR-23).
   */
  const requestedActId = useMemo(() => {
    const raw = searchParams.get("act");
    return raw ? Number(raw) : null;
  }, [searchParams]);

  useEffect(() => {
    if (!requestedActId) return;

    const toSign = acts?.pending_signature?.find((a) => a.id === requestedActId);

    if (toSign) {
      setActToSign(toSign);
      setActiveTab("acts");
      return;
    }

  }, [requestedActId, acts]);

  const handleSign = async (input: SignExtractionActInput) => {
    if (!actToSign) return;
    try {
      const signed = await signAct.mutateAsync({ actId: actToSign.id, input });
      setActToSign(null);
      enqueueSnackbar(
        `Acta ${signed.protocol_number} firmada. La cadena de custodia quedó cerrada.`,
        {
          variant: "success",
        },
      );
    } catch (err) {
      enqueueSnackbar(apiErrorMessage(err, "No se pudo firmar el acta."), {
        variant: "error",
      });
    }
  };

  const handleShipment = async (input: RegisterSampleShipmentInput) => {
    try {
      const shipment = await registerShipment.mutateAsync(input);
      setShipmentOpen(false);

      enqueueSnackbar(
        `Envío registrado: ${shipment.samples_count} tubo(s) a ${shipment.institution.nombre}.`,
        { variant: "success" },
      );
    } catch (err) {
      enqueueSnackbar(apiErrorMessage(err, "No se pudo registrar el envío."), {
        variant: "error",
      });
    }
  };

  const handleVoidShipment = async (shipment: SampleShipment) => {
    // ADR-37: nothing is erased, and a void without a reason is not a void.
    const reason = window.prompt(
      "¿Por qué se anula este envío? Queda escrito en el registro.",
    );

    if (!reason || reason.trim().length < 5) return;

    try {
      await voidShipment.mutateAsync({ shipmentId: shipment.id, reason: reason.trim() });
      enqueueSnackbar("Envío anulado. Los tubos sin informe vuelven a estar en su poder.", {
        variant: "info",
      });
    } catch (err) {
      enqueueSnackbar(apiErrorMessage(err, "No se pudo anular el envío."), {
        variant: "error",
      });
    }
  };

  const handleReport = async (input: RegisterLabReportInput) => {
    if (!actToReport) return;
    try {
      const report = await registerReport.mutateAsync({
        actId: actToReport.id,
        input,
      });
      setActToReport(null);
      enqueueSnackbar(
        `Informe ${report.protocol_number} registrado y aptitud recalculada.`,
        {
          variant: "success",
        },
      );
    } catch (err) {
      enqueueSnackbar(
        apiErrorMessage(err, "No se pudo registrar el informe."),
        { variant: "error" },
      );
    }
  };

  const derivedProtocols = useMemo(() => {
    const map = new Map<number, DiagnosticProtocol>();
    (acts?.pending_signature ?? []).forEach((a) => {
      if (a.destination_plan === "TO_BE_DERIVED") map.set(a.id, a);
    });
    (acts?.pending_lab_report ?? []).forEach((a) => {
      if (a.destination_plan === "TO_BE_DERIVED") map.set(a.id, a);
    });
    return Array.from(map.values());
  }, [acts]);

  if (loadingSession) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-800 border-t-transparent" />
      </div>
    );
  }

  if (isExternalDoor && !isProfessional) {
    return (
      <div className="mx-auto my-12 max-w-lg rounded-lg border border-rose-300 bg-rose-50 p-6 text-center text-rose-800 shadow-sm">
        <h2 className="mb-2 text-base font-bold">Acceso Denegado o Vencido</h2>
        <p className="text-sm">
          {apiErrorMessage(
            sessionError,
            "El enlace de acceso temporal no es válido o ha expirado.",
          )}
        </p>
      </div>
    );
  }

  // Prefills the institution block. A default only: no rule reads it (ADR-31 rev.).
  const defaultInstitutionCuit =
    session?.veterinarian?.billing_cuit ?? session?.veterinarian?.cuit ?? null;

  const pendingSignature = acts?.pending_signature ?? [];
  const pendingLabReport = acts?.pending_lab_report ?? [];
  const pendingActsCount = pendingSignature.length + pendingLabReport.length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased">
      {/* Top SAP Fiori ShellBar */}
      <PortalFioriShellBar
        veterinarianName={session?.veterinarian?.name}
        licenseNumber={session?.veterinarian?.license_number}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Workspace */}
      <main className="w-full">
        {showSupervisionBar && (
          <div className="mx-auto max-w-[1720px] px-4 pt-4 sm:px-6">
            <PortalSupervisionBar
              veterinarians={veterinarians}
              selectedId={viewAs}
              onSelect={setViewAs}
              isReadOnly={isReadOnly}
            />
          </div>
        )}

        {/* Tab 1: Carga de Evaluación Directa */}
        {activeTab === "evaluation" && (
          <VeterinaryPortalMangaView
            accessToken={accessToken}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingActsCount={pendingActsCount}
            pendingReceptionsCount={pendingTubes.length}
            searchQuery={searchQuery}
          />
        )}

        {/* Tab 2: Mis Actas y Protocolos */}
        {activeTab === "acts" && (
          <div className="mx-auto max-w-[1720px] space-y-4 px-4 py-4 sm:px-6">
            <PortalGridToolbar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              pendingCount={0}
              actsCount={pendingActsCount}
              receptionsCount={pendingTubes.length}
              onMarkAllNegative={() => {}}
              onCopyAvgCondition={() => {}}
              onImportBalanza={() => {}}
              onExportPlanilla={() => {}}
            />

            <PortalPendingActsPanel
              pendingSignature={pendingSignature}
              pendingLabReport={pendingLabReport}
              onSign={isReadOnly ? undefined : setActToSign}
              onReport={isReadOnly ? undefined : setActToReport}
              isLoading={loadingActs}
            />
          </div>
        )}

        {/* Tab 3: Envío de Muestras (ADR-30 / ADR-36) */}
        {activeTab === "receptions" && (
          <div className="mx-auto max-w-[1720px] space-y-4 px-4 py-4 sm:px-6">
            <PortalGridToolbar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              pendingCount={0}
              actsCount={pendingActsCount}
              receptionsCount={pendingTubes.length}
              onMarkAllNegative={() => {}}
              onCopyAvgCondition={() => {}}
              onImportBalanza={() => {}}
              onExportPlanilla={() => {}}
            />

            <PortalShipmentsPanel
              pendingTubes={pendingTubes}
              shipments={shipments}
              derivedProtocols={derivedProtocols}
              onRegisterShipment={isReadOnly ? undefined : () => setShipmentOpen(true)}
              onSignAct={isReadOnly ? undefined : (act) => setActToSign(act)}
              onVoid={isReadOnly ? undefined : handleVoidShipment}
              isLoading={loadingTubes || loadingActs}
              isReadOnly={isReadOnly}
            />
          </div>
        )}

        {/* Tab 4: Historial de Laboratorio */}
        {activeTab === "history" && (
          <div className="mx-auto max-w-[1720px] space-y-4 px-4 py-4 sm:px-6">
            <PortalGridToolbar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              pendingCount={0}
              actsCount={pendingActsCount}
              receptionsCount={pendingTubes.length}
              onMarkAllNegative={() => {}}
              onCopyAvgCondition={() => {}}
              onImportBalanza={() => {}}
              onExportPlanilla={() => {}}
            />

            <PortalLabHistoryPanel
              protocols={[...pendingSignature, ...pendingLabReport].filter(
                (a) => a.is_signed,
              )}
              isLoading={loadingActs}
            />
          </div>
        )}

        {/* Tab for internal administration (if opened inside system by manager) */}
        {!isExternalDoor && !isProfessional && (
          <div className="mx-auto max-w-[1720px] px-4 py-6 sm:px-6">
            <PortalAccessManagerPanel />
          </div>
        )}
      </main>

      {/* Official Signature Dialog */}
      <PortalActSignatureDialog
        open={actToSign !== null}
        act={actToSign}
        veterinarianName={session?.veterinarian?.name ?? ""}
        licenseNumber={session?.veterinarian?.license_number ?? ""}
        isSaving={signAct.isPending}
        onClose={() => setActToSign(null)}
        onConfirm={handleSign}
      />

      {/* ADR-30: the professional declares what they dispatched */}
      <PortalShipmentDialog
        open={shipmentOpen}
        tubes={pendingTubes}
        isSaving={registerShipment.isPending}
        accessToken={accessToken}
        onClose={() => setShipmentOpen(false)}
        onConfirm={handleShipment}
      />

      {/* Official Lab Report Dialog */}
      <PortalLabReportDialog
        open={actToReport !== null}
        act={actToReport}
        isSaving={registerReport.isPending}
        defaultInstitutionCuit={defaultInstitutionCuit}
        // Esta vista no carga envíos: un acta a derivar cae en "derivado sin envío registrado" y
        // el modal pide la institución en vez de inventarla. Degradación, no error.
        shipment={null}
        onClose={() => setActToReport(null)}
        onConfirm={handleReport}
      />
    </div>
  );
};

export default VeterinaryPortalView;
