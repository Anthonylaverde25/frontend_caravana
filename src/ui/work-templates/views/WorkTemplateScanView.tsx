import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Autocomplete,
  TablePagination,
  InputAdornment,
  useTheme,
  alpha,
  Collapse,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import {
  CloudUpload as CloudUploadIcon,
  AutoAwesome as AutoAwesomeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateRight as RotateRightIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Agriculture as AgricultureIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  RestartAlt as RestartAltIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router";
import axiosInstance from "@/utils/axios";
import ViewLayout from "src/components/ViewLayout";
import { useCompany } from "@/contexts/CompanyContext";
import { useActivities } from "@/features/activities/hooks/useActivities";
import templateService from "../services/TemplateService";
import {
  WorkTemplateScanRow,
  Tor01Metadata,
  ScanTor01MetadataHeader,
  ScanTor01Table,
  ScanSuccessDialog,
  Lser01Metadata,
  ScanLser01MetadataHeader,
  ScanLser01Table,
  Lser01RepairDialog,
  Dest01Row,
  ScanDest01Workspace,
  Dest01RepairDialog,
  Cact01Row,
  ScanCact01Workspace,
  Cact01RepairDialog,
  ScanPreviewSidePanel,
  ScanDocumentPreviewModal,
  SimulationSelectorModal,
  getSimulationPreset,
  generateSimulationSvg,
  SimulationPreset,
  SimulationScenario,
} from "../components/scan";
import {
  useLser01Submission,
  emptyLser01Metadata,
} from "../hooks/useLser01Submission";
import {
  DEST01_CODE,
  pageFromIdentifyResponse,
  useDest01Pages,
} from "../hooks/useDest01Pages";
import { useDest01Submission } from "../hooks/useDest01Submission";
import {
  CACT01_CODE,
  pageFromIdentifyResponse as cact01PageFromIdentifyResponse,
  useCact01Pages,
} from "../hooks/useCact01Pages";
import { useCact01Destinations } from "../hooks/useCact01Destinations";
import { useCact01Submission } from "../hooks/useCact01Submission";
import { useCact01ScanOptions } from "../hooks/useCact01ScanOptions";
import { useCact01SourceBatch } from "../hooks/useCact01SourceBatch";
import { suggestedWeaningBatchName } from "../templates/dest01/Dest01PrintContext";

type CaravanRow = WorkTemplateScanRow;

const ACCEPTED_FILE_TYPES = ".png,.jpg,.jpeg,.webp,.pdf";

const COMMON_CATEGORIES = [
  "Vaquillona Reposición",
  "Vaquillona",
  "Vaca",
  "Toro",
  "Ternero",
  "Ternera",
  "Novillo",
  "Novillito",
  "Descarte",
];

const COMMON_BREEDS = [
  "Angus",
  "Angus Negro",
  "Angus Colorado",
  "Hereford",
  "Brangus",
  "Braford",
  "Holando",
  "Cruza",
];

const normalizeDateForInput = (rawDate?: string | null): string => {
  if (!rawDate) return new Date().toISOString().slice(0, 10);
  const clean = rawDate.replace(/\s*([\/\-\.])\s*/g, "$1").trim();
  if (clean.includes("_") || clean === "") {
    return new Date().toISOString().slice(0, 10);
  }
  // Check YYYY-MM-DD
  const ymdMatch = clean.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})$/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // Check DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-\/\.](\d{1,2})[-\/\.](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const parsed = Date.parse(clean);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
};

