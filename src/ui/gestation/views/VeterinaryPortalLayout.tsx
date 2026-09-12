import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
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
import { useVeterinarians } from "@/features/gestation/hooks/useVeterinaryProtocols";
import {
  DiagnosticProtocol,
  RegisterLabReportInput,
  RegisterSampleShipmentInput,
  SampleShipment,
  SampleType,
  SignExtractionActInput,
} from "@/core/veterinary/domain/VeterinaryTypes";
import { apiErrorMessage } from "@/core/veterinary/domain/apiErrorMessage";
import { setPortalViewAs } from "@/core/veterinary/infrastructure/repositories/ApiVeterinaryRepository";
import { PortalFioriShellBar } from "../components/veterinary-portal/shell/PortalFioriShellBar";
import { PortalSupervisionBar } from "../components/veterinary-portal/PortalSupervisionBar";
import { PortalActSignatureDialog } from "../components/veterinary-portal/PortalActSignatureDialog";
import { PortalShipmentDialog } from "../components/veterinary-portal/PortalShipmentDialog";
import { PortalLabReportDialog } from "../components/veterinary-portal/PortalLabReportDialog";
import { PortalNavTabs } from "../components/veterinary-portal/navigation/PortalNavTabs";
import {
  VeterinaryPortalContext,
  VeterinaryPortalContextType,
} from "../components/veterinary-portal/context/VeterinaryPortalContext";
import Logo from "@/components/theme-layouts/components/Logo";

interface Props {
  accessToken?: string | null;
}

/**
 * Master Enterprise Layout for the Veterinary Portal (SAP Fiori Horizon / ALV Standards).
 * Orchestrates session bootstrap, deep-link routing, official action dialogs, and renders child views via <Outlet />.
 */
