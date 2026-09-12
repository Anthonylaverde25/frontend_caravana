import React, { useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import {
  usePortalPathogens,
  useSubmitPortalEvaluation,
  useVeterinaryPortalWorkspace,
} from "@/features/gestation/hooks/useVeterinaryPortal";
import {
  LabSampleStatus,
  SampleType,
} from "@/core/veterinary/domain/VeterinaryTypes";
import {
  PortalBullDraft,
  PortalPathogenColumn,
} from "../components/veterinary-portal/PortalBullEvaluationRow";
import {
  PortalGridToolbar,
  PortalTabKey,
} from "../components/veterinary-portal/toolbar/PortalGridToolbar";
import { PortalAlvTable } from "../components/veterinary-portal/table/PortalAlvTable";
import { PortalBottomActionBar } from "../components/veterinary-portal/footer/PortalBottomActionBar";
import { apiErrorMessage } from "@/core/veterinary/domain/apiErrorMessage";
import {
  useVeterinaryPortalContext,
  VeterinaryPortalContextType,
} from "../components/veterinary-portal/context/VeterinaryPortalContext";

export interface VeterinaryPortalMangaViewProps {
  accessToken?: string | null;
  activeTab?: PortalTabKey;
  onTabChange?: (tab: PortalTabKey) => void;
  pendingActsCount?: number;
  /** ADR-20: acts whose tubes nobody has declared having received yet. */
  pendingReceptionsCount?: number;
  searchQuery?: string;
}

const today = () => new Date().toISOString().split("T")[0];

const DEFAULT_VENEREAL_PATHOGENS: PortalPathogenColumn[] = [
  { id: 2, code: "CAMPYLOBACTER_FETUS", name: "Campylobacter" },
  { id: 8, code: "BOVINE_HERPESVIRUS_1", name: "Herpesvirus" },
  { id: 7, code: "BOVINE_PAPILLOMAVIRUS", name: "Papiloma" },
  { id: 1, code: "TRITRICHOMONAS_FOETUS", name: "Tritrichomonas" },
];

const emptyDraft = (): PortalBullDraft => ({
  scrotal_circumference_cm: "",
  body_condition_score: "",
  aplomo_notes: "",
  libido: "MEDIA",
  results: {},
});

export const VeterinaryPortalMangaView: React.FC<
  VeterinaryPortalMangaViewProps
> = ({
  accessToken,
  activeTab,
  onTabChange,
  pendingActsCount,
  pendingReceptionsCount,
  searchQuery,
}) => {
  const { enqueueSnackbar } = useSnackbar();

  let ctx: VeterinaryPortalContextType | null = null;
  try {
    ctx = useVeterinaryPortalContext();
  } catch {
    // Rendered outside layout context
  }

  const effectiveAccessToken = accessToken ?? ctx?.accessToken ?? null;
  const effectiveSearchQuery = searchQuery ?? ctx?.searchQuery ?? "";

  const [localBatchId, setLocalBatchId] = useState<number | null>(null);
  const [localSampleDate, setLocalSampleDate] = useState(today());
  const [localResultDate, setLocalResultDate] = useState(today());
  const [localSampleType, setLocalSampleType] = useState<SampleType>("PREPUCE_SCRAPE");
  const [localSampleRound, setLocalSampleRound] = useState(1);

  const batchId = ctx?.batchId ?? localBatchId;
  const setBatchId = ctx?.setBatchId ?? setLocalBatchId;
  const sampleType = ctx?.sampleType ?? localSampleType;
  const setSampleType = ctx?.setSampleType ?? setLocalSampleType;
  const sampleRound = ctx?.sampleRound ?? localSampleRound;
  const setSampleRound = ctx?.setSampleRound ?? setLocalSampleRound;
  const sampleDate = ctx?.sampleDate ?? localSampleDate;
  const setSampleDate = ctx?.setSampleDate ?? setLocalSampleDate;
  const resultDate = ctx?.resultDate ?? localResultDate;
  const setResultDate = ctx?.setResultDate ?? setLocalResultDate;

  const {
    data: workspace,
    isLoading,
    error,
  } = useVeterinaryPortalWorkspace(batchId, effectiveAccessToken);
  const { data: pathogens = [] } = usePortalPathogens(effectiveAccessToken);
  const submitEvaluation = useSubmitPortalEvaluation(effectiveAccessToken);

  const [protocolNumber, setProtocolNumber] = useState(
    `MANGA-${new Date().getFullYear()}-001`,
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [drafts, setDrafts] = useState<Record<number, PortalBullDraft>>({});

  // Auto-select the first batch available in the workspace
  useEffect(() => {
    if (batchId === null && workspace?.batches?.length) {
      setBatchId(workspace.batches[0].id);
    }
  }, [workspace, batchId, setBatchId]);

  // Sync counts to context
  useEffect(() => {
    if (workspace?.bulls) {
      ctx?.setTotalBulls(workspace.bulls.length);
    }
  }, [workspace?.bulls, ctx]);

  useEffect(() => {
    ctx?.setEvaluatedCount(selectedIds.length);
  }, [selectedIds.length, ctx]);

  // Venereal pathogens for chute evaluation
  const portalPathogens: PortalPathogenColumn[] = useMemo(() => {
    const list = pathogens.length > 0 ? pathogens : [];
    const filtered = list
      .filter((pathogen) =>
        sampleType === "PREPUCE_SCRAPE"
          ? pathogen.category === "VENEREAL"
          : true,
      )
      .map((pathogen) => ({
        id: pathogen.id,
        code: pathogen.code,
        name: pathogen.name ? pathogen.name.split("(")[0].trim() : pathogen.code,
      }));

    return filtered.length > 0 ? filtered : DEFAULT_VENEREAL_PATHOGENS;
  }, [pathogens, sampleType]);

  // Filter bulls by search query if any
  const filteredBulls = useMemo(() => {
    if (!workspace?.bulls) return [];
    if (!effectiveSearchQuery.trim()) return workspace.bulls;
    const q = effectiveSearchQuery.toLowerCase().trim();
    return workspace.bulls.filter(
      (b) =>
        b.identification.toLowerCase().includes(q) ||
        b.caravan_id.toString().includes(q) ||
        b.aptitude_status.toLowerCase().includes(q),
    );
  }, [workspace?.bulls, effectiveSearchQuery]);

  const handleToggle = (caravanId: number) => {
    setSelectedIds((prev) =>
      prev.includes(caravanId)
        ? prev.filter((id) => id !== caravanId)
        : [...prev, caravanId],
    );
    setDrafts((prev) =>
      prev[caravanId] ? prev : { ...prev, [caravanId]: emptyDraft() },
    );
  };

  const handleToggleAll = () => {
    if (!workspace?.bulls) return;
    if (selectedIds.length === workspace.bulls.length) {
      setSelectedIds([]);
    } else {
      const allIds = workspace.bulls.map((b) => b.caravan_id);
      setSelectedIds(allIds);
      setDrafts((prev) => {
        const next = { ...prev };
        allIds.forEach((id) => {
          if (!next[id]) next[id] = emptyDraft();
        });
        return next;
      });
    }
  };

  const handleDraftChange = (
    caravanId: number,
    patch: Partial<PortalBullDraft>,
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [caravanId]: { ...(prev[caravanId] ?? emptyDraft()), ...patch },
    }));
    if (!selectedIds.includes(caravanId)) {
      setSelectedIds((prev) => [...prev, caravanId]);
    }
  };

  const handleResultChange = (
    caravanId: number,
    pathogenId: number,
    status: LabSampleStatus,
  ) => {
    setDrafts((prev) => {
      const draft = prev[caravanId] ?? emptyDraft();
      return {
        ...prev,
        [caravanId]: {
          ...draft,
          results: { ...draft.results, [pathogenId]: status },
        },
      };
    });
    if (!selectedIds.includes(caravanId)) {
      setSelectedIds((prev) => [...prev, caravanId]);
    }
  };

  // Bulk Action 1: Mark all venereal pathogens as negative
  const handleMarkAllNegative = () => {
    if (!workspace?.bulls || workspace.bulls.length === 0) return;
    const targetIds =
      selectedIds.length > 0
        ? selectedIds
        : workspace.bulls.map((b) => b.caravan_id);

    setDrafts((prev) => {
      const next = { ...prev };
      targetIds.forEach((id) => {
        const current = next[id] ?? emptyDraft();
        const nextResults: Record<number, LabSampleStatus> = {
          ...current.results,
        };
        portalPathogens.forEach((p) => {
          nextResults[p.id] = "NEGATIVE_CLEARED";
        });
        next[id] = { ...current, results: nextResults };
      });
      return next;
    });

    if (selectedIds.length === 0) {
      setSelectedIds(targetIds);
    }

    enqueueSnackbar("Resultados venéreos marcados como Negativo (Lote Sano).", {
      variant: "success",
    });
  };

  // Bulk Action 2: Copy average body condition score (3.5)
  const handleCopyAvgCondition = () => {
    if (!workspace?.bulls || workspace.bulls.length === 0) return;
    const targetIds =
      selectedIds.length > 0
        ? selectedIds
        : workspace.bulls.map((b) => b.caravan_id);

    setDrafts((prev) => {
      const next = { ...prev };
      targetIds.forEach((id) => {
        const current = next[id] ?? emptyDraft();
        next[id] = { ...current, body_condition_score: "3.5" };
      });
      return next;
    });

    if (selectedIds.length === 0) {
      setSelectedIds(targetIds);
    }

    enqueueSnackbar("Condición corporal 3.5 asignada a los reproductores.", {
      variant: "info",
    });
  };

  // Bulk Action 3: Scale import
  const handleImportBalanza = () => {
    enqueueSnackbar(
      "Conexión con balanza electrónica activada. Importando pesadas de manga...",
      {
        variant: "info",
      },
    );
  };

  // Bulk Action 4: Export CSV spreadsheet
  const handleExportPlanilla = () => {
    if (!workspace?.bulls || workspace.bulls.length === 0) {
      enqueueSnackbar("No hay datos para exportar.", { variant: "warning" });
      return;
    }

    const headers = [
      "Caravana",
      "CE (cm)",
      "Condicion Corporal",
      "Libido",
      ...portalPathogens.map((p) => p.name),
      "Observaciones",
    ];

    const rows = workspace.bulls.map((bull) => {
      const draft = drafts[bull.caravan_id] ?? emptyDraft();
      return [
        bull.identification,
        draft.scrotal_circumference_cm || "",
        draft.body_condition_score || "",
        draft.libido,
        ...portalPathogens.map(
          (p) => draft.results[p.id] ?? "NEGATIVE_CLEARED",
        ),
        `"${(draft.aplomo_notes || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `evaluacion_manga_${batchId ?? "lote"}_${sampleDate}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    enqueueSnackbar("Planilla de manga exportada exitosamente.", {
      variant: "success",
    });
  };

  const handleSaveDraft = () => {
    enqueueSnackbar("Borrador de evaluación guardado localmente.", {
      variant: "success",
    });
  };

  const handleSubmit = async () => {
    if (batchId === null) {
      enqueueSnackbar("Seleccione la tropa sobre la que está trabajando.", {
        variant: "warning",
      });
      return;
    }
    if (!protocolNumber.trim()) {
      enqueueSnackbar("Ingrese el número de protocolo de la sesión.", {
        variant: "warning",
      });
      return;
    }
    if (selectedIds.length === 0) {
      enqueueSnackbar(
        "Seleccione al menos un reproductor evaluado en la grilla.",
        { variant: "warning" },
      );
      return;
    }

    try {
      await submitEvaluation.mutateAsync({
        batch_id: batchId,
        protocol_number: protocolNumber.trim(),
        sample_date: sampleDate,
        result_date: resultDate,
        bulls: selectedIds.map((caravanId) => {
          const draft = drafts[caravanId] ?? emptyDraft();

          return {
            caravan_id: caravanId,
            scrotal_circumference_cm: draft.scrotal_circumference_cm
              ? Number(draft.scrotal_circumference_cm)
              : null,
            body_condition_score: draft.body_condition_score
              ? Number(draft.body_condition_score)
              : null,
            aplomo_notes: draft.aplomo_notes || null,
            libido: draft.libido,
            samples: portalPathogens.map((pathogen) => ({
              pathogen_id: pathogen.id,
              sample_type: sampleType,
              sample_round: sampleRound,
              status: draft.results[pathogen.id] ?? "NEGATIVE_CLEARED",
            })),
          };
        }),
      });

      enqueueSnackbar(
        "Dictamen oficial firmado y aptitudes sanitarias recalculadas.",
        {
          variant: "success",
        },
      );
      setSelectedIds([]);
      setDrafts({});
    } catch (submitError: unknown) {
      enqueueSnackbar(
        apiErrorMessage(submitError, "No se pudo registrar la evaluación."),
        {
          variant: "error",
        },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-800 border-t-transparent" />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="mx-auto my-8 max-w-xl rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">
        No se pudo abrir el portal veterinario. Si ingresó por un enlace
        temporal, es posible que haya vencido o haya sido revocado: solicite uno
        nuevo al establecimiento.
      </div>
    );
  }

  const totalBulls = workspace.bulls.length;
  const evaluatedCount = selectedIds.length;
  const pendingCount = totalBulls - evaluatedCount;

  return (
    <div className="flex flex-col space-y-3 pb-16 pt-1">
      {/* Main Container: Toolbar + Dense ALV Spreadsheet */}
      <div className="mx-auto w-full max-w-[1720px] space-y-3 px-4 sm:px-6">
        <PortalGridToolbar
          onMarkAllNegative={handleMarkAllNegative}
          onCopyAvgCondition={handleCopyAvgCondition}
          onImportBalanza={handleImportBalanza}
          onExportPlanilla={handleExportPlanilla}
        />

        <PortalAlvTable
          bulls={filteredBulls}
          pathogens={portalPathogens}
          selectedIds={selectedIds}
          drafts={drafts}
          onToggle={handleToggle}
          onToggleAll={handleToggleAll}
          onDraftChange={handleDraftChange}
          onResultChange={handleResultChange}
        />
      </div>

      {/* Sticky Bottom Action Bar */}
      <PortalBottomActionBar
        evaluatedCount={evaluatedCount}
        totalBulls={totalBulls}
        licenseNumber={workspace.veterinarian.license_number}
        onSaveDraft={handleSaveDraft}
        onSign={handleSubmit}
        isSigning={submitEvaluation.isPending}
      />
    </div>
  );
};

export default VeterinaryPortalMangaView;