export const WorkTemplateScanView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeCompanyId, companies } = useCompany();
  const { data: activities = [] } = useActivities(activeCompanyId);

  const activeCompany = useMemo(() => {
    return companies?.find((c) => c.id === activeCompanyId) || null;
  }, [companies, activeCompanyId]);

  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);


  // URL Query Param Template Code Sync
  const urlTemplateCode = useMemo(() => {
    return (
      searchParams.get("template") ||
      searchParams.get("templateCode") ||
      searchParams.get("code") ||
      "ING-01"
    );
  }, [searchParams]);

  // Extracted Result State
  const [isProcessed, setIsProcessed] = useState(false);
  const [templateCode, setTemplateCode] = useState<string>(urlTemplateCode);
  const [templateTitle, setTemplateTitle] = useState<string>(
    urlTemplateCode === "TOR-01"
      ? "Revisación Andrológica de Toros"
      : urlTemplateCode === "LSER-01"
        ? "Conformación de Lote de Servicio — Toro Único"
        : "Ingreso de Compra Directa"
  );

  // Context Fields (ING-01)
  const [batchName, setBatchName] = useState<string>("");
  const [activityName, setActivityName] = useState<string>("");
  const [entryDate, setEntryDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [providerCuit, setProviderCuit] = useState<string>("");
  const [providerRenspa, setProviderRenspa] = useState<string>("");
  const [guiaDte, setGuiaDte] = useState<string>("");

  // Context Fields (TOR-01)
  const [tor01Metadata, setTor01Metadata] = useState<Tor01Metadata>({
    farm_name: "",
    renspa: "",
    veterinarian_name: "",
    veterinarian_license: "",
    sample_round: 1,
    evaluation_date: new Date().toISOString().slice(0, 10),
  });
  const [isTor01MetadataOpen, setIsTor01MetadataOpen] = useState(true);

  const handleTor01MetadataChange = <K extends keyof Tor01Metadata>(
    field: K,
    value: Tor01Metadata[K]
  ) => {
    setTor01Metadata((prev) => ({ ...prev, [field]: value }));
  };

  // Context Fields (LSER-01)
  const [lser01Metadata, setLser01Metadata] = useState<Lser01Metadata>(emptyLser01Metadata);
  const [isLser01MetadataOpen, setIsLser01MetadataOpen] = useState(true);
  const [isLser01RepairOpen, setIsLser01RepairOpen] = useState(false);
  const lser01 = useLser01Submission();

  const handleLser01MetadataChange = <K extends keyof Lser01Metadata>(
    field: K,
    value: Lser01Metadata[K]
  ) => {
    setLser01Metadata((prev) => ({ ...prev, [field]: value }));
  };

  // Context Fields (DEST-01): several scanned pages confirmed together
  const dest01 = useDest01Pages();
  const dest01Submission = useDest01Submission();
  const [isDest01RepairOpen, setIsDest01RepairOpen] = useState(false);

  const cact01 = useCact01Pages();
  const cact01Submission = useCact01Submission();
  const cact01Options = useCact01ScanOptions();
  const cact01Destinations = useCact01Destinations(
    cact01.rows,
    cact01Options.batches,
    cact01.metadata.sistema_manejo === "CORRAL"
      ? true
      : cact01.metadata.sistema_manejo === "PASTURA"
        ? false
        : null,
  );
  // The sheet names its source batch at the top; proposing it here is what stops the
  // validation from asking for something the header already answered.
  const cact01Source = useCact01SourceBatch(
    cact01.metadata.lote_origen,
    cact01.sourceBatchId,
    cact01.setSourceBatchId,
    cact01Options.sourceBatchOptions,
  );
  const [isCact01RepairOpen, setIsCact01RepairOpen] = useState(false);

  const handleCact01RowChange = (
    id: string,
    field: keyof Cact01Row,
    value: string,
  ) => {
    if (cact01Submission.repair) {
      cact01Submission.markRowEdited(id);
    }
    cact01.updateRow(id, field, value);
  };

  const handleDest01RowChange = (id: string, field: keyof Dest01Row, value: string) => {
    if (dest01Submission.repair) {
      dest01Submission.markRowEdited(id);
    }
    dest01.updateRow(id, field, value);
  };

  // Table Rows State
  const [rows, setRows] = useState<CaravanRow[]>([]);

  // Side Preview Controls
  const [showPreview, setShowPreview] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Full Interactive Preview Modal State
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [modalZoomLevel, setModalZoomLevel] = useState(1);
  const [modalRotation, setModalRotation] = useState(0);

  // Saving State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessResult, setSaveSuccessResult] = useState<any | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with URL parameter on change
  React.useEffect(() => {
    if (urlTemplateCode) {
      setTemplateCode(urlTemplateCode);
      templateService
        .getWorkTemplateByCode(urlTemplateCode)
        .then((t) => {
          if (t) {
            setTemplateTitle(t.title);
          }
        })
        .catch(() => {});
    }
  }, [urlTemplateCode]);

  // Change Template Code in URL
  const handleTemplateChange = (newCode: string) => {
    setSearchParams({ template: newCode }, { replace: true });
    setTemplateCode(newCode);
    templateService
      .getWorkTemplateByCode(newCode)
      .then((t) => {
        if (t) setTemplateTitle(t.title);
      })
      .catch(() => {});
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Table Search, Quick Filters & Pagination State (Gestation Pedigree Design Pattern)
  const [searchTerm, setSearchTerm] = useState("");
  const [tableFilter, setTableFilter] = useState<"ALL" | "VALID" | "WARNINGS">(
    "ALL",
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [isMetadataOpen, setIsMetadataOpen] = useState(true);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        r.caravana.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.breed.toLowerCase().includes(q) ||
        r.observations.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (tableFilter === "VALID") {
        return (
          r.caravana.trim() !== "" &&
          (r.entry_weight === "" || Number(r.entry_weight) > 0)
        );
      }
      if (tableFilter === "WARNINGS") {
        return (
          !r.caravana.trim() ||
          (r.entry_weight !== "" && Number(r.entry_weight) <= 0)
        );
      }

      return true;
    });
  }, [rows, searchTerm, tableFilter]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const headerBg = isDark ? "#1e293b" : "#f8fafc";
  const zebraBg = isDark ? "rgba(255, 255, 255, 0.02)" : "#fafafa";

  const headerCellStyle = {
    py: 1.5,
    px: 1.5,
    fontSize: "0.7rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    color: isDark ? "#94a3b8" : "#475569",
    borderBottom: "1px solid",
    borderRight: "1px solid",
    borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
    whiteSpace: "nowrap" as const,
    letterSpacing: "0.04em",
    bgcolor: headerBg,
  };

  // Real-time Template Validation Engine
  const validationResult = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (templateCode === DEST01_CODE) {
      const { target, metadata } = dest01;
      if (target.mode === "existing" && !target.batchId) {
        errors.push("Elegí el lote de destete existente");
      }
      if (target.mode === "new" && !target.name.trim()) {
        errors.push("Nombre del lote de destete nuevo requerido");
      }
      if (!metadata.fecha_destete) {
        errors.push("Fecha de destete requerida");
      }
      if (dest01.pendingPage) {
        errors.push("Hay una hoja con un encabezado distinto pendiente de decidir");
      }

      const calfTags = dest01.rows.map((r) => r.caravana.trim().toUpperCase()).filter(Boolean);
      if (calfTags.length === 0) {
        errors.push("Sin crías registradas en la planilla");
      }

      const duplicates = calfTags.filter((tag, idx) => calfTags.indexOf(tag) !== idx);
      if (duplicates.length > 0) {
        warnings.push(`Caravanas duplicadas: ${Array.from(new Set(duplicates)).join(", ")}`);
      }
      const invalidWeights = dest01.rows.filter(
        (r) => r.peso.trim() !== "" && !Number.isFinite(Number(r.peso.replace(",", "."))),
      );
      if (invalidWeights.length > 0) {
        errors.push(`${invalidWeights.length} peso(s) que no son un número`);
      }
      if (dest01.missingPages.length > 0) {
        warnings.push(`Faltan hojas: ${dest01.missingPages.join(", ")}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        validRowsCount: calfTags.length,
      };
    }

    if (templateCode === CACT01_CODE) {
      if (!cact01.sourceBatchId) {
        errors.push("Elegí el lote de origen");
      }
      if (!cact01.metadata.fecha_movimiento) {
        errors.push("Fecha del movimiento requerida");
      }
      if (cact01.pendingPage) {
        errors.push("Hay una hoja con un encabezado distinto pendiente de decidir");
      }

      // Everything the backend would reject as a header error, surfaced before the
      // operator spends a round trip on it.
      cact01Destinations.blockingIssues.forEach((issue) => errors.push(issue));

      const tags = cact01.rows
        .map((r) => r.caravana.trim().toUpperCase())
        .filter(Boolean);
      if (tags.length === 0) {
        errors.push("Sin animales registrados en la planilla");
      }

      const duplicates = tags.filter((tag, idx) => tags.indexOf(tag) !== idx);
      if (duplicates.length > 0) {
        warnings.push(
          `Caravanas duplicadas: ${Array.from(new Set(duplicates)).join(", ")}`,
        );
      }
      const invalidWeights = cact01.rows.filter(
        (r) =>
          r.peso_actual.trim() !== "" &&
          !Number.isFinite(Number(r.peso_actual.replace(",", "."))),
      );
      if (invalidWeights.length > 0) {
        errors.push(`${invalidWeights.length} peso(s) que no son un número`);
      }
      if (cact01.missingPages.length > 0) {
        warnings.push(`Faltan hojas: ${cact01.missingPages.join(", ")}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        validRowsCount: tags.length,
      };
    }

    if (templateCode === "LSER-01") {
      if (!lser01Metadata.lote.trim()) {
        errors.push("Nombre del lote de servicio requerido");
      }
      if (!lser01Metadata.toro_caravana.trim()) {
        errors.push("Caravana del toro requerida");
      }
      if (!lser01Metadata.planned_start_date) {
        errors.push("Fecha de inicio de servicio requerida");
      }

      const femaleTags = rows.map((r) => r.caravana.trim().toUpperCase()).filter(Boolean);
      if (femaleTags.length === 0) {
        errors.push("Sin vientres registrados en la planilla");
      }

      const duplicates = femaleTags.filter((tag, idx) => femaleTags.indexOf(tag) !== idx);
      if (duplicates.length > 0) {
        warnings.push(`Caravanas duplicadas: ${Array.from(new Set(duplicates)).join(", ")}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        validRowsCount: femaleTags.length,
      };
    }

    if (templateCode === "TOR-01") {
      if (rows.length === 0) {
        errors.push("Sin toros registrados en la planilla");
      } else {
        const emptyCaravanas = rows.filter((r) => !r.caravana.trim());
        if (emptyCaravanas.length > 0) {
          errors.push(`${emptyCaravanas.length} toro(s) sin identificación de caravana`);
        }

        const lowCeBulls = rows.filter(
          (r) => r.ce_cm !== "" && r.ce_cm !== null && Number(r.ce_cm) < 28.0
        );
        if (lowCeBulls.length > 0) {
          warnings.push(
            `${lowCeBulls.length} toro(s) con CE < 28 cm (umbral mínimo Carrillo)`
          );
        }

        const missingScrapeTubes = rows.filter(
          (r) => r.scrape_collected && !r.scrape_tube?.trim()
        );
        if (missingScrapeTubes.length > 0) {
          warnings.push(`${missingScrapeTubes.length} muestra(s) de raspaje sin N° de tubo`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        validRowsCount: rows.filter((r) => r.caravana.trim() !== "").length,
      };
    }

    if (!batchName.trim()) {
      errors.push("Nombre de lote de destino requerido");
    }

    if (rows.length === 0) {
      errors.push("Sin animales registrados en la planilla");
    } else {
      const emptyCaravanas = rows.filter((r) => !r.caravana.trim());
      if (emptyCaravanas.length > 0) {
        errors.push(`${emptyCaravanas.length} animal(es) sin caravana/TAG`);
      }

      // Check duplicates
      const tags = rows
        .map((r) => r.caravana.trim().toUpperCase())
        .filter(Boolean);
      const duplicates = tags.filter((tag, idx) => tags.indexOf(tag) !== idx);
      if (duplicates.length > 0) {
        warnings.push(
          `Caravanas duplicadas: ${Array.from(new Set(duplicates)).join(", ")}`,
        );
      }

      const zeroWeights = rows.filter(
        (r) => r.entry_weight !== "" && Number(r.entry_weight) <= 0,
      );
      if (zeroWeights.length > 0) {
        warnings.push(`${zeroWeights.length} animal(es) con peso 0 kg`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validRowsCount: rows.filter((r) => r.caravana.trim() !== "").length,
    };
  }, [templateCode, batchName, rows, lser01Metadata, dest01, cact01, cact01Destinations]);

  // Apply Structured Simulation Preset (Fast Testing Mode - Zero AI latency)
  const handleApplySimulationPreset = (preset: SimulationPreset) => {
    setSearchParams({ template: preset.templateCode }, { replace: true });
    setFile(null);
    setErrorMessage(null);
    setTemplateCode(preset.templateCode);
    setTemplateTitle(`${preset.templateTitle} (${preset.scenarioLabel})`);

    const svgUrl = generateSimulationSvg(preset, 1, preset.pages ? preset.pages.length : 1);
    setFilePreviewUrl(svgUrl);

    if (preset.templateCode === DEST01_CODE) {
      dest01Submission.clearRepair();
      if (preset.pages && preset.pages.length > 0) {
        // Multi-page simulation
        const p1 = pageFromIdentifyResponse(
          {
            context: preset.pages[0].metadata,
            data: [
              {
                mapped_rows: preset.pages[0].rows.map((r: any) => ({
                  caravana: { value: r.caravana, confidence: 0.98 },
                  caravana_madre: { value: r.caravana_madre, confidence: 0.95 },
                  peso: { value: String(r.peso), confidence: 0.95 },
                })),
              },
            ],
          },
          preset.pages[0].fileName,
          svgUrl,
        );
        dest01.startWith(p1);

        if (preset.pages[1]) {
          const p2Svg = generateSimulationSvg(preset, 2, preset.pages.length);
          const p2 = pageFromIdentifyResponse(
            {
              context: preset.pages[1].metadata,
              data: [
                {
                  mapped_rows: preset.pages[1].rows.map((r: any) => ({
                    caravana: { value: r.caravana, confidence: 0.98 },
                    caravana_madre: { value: r.caravana_madre, confidence: 0.95 },
                    peso: { value: String(r.peso), confidence: 0.95 },
                  })),
                },
              ],
            },
            preset.pages[1].fileName,
            p2Svg,
          );
          dest01.addPage(p2);
        }
      } else {
        const fakeRow = (caravana: string, madre: string, peso: number | string) => ({
          caravana: { value: caravana, confidence: 0.97 },
          caravana_madre: { value: madre, confidence: 0.95 },
          peso: { value: String(peso), confidence: 0.9 },
        });
        dest01.startWith(
          pageFromIdentifyResponse(
            {
              context: preset.context,
              data: [
                {
                  mapped_rows: preset.rows.map((r: any) => fakeRow(r.caravana, r.caravana_madre, r.peso)),
                },
              ],
            },
            `simulacion-${preset.templateCode.toLowerCase()}.svg`,
            svgUrl,
          ),
        );
      }

      if (preset.scenario === 'REPAIR_ERROR') {
        setIsDest01RepairOpen(true);
      }
      setIsProcessed(true);
      return;
    }

    if (preset.templateCode === CACT01_CODE) {
      cact01Submission.clearRepair();
      cact01Destinations.reset();

      // The same shape the microservice returns, so the simulation exercises the real
      // extraction path — including the "row cell wins, header is the default" rule.
      const fakeRow = (r: any) => ({
        caravana: { value: r.caravana, confidence: 0.97 },
        peso_actual: { value: String(r.peso_actual ?? ""), confidence: 0.93 },
        sexo: { value: r.sexo ?? "", confidence: 0.96 },
        categoria: { value: r.categoria ?? "", confidence: 0.92 },
        dientes: { value: r.dientes ?? "", confidence: 0.9 },
        lote_destino: { value: r.lote_destino ?? "", confidence: 0.9 },
        observations: { value: r.observations ?? "", confidence: 0.88 },
      });

      if (preset.pages && preset.pages.length > 0) {
        cact01.startWith(
          cact01PageFromIdentifyResponse(
            {
              context: preset.pages[0].metadata,
              data: [{ mapped_rows: preset.pages[0].rows.map(fakeRow) }],
            },
            preset.pages[0].fileName,
            svgUrl,
          ),
        );

        if (preset.pages[1]) {
          const p2Svg = generateSimulationSvg(preset, 2, preset.pages.length);
          cact01.addPage(
            cact01PageFromIdentifyResponse(
              {
                context: preset.pages[1].metadata,
                data: [{ mapped_rows: preset.pages[1].rows.map(fakeRow) }],
              },
              preset.pages[1].fileName,
              p2Svg,
            ),
          );
        }
      } else {
        cact01.startWith(
          cact01PageFromIdentifyResponse(
            {
              context: preset.context,
              data: [{ mapped_rows: preset.rows.map(fakeRow) }],
            },
            `simulacion-${preset.templateCode.toLowerCase()}.svg`,
            svgUrl,
          ),
        );
      }

      // The REPAIR_ERROR preset loads a sheet built to fail. The repair screen opens by
      // itself when the real 422 comes back from confirming it, which exercises the
      // whole path instead of showing a dialog with nothing in it.
      setIsProcessed(true);
      return;
    }

    if (preset.templateCode === "LSER-01") {
      lser01.clearRepair();
      setLser01Metadata({
        ...emptyLser01Metadata(),
        ...preset.context,
      });
      setRows(
        preset.rows.map((r: any, idx: number) => ({
          id: r.id || idx + 1,
          caravana: r.caravana,
          observations: r.observations || "",
          confidence: r.confidence || 0.98,
        }))
      );
      if (preset.scenario === 'REPAIR_ERROR') {
        setIsLser01RepairOpen(true);
      }
      setIsProcessed(true);
      return;
    }

    if (preset.templateCode === "TOR-01") {
      setTor01Metadata({
        farm_name: preset.context.farm_name || "",
        renspa: preset.context.renspa || "",
        veterinarian_name: preset.context.veterinarian_name || "",
        veterinarian_license: preset.context.veterinarian_license || "",
        sample_round: preset.context.sample_round || 1,
        evaluation_date: preset.context.evaluation_date || new Date().toISOString().slice(0, 10),
      });
      setRows(preset.rows);
      setIsProcessed(true);
      return;
    }

    // Generic / ING-01 / REP-01 / REP-02 / MON-01 / OP-01 / OP-02
    setBatchName(preset.context.batch_name || preset.context.lote || `LOTE-${preset.templateCode}`);
    setActivityName(preset.context.activity_name || preset.context.service_type || "CRIA");
    setEntryDate(preset.context.entry_date || preset.context.fecha || new Date().toISOString().slice(0, 10));
    setProviderCuit(preset.context.provider_cuit || preset.context.cuit || "30-71234567-9");
    setProviderRenspa(preset.context.provider_renspa || preset.context.renspa || "02.123.4.56789/00");
    setGuiaDte(preset.context.guia_dte || "DTE-884920");
    setRows(preset.rows);
    setIsProcessed(true);
  };

  const handleSimulateDocument = (targetCode?: string, scenario: SimulationScenario = 'HAPPY_PATH') => {
    const selectedCode = targetCode || templateCode || "ING-01";
    const preset = getSimulationPreset(selectedCode, scenario);
    handleApplySimulationPreset(preset);
  };


  // Handle file selection and upload
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMessage(null);
    const objectUrl = URL.createObjectURL(selectedFile);
    setFilePreviewUrl(objectUrl);
    processDocument(selectedFile);
  };

  const processDocument = async (docFile: File) => {
    setIsUploading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("document", docFile);

    try {
      const response = await axiosInstance.post(
        "/work-templates/identify",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 210000,
        },
      );

      const resData = response.data;
      const identifiedTemplate = resData.identified_template;
      const context = resData.context || {};
      const tables = resData.data || [];

      const detectedCode = identifiedTemplate?.code || templateCode || "ING-01";
      setTemplateCode(detectedCode);
      setTemplateTitle(
        identifiedTemplate?.title ||
          (detectedCode === "TOR-01"
            ? "Revisación Andrológica de Toros"
            : detectedCode === "LSER-01"
              ? "Conformación de Lote de Servicio — Toro Único"
              : "Ingreso de Compra Directa"),
      );

      if (detectedCode === DEST01_CODE) {
        dest01Submission.clearRepair();
        setIsDest01RepairOpen(false);
        dest01.startWith(
          pageFromIdentifyResponse(resData, docFile.name, URL.createObjectURL(docFile)),
        );
      } else if (detectedCode === CACT01_CODE) {
        cact01Submission.clearRepair();
        cact01Destinations.reset();
        setIsCact01RepairOpen(false);
        cact01.startWith(
          cact01PageFromIdentifyResponse(
            resData,
            docFile.name,
            URL.createObjectURL(docFile),
          ),
        );
      } else if (detectedCode === "LSER-01") {
        lser01.clearRepair();
        setLser01Metadata({
          lote: context.lote || "",
          toro_caravana: context.toro_caravana || "",
          planned_start_date: normalizeDateForInput(context.planned_start_date),
          planned_end_date: context.planned_end_date
            ? normalizeDateForInput(context.planned_end_date)
            : "",
          responsable: context.responsable || "",
          observaciones: context.observaciones || "",
        });

        const mappedRows = tables[0]?.mapped_rows ?? [];
        setRows(
          mappedRows
            .map((r: any, idx: number) => ({
              id: idx + 1,
              caravana: String(r.caravana?.value ?? "").trim(),
              observations: r.observations?.value || "",
              confidence: r.caravana?.confidence ?? 0.95,
            }))
            .filter((r: WorkTemplateScanRow) => r.caravana !== "")
        );
      } else if (detectedCode === "TOR-01") {
        setTor01Metadata({
          farm_name:
            context.farm_name ||
            context.establishment ||
            context.establecimiento ||
            "",
          renspa: context.renspa || context.provider_renspa || "",
          veterinarian_name:
            context.veterinarian_name ||
            context.veterinarian ||
            context.veterinario ||
            "",
          veterinarian_license:
            context.veterinarian_license || context.matricula || "",
          sample_round: context.sample_round ? Number(context.sample_round) : 1,
          evaluation_date: normalizeDateForInput(
            context.evaluation_date || context.entry_date || context.fecha,
          ),
        });

        if (
          tables.length > 0 &&
          tables[0].mapped_rows &&
          tables[0].mapped_rows.length > 0
        ) {
          const mappedList: WorkTemplateScanRow[] = tables[0].mapped_rows.map(
            (r: any, idx: number) => {
              const scrapeVal = r.scrape_collected?.value;
              const scrapeTaken =
                scrapeVal === true ||
                String(scrapeVal).toUpperCase().includes("SI") ||
                String(scrapeVal).toUpperCase().includes("X") ||
                Boolean(r.scrape_tube?.value);
              const seroVal = r.serology_collected?.value;
              const seroTaken =
                seroVal === true ||
                String(seroVal).toUpperCase().includes("SI") ||
                String(seroVal).toUpperCase().includes("X") ||
                Boolean(r.serology_tube?.value);

              return {
                id: idx + 1,
                caravana: r.caravana?.value || r.identification?.value || "",
                ce_cm: r.ce_cm?.value || r.ce?.value || "",
                bcs: r.bcs?.value || r.bcs_score?.value || r.cc?.value || "",
                libido: r.libido?.value || "MEDIA",
                aplomos: r.aplomos?.value || "Correctos",
                scrape_collected: scrapeTaken,
                scrape_tube:
                  r.scrape_tube?.value ||
                  (scrapeTaken
                    ? `R-${String(idx + 1).padStart(2, "0")}`
                    : ""),
                serology_collected: seroTaken,
                serology_tube:
                  r.serology_tube?.value ||
                  (seroTaken
                    ? `S-${String(idx + 1).padStart(2, "0")}`
                    : ""),
                physical_verdict:
                  r.physical_verdict?.value || r.verdict?.value || "A",
                observations: r.observations?.value || "",
                confidence:
                  r.caravana?.confidence ??
                  r.identification?.confidence ??
                  0.95,
              };
            },
          );
          setRows(mappedList);
        } else {
          setRows([]);
        }
      } else {
        // Populate header context fields from AI-extracted metadata for ING-01
        setBatchName(
          context.lote || context.own_batch_name || context.alias || "",
        );
        setActivityName(
          context.activity || context.actividad || context.activity_name || "",
        );
        setEntryDate(normalizeDateForInput(context.entry_date || context.fecha));
        setProviderCuit(context.provider_cuit || context.cuit || "");
        setProviderRenspa(context.provider_renspa || context.renspa || "");
        setGuiaDte(
          context.guia_dte || context.dte || context.service_order_code || "",
        );

        // Parse table rows returned by AI agent based on template schema_definition.
        if (
          tables.length > 0 &&
          tables[0].mapped_rows &&
          tables[0].mapped_rows.length > 0
        ) {
          const mappedList: WorkTemplateScanRow[] = tables[0].mapped_rows.map(
            (r: any, idx: number) => ({
              id: idx + 1,
              caravana: r.identification?.value || r.caravana?.value || "",
              category: r.category?.value || "",
              sex: r.sex?.value || "M",
              breed: r.breed?.value || "",
              teeth: r.teeth?.value ?? "",
              entry_weight: r.entry_weight?.value || r.weight?.value || "",
              observations: r.observations?.value || "",
              confidence: r.identification?.confidence ?? 0.95,
            }),
          );
          setRows(mappedList);
        } else {
          setRows([]);
        }
      }

      setIsProcessed(true);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "No se pudo conectar con el microservicio AI. Verifique que el agente está en ejecución (puerto 8001).";
      console.error(
        "[WorkTemplateScan] OCR identification failed:",
        message,
        err,
      );
      setErrorMessage(message);
      setFile(null);
      setFilePreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCellChange = (
    index: number,
    field: keyof CaravanRow,
    value: any,
  ) => {
    if (templateCode === "LSER-01" && lser01.repair && rows[index]) {
      lser01.markRowEdited(rows[index], index);
    }
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddRow = () => {
    if (templateCode === "LSER-01") {
      setRows((prev) => [...prev, { id: Date.now(), caravana: "", observations: "" }]);
      return;
    }

    if (templateCode === "TOR-01") {
      const nextNum = rows.length + 1;
      setRows((prev) => [
        ...prev,
        {
          id: Date.now(),
          caravana: `TR-${String(nextNum).padStart(3, "0")}`,
          ce_cm: 35.0,
          bcs: 3.5,
          libido: "MEDIA",
          aplomos: "Correctos",
          scrape_collected: true,
          scrape_tube: `R-${String(nextNum).padStart(2, "0")}`,
          serology_collected: true,
          serology_tube: `S-${String(nextNum).padStart(2, "0")}`,
          physical_verdict: "A",
          observations: "",
          confidence: 1.0,
        },
      ]);
      return;
    }

    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        caravana: "",
        category: "",
        sex: "M",
        breed: "",
        teeth: "",
        entry_weight: "",
        observations: "",
      },
    ]);
  };

  const handleBulkScrape = () => {
    setRows((prev) =>
      prev.map((r, idx) => ({
        ...r,
        scrape_collected: true,
        scrape_tube: r.scrape_tube || `R-${String(idx + 1).padStart(2, "0")}`,
      }))
    );
  };

  const handleBulkSerology = () => {
    setRows((prev) =>
      prev.map((r, idx) => ({
        ...r,
        serology_collected: true,
        serology_tube: r.serology_tube || `S-${String(idx + 1).padStart(2, "0")}`,
      }))
    );
  };

  const handleDeleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleReset = () => {
    setFile(null);
    setFilePreviewUrl(null);
    setIsProcessed(false);
    setRows([]);
    setErrorMessage(null);
    setSaveSuccessResult(null);
    setActivityName("");
    setLser01Metadata(emptyLser01Metadata());
    setIsLser01RepairOpen(false);
    lser01.clearRepair();
    dest01.reset();
    setIsDest01RepairOpen(false);
    dest01Submission.clearRepair();
    cact01.reset();
    cact01Destinations.reset();
    setIsCact01RepairOpen(false);
    cact01Submission.clearRepair();
    setZoomLevel(1);
    setRotation(0);
    setModalZoomLevel(1);
    setModalRotation(0);
  };

  const handleOpenPreviewModal = () => {
    setModalZoomLevel(zoomLevel);
    setModalRotation(rotation);
    setIsPreviewModalOpen(true);
  };

  // Submit and Persist Transaction
  const handleSaveTransaction = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    if (templateCode === DEST01_CODE) {
      try {
        const result = await dest01Submission.submit(dest01.metadata, dest01.target, dest01.rows);
        if (result) {
          setIsDest01RepairOpen(false);
          setSaveSuccessResult(result);
          setIsSuccessDialogOpen(true);
        } else {
          // All or nothing: the load is blocked on the intermediate repair screen.
          setIsDest01RepairOpen(true);
        }
      } catch (err: any) {
        console.error("Error saving DEST-01 transaction:", err);
        setErrorMessage(
          err.response?.data?.message ||
            err.message ||
            "Error al procesar la planilla DEST-01.",
        );
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (templateCode === CACT01_CODE) {
      try {
        const result = await cact01Submission.submit(
          cact01.metadata,
          cact01.sourceBatchId,
          cact01Destinations.destinations,
          cact01.rows,
        );
        if (result) {
          setIsCact01RepairOpen(false);
          setSaveSuccessResult(result);
          setIsSuccessDialogOpen(true);
        } else {
          // All or nothing: the load is blocked on the intermediate repair screen.
          setIsCact01RepairOpen(true);
        }
      } catch (err: any) {
        console.error("Error saving CACT-01 transaction:", err);
        setErrorMessage(
          err.response?.data?.message ||
            err.message ||
            "Error al procesar la planilla CACT-01.",
        );
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (templateCode === "LSER-01") {
      try {
        const result = await lser01.submit(lser01Metadata, rows);
        if (result) {
          setIsLser01RepairOpen(false);
          setSaveSuccessResult(result);
          setIsSuccessDialogOpen(true);
        } else {
          // All or nothing: the load is blocked on the intermediate repair screen.
          setIsLser01RepairOpen(true);
        }
      } catch (err: any) {
        console.error("Error saving LSER-01 transaction:", err);
        setErrorMessage(
          err.response?.data?.message ||
            err.message ||
            "Error al procesar la planilla LSER-01.",
        );
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (templateCode === "TOR-01") {
      const payload = {
        evaluation_date:
          tor01Metadata.evaluation_date || new Date().toISOString().slice(0, 10),
        veterinarian_name: tor01Metadata.veterinarian_name || null,
        veterinarian_license: tor01Metadata.veterinarian_license || null,
        sample_round: tor01Metadata.sample_round || 1,
        rows: rows
          .filter((r) => r.caravana.trim() !== "")
          .map((r) => ({
            caravana: r.caravana.trim(),
            ce_cm:
              r.ce_cm !== "" && r.ce_cm !== null
                ? parseFloat(String(r.ce_cm))
                : null,
            bcs:
              r.bcs !== "" && r.bcs !== null
                ? parseFloat(String(r.bcs))
                : null,
            libido: r.libido ? String(r.libido).trim() : null,
            aplomos: r.aplomos ? String(r.aplomos).trim() : null,
            scrape_collected: Boolean(r.scrape_collected),
            scrape_tube: r.scrape_tube ? String(r.scrape_tube).trim() : null,
            serology_collected: Boolean(r.serology_collected),
            serology_tube: r.serology_tube ? String(r.serology_tube).trim() : null,
            physical_verdict: r.physical_verdict
              ? String(r.physical_verdict).trim()
              : "A",
            observations: r.observations ? String(r.observations).trim() : null,
          })),
      };

      try {
        const response = await axiosInstance.post(
          "/work-templates/tor-01/process",
          payload,
        );
        setSaveSuccessResult(response.data.data);
        setIsSuccessDialogOpen(true);
      } catch (err: any) {
        console.error("Error saving TOR-01 transaction:", err);
        setErrorMessage(
          err.response?.data?.message ||
            err.message ||
            "Error al persistir la planilla andrológica TOR-01.",
        );
      } finally {
        setIsSaving(false);
      }
      return;
    }

    const payload = {
      batch_name: batchName || "LOTE INGRESO",
      activity: activityName || null,
      entry_date: entryDate || new Date().toISOString().slice(0, 10),
      provider_cuit: providerCuit || null,
      provider_renspa: providerRenspa || null,
      guia_dte: guiaDte || null,
      caravans: rows
        .filter((r) => r.caravana.trim() !== "")
        .map((r) => ({
          caravana: r.caravana.trim(),
          category: r.category ? r.category.trim() : null,
          sex: r.sex ? r.sex.trim() : null,
          breed: r.breed ? r.breed.trim() : null,
          teeth:
            r.teeth !== "" && r.teeth !== null
              ? parseInt(String(r.teeth), 10)
              : null,
          entry_weight:
            r.entry_weight !== "" && r.entry_weight !== null
              ? parseFloat(String(r.entry_weight))
              : null,
          observations: r.observations ? r.observations.trim() : null,
        })),
    };

    try {
      const response = await axiosInstance.post(
        "/work-templates/ing-01/process",
        payload,
      );
      setSaveSuccessResult(response.data.data);
      setIsSuccessDialogOpen(true);
    } catch (err: any) {
      console.error("Error saving transaction:", err);
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          "Error al persistir la transacción.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ViewLayout
      title="Escanear y Procesar Planilla de Campo"
      subtitle="Carga una fotografía o escaneo de la planilla para extracción automática con AI y persistencia transaccional."
      backUrl="/work-templates"
      backTitle="Lista de Plantillas"
      actions={
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          flexWrap="wrap"
        >
          {/* URL Template Selector Dropdown */}
          <Select
            value={templateCode}
            onChange={(e) => handleTemplateChange(e.target.value)}
            size="small"
            sx={{
              fontWeight: 800,
              borderRadius: "6px",
              minWidth: 190,
              height: 36,
              bgcolor: "background.paper",
            }}
          >
            <MenuItem value="ING-01">ING-01 • Compra Directa</MenuItem>
            <MenuItem value="TOR-01">TOR-01 • Revisación Andrológica & Manga</MenuItem>
            <MenuItem value="LSER-01">LSER-01 • Conformación de Lote de Servicio</MenuItem>
            <MenuItem value="DEST-01">DEST-01 • Destete y Lote de Destete</MenuItem>
            <MenuItem value="CACT-01">CACT-01 • Cambio de Actividad</MenuItem>
            <MenuItem value="REP-01">REP-01 • Tacto & Ecografía</MenuItem>
            <MenuItem value="REP-02">REP-02 • Parición</MenuItem>
            <MenuItem value="MON-01">MON-01 • Servicio de Monta a Campo</MenuItem>
            <MenuItem value="OP-01">OP-01 • Control Mensual</MenuItem>
            <MenuItem value="OP-02">OP-02 • Invernada</MenuItem>
          </Select>

          {/* Simulation Center Trigger */}
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setIsSimulationModalOpen(true)}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              borderRadius: "6px",
              boxShadow: "none",
            }}
          >
            ⚡ Centro de Simulaciones
          </Button>

          {!isProcessed ? null : (

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={
                  validationResult.isValid
                    ? `🟢 Validado (${validationResult.validRowsCount})`
                    : `🔴 ${validationResult.errors.length} Error(es)`
                }
                color={validationResult.isValid ? "success" : "error"}
                variant={validationResult.isValid ? "outlined" : "filled"}
                sx={{ fontWeight: 800, borderRadius: "6px" }}
              />
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "6px",
                }}
              >
                Limpiar
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={
                  isSaving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                disabled={isSaving || !validationResult.isValid}
                onClick={handleSaveTransaction}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  px: 2.5,
                  borderRadius: "6px",
                }}
              >
                {isSaving
                  ? "Guardando..."
                  : templateCode === DEST01_CODE
                    ? `Confirmar Destete (${validationResult.validRowsCount})`
                    : templateCode === CACT01_CODE
                      ? `Confirmar Movimiento (${validationResult.validRowsCount})`
                      : `Confirmar Tropa (${rows.length})`}
              </Button>
            </Stack>
          )}
        </Stack>
      }
    >
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          width: "100%",
          maxWidth: "1800px",
          mx: "auto",
        }}
      >
        {/* Validation Issues Alert Banner */}
        {isProcessed &&
          (!validationResult.isValid ||
            validationResult.warnings.length > 0) && (
            <Box sx={{ mb: 3 }}>
              {validationResult.errors.map((err, i) => (
                <Alert
                  key={`err-${i}`}
                  severity="error"
                  sx={{ mb: 1, borderRadius: "6px" }}
                >
                  <strong>Validación de Plantilla ({templateCode}):</strong>{" "}
                  {err}
                </Alert>
              ))}
              {validationResult.warnings.map((warn, i) => (
                <Alert
                  key={`warn-${i}`}
                  severity="warning"
                  sx={{ mb: 1, borderRadius: "6px" }}
                >
                  <strong>Advertencia ({templateCode}):</strong> {warn}
                </Alert>
              ))}
            </Box>
          )}

        {errorMessage && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: "6px",
              "& .MuiAlert-message": { width: "100%" },
            }}
            onClose={() => setErrorMessage(null)}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, mb: 0.5 }}>
                El análisis de la imagen falló
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "inherit", opacity: 0.85 }}
              >
                {errorMessage}
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 1, opacity: 0.7 }}
              >
                Asegúrese de que el microservicio <strong>ai-agent</strong> esté
                corriendo en el puerto 8001 antes de cargar la planilla. Puede
                reiniciarlo con: <code>uvicorn app.main:app --port 8001</code>
              </Typography>
            </Box>
          </Alert>
        )}

        {/* ─── STAGE 1: UPLOAD DROPZONE (SAP Fiori Standard) ─── */}
        {!isProcessed && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 8 },
              borderRadius: "8px",
              border: "2px dashed",
              borderColor: isDark ? "rgba(255,255,255,0.15)" : "#cbd5e1",
              bgcolor: "background.paper",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            {isUploading ? (
              <Box
                sx={{
                  py: 6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <CircularProgress size={56} sx={{ color: "#6366f1" }} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Analizando Planilla con AI Agent...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Extrayendo código de plantilla, metadatos de lote y
                  tipificación de caravanas...
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  py: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    border: "1px solid",
                    borderColor: "primary.main",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                    bgcolor: "action.hover",
                  }}
                >
                  <CloudUploadIcon
                    sx={{ fontSize: 40, color: "primary.main" }}
                  />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Sube la Planilla de Campo Escaneada o Fotografía
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxWidth: 500 }}
                >
                  Formatos soportados: PNG, JPG, JPEG, WEBP o PDF. El sistema
                  detectará automáticamente la plantilla ING-01 y extraerá las
                  caravanas registradas.
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mt: 2 }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      px: 4,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 800,
                      borderRadius: "6px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Seleccionar Documento Real
                  </Button>

                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<AutoAwesomeIcon />}
                    sx={{
                      px: 3,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 800,
                      borderRadius: "6px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSimulationModalOpen(true);
                    }}
                  >
                    ⚡ Centro de Simulaciones (Probar Flujos sin AI)
                  </Button>

                  <Button
                    variant="outlined"
                    color="secondary"
                    sx={{
                      px: 2.5,
                      py: 1.2,
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "6px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSimulateDocument(templateCode);
                    }}
                  >
                    Simulación Rápida ({templateCode})
                  </Button>

                </Stack>
              </Box>
            )}
          </Paper>
        )}

        {/* ─── STAGE 2: INTERACTIVE WORKBENCH (SAP Fiori Standard Layout) ─── */}
        {isProcessed && (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              gap: 3,
              alignItems: "flex-start",
            }}
          >
            {/* Left Column: Document Image Preview Panel */}
            {showPreview && filePreviewUrl && (
              <ScanPreviewSidePanel
                previewUrl={filePreviewUrl}
                zoomLevel={zoomLevel}
                rotation={rotation}
                onZoomIn={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                onZoomOut={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                onRotate={() => setRotation((r) => (r + 90) % 360)}
                onOpenModal={handleOpenPreviewModal}
                onHide={() => setShowPreview(false)}
              />
            )}

            {/* Toggle Preview Button if hidden */}
            {!showPreview && filePreviewUrl && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => setShowPreview(true)}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  mb: 2,
                  borderRadius: "6px",
                }}
              >
                Ver Documento Escaneado
              </Button>
            )}

            {/* Right Column: Unified Fiori Workbench (Metadata Header + Filter Bar + Pedigree DataTable) */}
            <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                  bgcolor: "background.paper",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                {/* SECTION 1: Integrated Collapsible Header Metadata Bar */}
                {templateCode === DEST01_CODE ? (
                  <ScanDest01Workspace
                    state={dest01}
                    repair={dest01Submission.repair}
                    isRepairOpen={isDest01RepairOpen}
                    onOpenRepair={() => setIsDest01RepairOpen(true)}
                    onRowChange={handleDest01RowChange}
                    onPreviewPage={setFilePreviewUrl}
                    isSaving={isSaving}
                  />
                ) : templateCode === CACT01_CODE ? (
                  <ScanCact01Workspace
                    state={cact01}
                    destinationsState={cact01Destinations}
                    batches={cact01Options.batches}
                    activities={cact01Options.activities}
                    batchTypes={cact01Options.batchTypes}
                    sourceBatchOptions={cact01Options.sourceBatchOptions}
                    sourceMatched={cact01Source.matched}
                    repair={cact01Submission.repair}
                    isRepairOpen={isCact01RepairOpen}
                    onOpenRepair={() => setIsCact01RepairOpen(true)}
                    onRowChange={handleCact01RowChange}
                    onPreviewPage={setFilePreviewUrl}
                    isSaving={isSaving}
                  />
                ) : templateCode === "LSER-01" ? (
                  <ScanLser01MetadataHeader
                    metadata={lser01Metadata}
                    onChange={handleLser01MetadataChange}
                    isOpen={isLser01MetadataOpen}
                    onToggle={() => setIsLser01MetadataOpen((prev) => !prev)}
                    headerErrors={lser01.repair?.headerErrors}
                  />
                ) : templateCode === "TOR-01" ? (
                  <ScanTor01MetadataHeader
                    metadata={tor01Metadata}
                    onChange={handleTor01MetadataChange}
                    isOpen={isTor01MetadataOpen}
                    onToggle={() => setIsTor01MetadataOpen((prev) => !prev)}
                  />
                ) : (
                  <Box
                    sx={{
                      p: 2,
                    borderBottom: "1px solid",
                    borderColor: isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "#e2e8f0",
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "#fcfcfd",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    onClick={() => setIsMetadataOpen((prev) => !prev)}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <Box
                        sx={{
                          pl: 1.5,
                          borderLeft: (theme) =>
                            `3px solid ${theme.palette.primary.main}`,
                        }}
                      >
                        <Typography
                          variant="overline"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 700,
                            letterSpacing: 1,
                          }}
                        >
                          Encabezado de Lote y Parámetros
                        </Typography>
                      </Box>

                      <Chip
                        size="small"
                        label={
                          batchName
                            ? `Lote: ${batchName}`
                            : "Sin Nombre de Lote"
                        }
                        color={batchName ? "primary" : "default"}
                        variant="outlined"
                        sx={{
                          fontWeight: 700,
                          height: 24,
                          fontSize: "0.75rem",
                          borderRadius: "4px",
                        }}
                      />

                      {activityName && (
                        <Chip
                          size="small"
                          label={`Actividad: ${activityName}`}
                          color="info"
                          variant="outlined"
                          sx={{
                            fontWeight: 700,
                            height: 24,
                            fontSize: "0.75rem",
                            borderRadius: "4px",
                          }}
                        />
                      )}

                      {entryDate && (
                        <Chip
                          size="small"
                          label={`Fecha: ${entryDate}`}
                          variant="outlined"
                          sx={{
                            fontWeight: 600,
                            height: 24,
                            fontSize: "0.75rem",
                            borderRadius: "4px",
                          }}
                        />
                      )}
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        {isMetadataOpen
                          ? "Ocultar Encabezado"
                          : "Editar Encabezado"}
                      </Typography>
                      <IconButton size="small">
                        {isMetadataOpen ? (
                          <ExpandLessIcon fontSize="small" />
                        ) : (
                          <ExpandMoreIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Stack>
                  </Box>

                  {/* Collapsible Metadata Form Grid */}
                  <Collapse in={isMetadataOpen}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, 1fr)",
                          md: "repeat(3, 1fr)",
                        },
                        gap: 2,
                        mt: 2,
                        pt: 1.5,
                        borderTop: "1px dashed",
                        borderColor: isDark
                          ? "rgba(255, 255, 255, 0.06)"
                          : "#f1f5f9",
                      }}
                    >
                      <TextField
                        label="Nombre de Lote Destino"
                        variant="filled"
                        value={batchName}
                        onChange={(e) => setBatchName(e.target.value)}
                        size="small"
                        required
                        fullWidth
                        InputProps={{
                          sx: { fontWeight: 700, borderRadius: "6px" },
                        }}
                      />
                      <Autocomplete
                        freeSolo
                        options={activities.map((a: any) => a.name)}
                        value={activityName}
                        onChange={(_, newValue) =>
                          setActivityName(newValue || "")
                        }
                        onInputChange={(_, newInputValue) =>
                          setActivityName(newInputValue || "")
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Actividad Destino (Lote)"
                            variant="filled"
                            size="small"
                            fullWidth
                            placeholder="Ej: Cría, Recría, Invernada"
                            helperText={
                              activities.length > 0
                                ? `Disponibles: ${activities.map((a: any) => a.name).join(", ")}`
                                : ""
                            }
                            InputProps={{
                              ...params.InputProps,
                              sx: { fontWeight: 600, borderRadius: "6px" },
                            }}
                          />
                        )}
                      />
                      <TextField
                        label="Fecha de Ingreso"
                        variant="filled"
                        type="date"
                        value={entryDate}
                        onChange={(e) => setEntryDate(e.target.value)}
                        size="small"
                        required
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        InputProps={{ sx: { borderRadius: "6px" } }}
                      />
                      <TextField
                        label="CUIT Proveedor"
                        variant="filled"
                        value={providerCuit}
                        onChange={(e) => setProviderCuit(e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="30-12345678-9"
                        InputProps={{ sx: { borderRadius: "6px" } }}
                      />
                      <TextField
                        label="RENSPA Origen"
                        variant="filled"
                        value={providerRenspa}
                        onChange={(e) => setProviderRenspa(e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="02.123.4.56789/00"
                        helperText={
                          !providerRenspa && activeCompany?.renspa
                            ? `Hereda: ${activeCompany.renspa}`
                            : ""
                        }
                        InputProps={{ sx: { borderRadius: "6px" } }}
                      />
                      <TextField
                        label="Guía DTe / Remito"
                        variant="filled"
                        value={guiaDte}
                        onChange={(e) => setGuiaDte(e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="DTE-99214"
                        InputProps={{ sx: { borderRadius: "6px" } }}
                      />
                    </Box>
                  </Collapse>
                </Box>
                )}

                {/* SECTION 2: DataTable Section (Filter Bar + Table + Pagination) */}
                {templateCode === DEST01_CODE ||
                templateCode === CACT01_CODE ? null : templateCode === "LSER-01" ? (
                  <Box sx={{ p: 2 }}>
                    {lser01.repair && !isLser01RepairOpen && (
                      <Alert
                        severity="error"
                        sx={{ mb: 2, borderRadius: "6px" }}
                        action={
                          <Button color="inherit" size="small" onClick={() => setIsLser01RepairOpen(true)}>
                            Abrir reparación
                          </Button>
                        }
                      >
                        La carga está bloqueada hasta reparar la planilla.
                      </Alert>
                    )}
                    <ScanLser01Table
                      rows={rows}
                      onRowChange={handleCellChange}
                      onAddRow={handleAddRow}
                      onDeleteRow={handleDeleteRow}
                      rowErrorsById={lser01.repair?.rowErrorsById}
                      editedRowIds={lser01.repair?.editedRowIds}
                      rowKey={lser01.rowKey}
                    />
                  </Box>
                ) : templateCode === "TOR-01" ? (
                  <Box sx={{ p: 2 }}>
                    <ScanTor01Table
                      rows={rows}
                      onRowChange={handleCellChange}
                      onAddRow={handleAddRow}
                      onDeleteRow={handleDeleteRow}
                      onBulkScrape={handleBulkScrape}
                      onBulkSerology={handleBulkSerology}
                    />
                  </Box>
                ) : (
                  <Box sx={{ p: 2.5 }}>
                  {/* SAP Fiori Section Header */}
                  <Box
                    sx={{
                      mb: 2,
                      pl: 1.5,
                      borderLeft: (theme) =>
                        `3px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 700,
                        letterSpacing: 1,
                      }}
                    >
                      Animales Detectados en la Planilla ({rows.length})
                    </Typography>
                  </Box>

                  {/* Filter & Action Toolbar (PedigreeFilterBar Pattern) */}
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", md: "center" }}
                    spacing={1.5}
                    sx={{ mb: 2 }}
                  >
                    {/* Search Input */}
                    <TextField
                      size="small"
                      placeholder="Buscar por caravana, categoría, raza u observaciones..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(0);
                      }}
                      sx={{
                        flexGrow: 1,
                        maxWidth: { md: 380 },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FuseSvgIcon size={18} color="action">
                              heroicons-outline:magnifying-glass
                            </FuseSvgIcon>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Segmented Filter Control & Add Row */}
                    <Stack
                      direction="row"
                      spacing={1.5}
                      flexWrap="wrap"
                      useFlexGap
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.25,
                          p: 0.25,
                          borderRadius: "8px",
                          border: "1px solid",
                          borderColor: isDark
                            ? "rgba(255, 255, 255, 0.08)"
                            : "#e2e8f0",
                          bgcolor: isDark
                            ? "rgba(255, 255, 255, 0.04)"
                            : "#f8fafc",
                        }}
                      >
                        {[
                          { id: "ALL", label: `Todos (${rows.length})` },
                          { id: "VALID", label: "Validados" },
                          { id: "WARNINGS", label: "Con Advertencias" },
                        ].map((item) => {
                          const isSelected = tableFilter === item.id;
                          const activeColor = isDark ? "#60a5fa" : "#0a6ed1";
                          return (
                            <Button
                              key={item.id}
                              size="small"
                              onClick={() => {
                                setTableFilter(item.id as any);
                                setPage(0);
                              }}
                              sx={{
                                minWidth: 0,
                                px: 1.25,
                                height: 26,
                                borderRadius: "6px",
                                fontSize: "0.72rem",
                                fontWeight: isSelected ? 600 : 500,
                                textTransform: "none",
                                color: isSelected
                                  ? activeColor
                                  : isDark
                                    ? "#94a3b8"
                                    : "#64748b",
                                bgcolor: isSelected
                                  ? alpha(activeColor, 0.12)
                                  : "transparent",
                                "&:hover": {
                                  bgcolor: isSelected
                                    ? alpha(activeColor, 0.16)
                                    : isDark
                                      ? "rgba(255, 255, 255, 0.07)"
                                      : "#edf1f5",
                                },
                              }}
                            >
                              {item.label}
                            </Button>
                          );
                        })}
                      </Box>

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleAddRow}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: "6px",
                        }}
                      >
                        Agregar Fila
                      </Button>
                    </Stack>
                  </Stack>

                  {/* Table Container */}
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "#e2e8f0",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <Table
                      size="small"
                      stickyHeader
                      sx={{ minWidth: 950, borderCollapse: "collapse" }}
                    >
                      <TableHead>
                        <TableRow sx={{ bgcolor: headerBg }}>
                          <TableCell
                            sx={{
                              ...headerCellStyle,
                              width: 45,
                              textAlign: "center",
                            }}
                          >
                            #
                          </TableCell>
                          <TableCell sx={{ ...headerCellStyle, width: 170 }}>
                            CARAVANA / TAG *
                          </TableCell>
                          <TableCell sx={{ ...headerCellStyle, width: 200 }}>
                            CATEGORÍA
                          </TableCell>
                          <TableCell
                            sx={{
                              ...headerCellStyle,
                              width: 90,
                              textAlign: "center",
                            }}
                          >
                            SEXO
                          </TableCell>
                          <TableCell sx={{ ...headerCellStyle, width: 150 }}>
                            RAZA
                          </TableCell>
                          <TableCell
                            sx={{
                              ...headerCellStyle,
                              width: 85,
                              textAlign: "center",
                            }}
                          >
                            DIENTES
                          </TableCell>
                          <TableCell
                            sx={{
                              ...headerCellStyle,
                              width: 110,
                              textAlign: "right",
                            }}
                          >
                            PESO (KG)
                          </TableCell>
                          <TableCell sx={{ ...headerCellStyle }}>
                            OBSERVACIONES
                          </TableCell>
                          <TableCell
                            sx={{
                              ...headerCellStyle,
                              width: 45,
                              borderRight: 0,
                            }}
                          ></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedRows.map((row, index) => {
                          const globalIndex = page * rowsPerPage + index;
                          const isZebra = globalIndex % 2 !== 0;
                          return (
                            <TableRow
                              key={row.id || index}
                              hover
                              sx={{
                                bgcolor: isZebra ? zebraBg : "background.paper",
                                "&:hover": {
                                  bgcolor: isDark
                                    ? "rgba(255, 255, 255, 0.04)"
                                    : "#f1f5f9",
                                },
                                "& td": {
                                  borderBottom: "1px solid",
                                  borderRight: "1px solid",
                                  borderColor: isDark
                                    ? "rgba(255, 255, 255, 0.06)"
                                    : "#e2e8f0",
                                  py: 0.75,
                                  px: 1,
                                },
                              }}
                            >
                              {/* Row Index */}
                              <TableCell
                                sx={{
                                  textAlign: "center",
                                  fontWeight: 700,
                                  fontSize: "0.75rem",
                                  color: "text.secondary",
                                }}
                              >
                                {globalIndex + 1}
                              </TableCell>

                              {/* Caravana / Tag Editable Cell */}
                              <TableCell>
                                <TextField
                                  value={row.caravana}
                                  onChange={(e) =>
                                    handleCellChange(
                                      globalIndex,
                                      "caravana",
                                      e.target.value.toUpperCase(),
                                    )
                                  }
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  placeholder="TAG-0001"
                                  InputProps={{
                                    sx: {
                                      fontWeight: 800,
                                      fontFamily: "monospace",
                                      fontSize: "0.85rem",
                                      borderRadius: "4px",
                                      bgcolor: "background.paper",
                                    },
                                  }}
                                />
                              </TableCell>

                              {/* Categoría Autocomplete / Select Editable Cell */}
                              <TableCell>
                                <Autocomplete
                                  freeSolo
                                  options={COMMON_CATEGORIES}
                                  value={row.category || ""}
                                  onInputChange={(_, newValue) =>
                                    handleCellChange(
                                      globalIndex,
                                      "category",
                                      newValue,
                                    )
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      variant="outlined"
                                      size="small"
                                      placeholder="Categoría"
                                      InputProps={{
                                        ...params.InputProps,
                                        sx: {
                                          fontSize: "0.8rem",
                                          fontWeight: 600,
                                          borderRadius: "4px",
                                          bgcolor: "background.paper",
                                        },
                                      }}
                                    />
                                  )}
                                />
                              </TableCell>

                              {/* Sexo Select Editable Cell */}
                              <TableCell sx={{ textAlign: "center" }}>
                                <Select
                                  value={
                                    row.sex === "H" || row.sex === "Hembra"
                                      ? "H"
                                      : "M"
                                  }
                                  onChange={(e) =>
                                    handleCellChange(
                                      globalIndex,
                                      "sex",
                                      e.target.value,
                                    )
                                  }
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  sx={{
                                    fontSize: "0.8rem",
                                    fontWeight: 800,
                                    textAlign: "center",
                                    borderRadius: "4px",
                                    bgcolor: "background.paper",
                                  }}
                                >
                                  <MenuItem value="M">M (Macho)</MenuItem>
                                  <MenuItem value="H">H (Hembra)</MenuItem>
                                </Select>
                              </TableCell>

                              {/* Raza Autocomplete Editable Cell */}
                              <TableCell>
                                <Autocomplete
                                  freeSolo
                                  options={COMMON_BREEDS}
                                  value={row.breed || ""}
                                  onInputChange={(_, newValue) =>
                                    handleCellChange(
                                      globalIndex,
                                      "breed",
                                      newValue,
                                    )
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      variant="outlined"
                                      size="small"
                                      placeholder="Raza"
                                      InputProps={{
                                        ...params.InputProps,
                                        sx: {
                                          fontSize: "0.8rem",
                                          borderRadius: "4px",
                                          bgcolor: "background.paper",
                                        },
                                      }}
                                    />
                                  )}
                                />
                              </TableCell>

                              {/* Dientes Editable Cell */}
                              <TableCell sx={{ textAlign: "center" }}>
                                <TextField
                                  value={row.teeth}
                                  type="number"
                                  onChange={(e) =>
                                    handleCellChange(
                                      globalIndex,
                                      "teeth",
                                      e.target.value,
                                    )
                                  }
                                  variant="outlined"
                                  size="small"
                                  placeholder="0"
                                  InputProps={{
                                    sx: {
                                      textAlign: "center",
                                      fontSize: "0.8rem",
                                      borderRadius: "4px",
                                      bgcolor: "background.paper",
                                    },
                                  }}
                                />
                              </TableCell>

                              {/* Peso de Ingreso Editable Cell */}
                              <TableCell sx={{ textAlign: "right" }}>
                                <TextField
                                  value={row.entry_weight}
                                  type="number"
                                  onChange={(e) =>
                                    handleCellChange(
                                      globalIndex,
                                      "entry_weight",
                                      e.target.value,
                                    )
                                  }
                                  variant="outlined"
                                  size="small"
                                  placeholder="0.0"
                                  InputProps={{
                                    sx: {
                                      textAlign: "right",
                                      fontWeight: 700,
                                      fontSize: "0.8rem",
                                      borderRadius: "4px",
                                      bgcolor: "background.paper",
                                    },
                                  }}
                                />
                              </TableCell>

                              {/* Observaciones Editable Cell */}
                              <TableCell>
                                <TextField
                                  value={row.observations}
                                  onChange={(e) =>
                                    handleCellChange(
                                      globalIndex,
                                      "observations",
                                      e.target.value,
                                    )
                                  }
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  placeholder="Notas u observaciones"
                                  InputProps={{
                                    sx: {
                                      fontSize: "0.75rem",
                                      borderRadius: "4px",
                                      bgcolor: "background.paper",
                                    },
                                  }}
                                />
                              </TableCell>

                              {/* Delete Row Button */}
                              <TableCell sx={{ borderRight: 0 }}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteRow(globalIndex)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {filteredRows.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={9}
                              sx={{
                                py: 6,
                                textAlign: "center",
                                color: "text.secondary",
                              }}
                            >
                              <Box
                                sx={{
                                  mb: 1,
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <FuseSvgIcon size={36} color="disabled">
                                  heroicons-outline:magnifying-glass
                                </FuseSvgIcon>
                              </Box>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700 }}
                              >
                                No se encontraron animales con los filtros
                                seleccionados
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Intente cambiar el término de búsqueda o haga
                                clic en "Agregar Fila".
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>

                  {/* Table Pagination (Gestation Pedigree Standard) */}
                  <TablePagination
                    rowsPerPageOptions={[10, 15, 25, 50]}
                    component="div"
                    count={filteredRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
                    }
                    sx={{
                      borderTop: 1,
                      borderColor: "divider",
                      bgcolor: isDark ? "rgba(255, 255, 255, 0.01)" : "#fafafa",
                    }}
                  />
                </Box>
                )}
              </Paper>
            </Box>
          </Box>
        )}

        {/* ─── FULL-SCREEN / HIGH-RES DOCUMENT PREVIEW MODAL ─── */}
        <ScanDocumentPreviewModal
          open={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          previewUrl={filePreviewUrl}
          zoomLevel={modalZoomLevel}
          rotation={modalRotation}
          onZoomIn={() => setModalZoomLevel((z) => Math.min(z + 0.25, 3.5))}
          onZoomOut={() => setModalZoomLevel((z) => Math.max(z - 0.25, 0.5))}
          onRotate={() => setModalRotation((r) => (r + 90) % 360)}
          onReset={() => {
            setModalZoomLevel(1);
            setModalRotation(0);
          }}
        />

        {/* ─── SIMULATION SELECTOR MODAL ─── */}
        <SimulationSelectorModal
          open={isSimulationModalOpen}
          onClose={() => setIsSimulationModalOpen(false)}
          currentTemplateCode={templateCode}
          onSelectPreset={handleApplySimulationPreset}
        />

        {/* ─── LSER-01 REPAIR SCREEN (all or nothing) ─── */}
        <Lser01RepairDialog
          open={templateCode === "LSER-01" && isLser01RepairOpen}
          repair={lser01.repair}
          metadata={lser01Metadata}
          onMetadataChange={handleLser01MetadataChange}
          rows={rows}
          onRowChange={handleCellChange}
          onDeleteRow={handleDeleteRow}
          rowKey={lser01.rowKey}
          isSaving={isSaving}
          onRetry={handleSaveTransaction}
          onBack={() => setIsLser01RepairOpen(false)}
        />

        {/* ─── DEST-01 REPAIR SCREEN (all or nothing, every page) ─── */}
        <Cact01RepairDialog
          open={templateCode === CACT01_CODE && isCact01RepairOpen}
          repair={cact01Submission.repair}
          state={cact01}
          destinationsState={cact01Destinations}
          batches={cact01Options.batches}
          activities={cact01Options.activities}
          batchTypes={cact01Options.batchTypes}
          sourceBatchOptions={cact01Options.sourceBatchOptions}
          sourceMatched={cact01Source.matched}
          onRowChange={handleCact01RowChange}
          isSaving={isSaving}
          onRetry={handleSaveTransaction}
          onBack={() => setIsCact01RepairOpen(false)}
        />

        <Dest01RepairDialog
          open={templateCode === DEST01_CODE && isDest01RepairOpen}
          repair={dest01Submission.repair}
          state={dest01}
          onRowChange={handleDest01RowChange}
          isSaving={isSaving}
          onRetry={handleSaveTransaction}
          onBack={() => setIsDest01RepairOpen(false)}
        />

        {/* ─── SUCCESS MODAL (ScanSuccessDialog Component) ─── */}
        <ScanSuccessDialog
          open={isSuccessDialogOpen}
          onClose={() => setIsSuccessDialogOpen(false)}
          onReset={handleReset}
          templateCode={templateCode}
          result={saveSuccessResult}
        />
      </Box>
    </ViewLayout>
  );
};

export default WorkTemplateScanView;