export const VeterinaryPortalLayout: React.FC<Props> = ({
  accessToken: propToken = null,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();
  const { token: paramToken, veterinarianId: paramVetId, actId: paramActId } = useParams<{
    token?: string;
    veterinarianId?: string;
    actId?: string;
  }>();
  const [searchParams] = useSearchParams();

  const accessToken = propToken ?? paramToken ?? searchParams.get("token") ?? null;

  /**
   * Management supervision view-as mode.
   * Seeded from the route param or search param so inspecting a professional is a clean, bookmarkable URL.
   */
  const requestedViewAs = useMemo<number | "">(() => {
    const raw = paramVetId ?? searchParams.get("veterinarian_id");
    const parsed = raw === null ? Number.NaN : Number(raw);

    return Number.isInteger(parsed) && parsed > 0 ? parsed : "";
  }, [paramVetId, searchParams]);

  const [viewAs, setViewAs] = useState<number | "">(requestedViewAs);
  const { data: veterinarians = [] } = useVeterinarians();

  const basePath = accessToken
    ? `/vet-portal/${accessToken}`
    : viewAs !== ""
      ? `/vet-portal/inspect/${viewAs}`
      : `/vet-portal`;

  // A later navigation to another professional's portal has to land, and clearing the selector by
  // hand must not be undone by a stale query parameter — hence only non-empty values follow.
  useEffect(() => {
    if (requestedViewAs !== "") {
      setViewAs(requestedViewAs);
    }
  }, [requestedViewAs]);

  setPortalViewAs(accessToken === null && viewAs !== "" ? viewAs : null);

  const {
    data: session,
    isLoading: loadingSession,
    error: sessionError,
  } = useVeterinaryPortalSession(accessToken);

  const isProfessional = Boolean(session) && !sessionError;
  const isReadOnly = Boolean(session?.is_read_only);
  const isExternalDoor = accessToken !== null;
  const showSupervisionBar = accessToken === null && (isReadOnly || !isProfessional);

  const { data: acts, isLoading: loadingActs } = usePortalPendingActs(
    accessToken,
    isProfessional,
  );
  const { data: pendingTubes = [], isLoading: loadingTubes } =
    usePortalPendingTubes(accessToken, isProfessional);
  const { data: shipments = [] } = usePortalShipments(
    accessToken,
    isProfessional,
  );

  const signAct = useSignExtractionAct(accessToken);
  const registerReport = useRegisterLabReport(accessToken);
  const registerShipment = useRegisterShipment(accessToken);
  const voidShipment = useVoidShipment(accessToken);

  const [searchQuery, setSearchQuery] = useState("");
  const [actToSign, setActToSign] = useState<DiagnosticProtocol | null>(null);
  const [actToReport, setActToReport] = useState<DiagnosticProtocol | null>(null);
  const [shipmentOpen, setShipmentOpen] = useState(false);
  const [shipmentTargetProtocol, setShipmentTargetProtocol] = useState<DiagnosticProtocol | null>(null);

  // Shared Evaluation Act Setup State (Synchronized across Home and Evaluacion tabs)
  const [batchId, setBatchId] = useState<number | null>(null);
  const [sampleType, setSampleType] = useState<SampleType>("PREPUCE_SCRAPE");
  const [sampleRound, setSampleRound] = useState(1);
  const [sampleDate, setSampleDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [resultDate, setResultDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [totalBulls, setTotalBulls] = useState(0);
  const [evaluatedCount, setEvaluatedCount] = useState(0);

  // Prefills the institution block: the entity the professional invoices under is the likeliest
  // one they report from. Only a default — nothing is deduced from it (ADR-31 rev.).
  const defaultInstitutionCuit = useMemo(
    () => session?.veterinarian?.billing_cuit ?? session?.veterinarian?.cuit ?? null,
    [session],
  );

  // Deep-linking: detect if current URL is an action route or search param
  const requestedActId = useMemo(() => {
    if (paramActId) return Number(paramActId);
    const raw = searchParams.get("act");
    return raw ? Number(raw) : null;
  }, [paramActId, searchParams]);

  /*
   * ADR-11 + ADR-36: el informe hereda del acta, y la caja que la cubre es la que dice a quién se
   * derivó. Se busca por los tubos y no por un id de acta porque una conservadora puede llevar
   * tubos de varias actas; el más reciente no anulado es el vigente — una caja anulada no declara
   * ningún destino.
   */
  const shipmentForReport = useMemo(() => {
    if (!actToReport) return null;

    return (
      shipments
        .filter(
          (shipment) =>
            !shipment.is_voided &&
            shipment.samples.some((sample) => sample.extraction_act_id === actToReport.id),
        )
        .sort((a, b) => b.shipped_on.localeCompare(a.shipped_on))[0] ?? null
    );
  }, [shipments, actToReport]);

  const derivedPendingShipmentsCount = useMemo(() => {
    const map = new Map<number, DiagnosticProtocol>();
    (acts?.pending_signature ?? []).forEach((a) => {
      if (a.destination_plan === "TO_BE_DERIVED") map.set(a.id, a);
    });
    (acts?.pending_lab_report ?? []).forEach((a) => {
      if (a.destination_plan === "TO_BE_DERIVED") map.set(a.id, a);
    });
    return Array.from(map.values()).filter((a) => (a.unshipped_samples_count ?? 1) > 0).length;
  }, [acts]);

  useEffect(() => {
    if (!requestedActId || !acts) return;

    const pathname = location.pathname;

    // Check if deep link wants lab report
    if (pathname.includes("/informe")) {
      const toReport =
        acts.pending_lab_report?.find((a) => a.id === requestedActId) ??
        acts.pending_signature?.find((a) => a.id === requestedActId);
      if (toReport) setActToReport(toReport);
      return;
    }

    // Default to sign dialog
    const toSign = acts.pending_signature?.find((a) => a.id === requestedActId);
    if (toSign) {
      setActToSign(toSign);
    }
  }, [requestedActId, acts, location.pathname]);

  // Open shipment dialog if on /envios/nuevo
  useEffect(() => {
    if (location.pathname.endsWith("/envios/nuevo")) {
      setShipmentOpen(true);
    }
  }, [location.pathname]);

  const handleCloseSign = () => {
    setActToSign(null);
    if (location.pathname.includes("/firmar") || searchParams.has("act")) {
      navigate(`${basePath}/actas`, { replace: true });
    }
  };

  const handleCloseReport = () => {
    setActToReport(null);
    if (location.pathname.includes("/informe")) {
      navigate(`${basePath}/actas`, { replace: true });
    }
  };

  const handleCloseShipment = () => {
    setShipmentOpen(false);
    setShipmentTargetProtocol(null);
    if (location.pathname.includes("/envios/nuevo")) {
      navigate(`${basePath}/envios`, { replace: true });
    }
  };

  const handleSign = async (input: SignExtractionActInput) => {
    if (!actToSign) return;
    try {
      const signed = await signAct.mutateAsync({ actId: actToSign.id, input });
      handleCloseSign();
      enqueueSnackbar(
        `Acta ${signed.protocol_number} firmada. La cadena de custodia quedó cerrada.`,
        { variant: "success" },
      );
    } catch (err) {
      enqueueSnackbar(apiErrorMessage(err, "No se pudo firmar el acta."), {
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
      handleCloseReport();
      enqueueSnackbar(
        `Informe ${report.protocol_number} registrado y aptitud recalculada.`,
        { variant: "success" },
      );
    } catch (err) {
      enqueueSnackbar(
        apiErrorMessage(err, "No se pudo registrar el informe."),
        { variant: "error" },
      );
    }
  };

  const handleShipment = async (input: RegisterSampleShipmentInput) => {
    try {
      const shipment = await registerShipment.mutateAsync(input);
      handleCloseShipment();
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

  const handleVoidShipment = async (
    shipment: SampleShipment,
    reason: string,
  ) => {
    try {
      await voidShipment.mutateAsync({
        shipmentId: shipment.id,
        reason: reason.trim(),
      });
      enqueueSnackbar(
        "Envío anulado. Los tubos sin informe vuelven a estar en su poder.",
        { variant: "info" },
      );
    } catch (err) {
      enqueueSnackbar(apiErrorMessage(err, "No se pudo anular el envío."), {
        variant: "error",
      });
    }
  };

  if (loadingSession) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="flex flex-col items-center gap-4">
          <Logo size="medium" />
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs mt-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
            <span>Cargando Portal Veterinario...</span>
          </div>
        </div>
      </div>
    );
  }

  if (isExternalDoor && !isProfessional) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4">
        <div className="mx-auto my-12 max-w-lg rounded-xl border border-rose-200 bg-white p-6 sm:p-8 text-center shadow-md">
          <div className="flex justify-center mb-5">
            <Logo size="small" />
          </div>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-bold text-slate-900">Acceso Denegado o Vencido</h2>
          <p className="text-sm text-slate-600 mb-6">
            {apiErrorMessage(
              sessionError,
              "El enlace de acceso temporal no es válido o ha expirado. Por favor solicite una nueva invitación al administrador del establecimiento.",
            )}
          </p>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500">
            Plataforma <strong>RXNA Sistema Ganadero</strong> · Módulo de Actas Veterinarias
          </div>
        </div>
      </div>
    );
  }

  const contextValue: VeterinaryPortalContextType = {
    session,
    accessToken,
    isProfessional,
    isReadOnly,
    acts,
    loadingActs,
    pendingTubes,
    loadingTubes,
    shipments,
    searchQuery,
    setSearchQuery,
    basePath,
    onSignAct: (act) => {
      setActToSign(act);
      navigate(`${basePath}/actas/${act.id}/firmar`);
    },
    onReportAct: (act) => {
      setActToReport(act);
      navigate(`${basePath}/actas/${act.id}/informe`);
    },
    onOpenShipment: (protocol?: DiagnosticProtocol) => {
      setShipmentTargetProtocol(protocol ?? null);
      setShipmentOpen(true);
      navigate(`${basePath}/envios/nuevo`);
    },
    onVoidShipment: handleVoidShipment,
    batchId,
    setBatchId,
    sampleType,
    setSampleType,
    sampleRound,
    setSampleRound,
    sampleDate,
    setSampleDate,
    resultDate,
    setResultDate,
    totalBulls,
    setTotalBulls,
    evaluatedCount,
    setEvaluatedCount,
  };

  const handleSelectViewAs = (newVetId: number | "") => {
    setViewAs(newVetId);
    if (newVetId !== "") {
      navigate(`/vet-portal/inspect/${newVetId}`);
    } else {
      navigate("/gestation/veterinary-portal");
    }
  };

  const handleReturnToDirectory = () => {
    navigate("/gestation/veterinary-portal");
  };

  return (
    <VeterinaryPortalContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased">
        {/* Top Integrated Portal Header Unit (ShellBar + Tabs, 0px gap, full width) */}
        <div className="w-full shadow-sm">
          <PortalFioriShellBar
            veterinarianName={session?.veterinarian?.name}
            licenseNumber={session?.veterinarian?.license_number}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            ttlText={isReadOnly ? "Modo Supervisión (Lectura)" : "Acceso Profesional"}
          />

          {showSupervisionBar && (
            <div className="w-full border-b border-divider bg-amber-50/50 px-4 py-2 sm:px-6">
              <div className="mx-auto max-w-[1720px]">
                <PortalSupervisionBar
                  veterinarians={veterinarians}
                  selectedId={viewAs}
                  onSelect={handleSelectViewAs}
                  isReadOnly={isReadOnly}
                  onReturnToDirectory={handleReturnToDirectory}
                />
              </div>
            </div>
          )}

          {/* Full-width seamless navigation tabs */}
          <PortalNavTabs
            basePath={basePath}
            pendingCount={0}
            actsCount={
              (acts?.pending_signature.length ?? 0) +
              (acts?.pending_lab_report.length ?? 0)
            }
            receptionsCount={derivedPendingShipmentsCount}
            tubesCount={pendingTubes.length}
            showAccessTab={!isExternalDoor && (!isProfessional || isReadOnly)}
          />
        </div>

        {/* Routed Workspace Tab View */}
        <main className="w-full">
          <Outlet />
        </main>

        {/* Official Act Signature Dialog */}
        <PortalActSignatureDialog
          open={actToSign !== null}
          act={actToSign}
          veterinarianName={session?.veterinarian?.name ?? ""}
          licenseNumber={session?.veterinarian?.license_number ?? ""}
          isSaving={signAct.isPending}
          onClose={handleCloseSign}
          onConfirm={handleSign}
        />

        {/* Sample Shipment Dispatch Dialog */}
        <PortalShipmentDialog
          open={shipmentOpen}
          tubes={pendingTubes}
          isSaving={registerShipment.isPending}
          accessToken={accessToken}
          initialSelectedActId={shipmentTargetProtocol?.id ?? null}
          onClose={handleCloseShipment}
          onConfirm={handleShipment}
        />

        {/* Official Lab Report Full-Screen Dialog */}
        <PortalLabReportDialog
          open={actToReport !== null}
          act={actToReport}
          isSaving={registerReport.isPending}
          defaultInstitutionCuit={defaultInstitutionCuit}
          shipment={shipmentForReport}
          onReviewShipment={() => {
            handleCloseReport();
            navigate(`${basePath}/envios`);
          }}
          onClose={handleCloseReport}
          onConfirm={handleReport}
        />
      </div>
    </VeterinaryPortalContext.Provider>
  );
};

export default VeterinaryPortalLayout;
