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
} from "../components/scan";

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

const SIMULATED_DOCUMENT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100" style="background:#FAF8F5;font-family:sans-serif;">
  <rect width="800" height="1100" fill="#FAF8F5"/>
  <rect x="30" y="30" width="740" height="1040" fill="none" stroke="#0E3D26" stroke-width="3"/>
  <text x="60" y="80" font-size="22" font-weight="bold" fill="#0E3D26">PLANILLA DE CAMPO - RODEOS DE CRIA (ING-01)</text>
  <text x="60" y="110" font-size="14" fill="#555">ESTABLECIMIENTO: EL OMBU | ACTIVIDAD: CRIA | FECHA: 2026-08-29</text>
  <line x1="60" y1="130" x2="740" y2="130" stroke="#0E3D26" stroke-width="2"/>
  <text x="60" y="160" font-size="14" font-weight="bold" fill="#333">PROVEEDOR: ESTANCIA LAS LILAS | CUIT: 30-71234567-9</text>
  <text x="60" y="185" font-size="14" font-weight="bold" fill="#333">RENSPA: 02.123.4.56789/00 | GUIA DTE: DTE-884920</text>
  <line x1="60" y1="205" x2="740" y2="205" stroke="#ccc" stroke-width="1"/>
  <rect x="60" y="220" width="680" height="35" fill="#0E3D26"/>
  <text x="75" y="243" font-size="13" font-weight="bold" fill="#FFF">#</text>
  <text x="110" y="243" font-size="13" font-weight="bold" fill="#FFF">CARAVANA / TAG</text>
  <text x="280" y="243" font-size="13" font-weight="bold" fill="#FFF">CATEGORIA</text>
  <text x="430" y="243" font-size="13" font-weight="bold" fill="#FFF">SEXO</text>
  <text x="485" y="243" font-size="13" font-weight="bold" fill="#FFF">RAZA</text>
  <text x="565" y="243" font-size="13" font-weight="bold" fill="#FFF">DIENTES</text>
  <text x="645" y="243" font-size="13" font-weight="bold" fill="#FFF">PESO (KG)</text>
  <g font-size="13" fill="#222" font-weight="500">
    <text x="75" y="285">1</text><text x="110" y="285">caravana-test-1</text><text x="280" y="285">Vaca de Cría</text><text x="430" y="285">H</text><text x="485" y="285">Angus</text><text x="565" y="285">6</text><text x="645" y="285">430.0</text>
    <text x="75" y="325">2</text><text x="110" y="325">caravana-test-2</text><text x="280" y="325">Vaca de Cría</text><text x="430" y="325">H</text><text x="485" y="325">Angus Negro</text><text x="565" y="325">4</text><text x="645" y="325">415.0</text>
    <text x="75" y="365">3</text><text x="110" y="365">caravana-test-3</text><text x="280" y="365">Ternero</text><text x="430" y="365">M</text><text x="485" y="365">Brangus</text><text x="565" y="365">0</text><text x="645" y="365">160.0</text>
    <text x="75" y="405">4</text><text x="110" y="405">caravana-test-4</text><text x="280" y="405">Ternera</text><text x="430" y="405">H</text><text x="485" y="405">Hereford</text><text x="565" y="405">0</text><text x="645" y="405">152.0</text>
    <text x="75" y="445">5</text><text x="110" y="445">caravana-test-5</text><text x="280" y="445">Vaquillona Rep.</text><text x="430" y="445">H</text><text x="485" y="445">Angus</text><text x="565" y="445">2</text><text x="645" y="445">285.0</text>
    <text x="75" y="485">6</text><text x="110" y="485">caravana-test-6</text><text x="280" y="485">Vaquillona</text><text x="430" y="485">H</text><text x="485" y="485">Braford</text><text x="565" y="485">2</text><text x="645" y="485">290.0</text>
    <text x="75" y="525">7</text><text x="110" y="525">caravana-test-7</text><text x="280" y="525">Toro</text><text x="430" y="525">M</text><text x="485" y="525">Angus Col.</text><text x="565" y="525">8</text><text x="645" y="525">680.0</text>
    <text x="75" y="565">8</text><text x="110" y="565">caravana-test-8</text><text x="280" y="565">Toro</text><text x="430" y="565">M</text><text x="485" y="565">Brangus</text><text x="565" y="565">6</text><text x="645" y="565">640.0</text>
  </g>
  <rect x="60" y="900" width="680" height="100" fill="#EAE6DF" stroke="#ccc"/>
  <text x="80" y="930" font-size="14" font-weight="bold" fill="#333">OBSERVACIONES DE RODEOS DE CRIA:</text>
  <text x="80" y="960" font-size="13" fill="#555">Rodeo de cría inspeccionado. Vientres con sanidad al día y terneros al pie.</text>
</svg>
`)}`;

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
  }, [templateCode, batchName, rows]);

  // Load Mock Simulation Data (Fast Design Mode - No Microservice Call)
  const handleSimulateDocument = (targetCode?: string) => {
    const selectedCode = targetCode || templateCode || "ING-01";
    setSearchParams({ template: selectedCode }, { replace: true });
    setFile(null);
    setFilePreviewUrl(SIMULATED_DOCUMENT_SVG);
    setErrorMessage(null);

    setTemplateCode(selectedCode);

    if (selectedCode === "TOR-01") {
      setTemplateTitle("Revisación Andrológica y Muestreo en Manga (Simulación)");
      setTor01Metadata({
        farm_name: "Establecimiento La Juanita",
        renspa: "02.001.0.00001/01",
        veterinarian_name: "Dr. Esteban Rossi",
        veterinarian_license: "MP: 4892-BA",
        sample_round: 1,
        evaluation_date: new Date().toISOString().slice(0, 10),
      });

      setRows([
        { id: 1, caravana: "TR-001", ce_cm: 37.5, bcs: 3.5, libido: "ALTA", aplomos: "Correctos", scrape_collected: true, scrape_tube: "R-01", serology_collected: true, serology_tube: "S-01", physical_verdict: "A", observations: "Excelente conformación", confidence: 0.99 },
        { id: 2, caravana: "TR-002", ce_cm: 35.0, bcs: 3.0, libido: "M", aplomos: "Buenos", scrape_collected: true, scrape_tube: "R-02", serology_collected: true, serology_tube: "S-02", physical_verdict: "A", observations: "Rodeo general", confidence: 0.98 },
        { id: 3, caravana: "TR-003", ce_cm: 36.0, bcs: 3.5, libido: "MEDIA", aplomos: "Correctos", scrape_collected: true, scrape_tube: "R-03", serology_collected: true, serology_tube: "S-03", physical_verdict: "A", observations: "Buen prepucio", confidence: 0.97 },
        { id: 4, caravana: "TR-004", ce_cm: 34.5, bcs: 3.0, libido: "M", aplomos: "Correctos", scrape_collected: true, scrape_tube: "R-04", serology_collected: true, serology_tube: "S-04", physical_verdict: "A", observations: "Sin novedades", confidence: 0.96 },
        { id: 5, caravana: "TR-005", ce_cm: 38.0, bcs: 4.0, libido: "ALTA", aplomos: "Correctos", scrape_collected: true, scrape_tube: "R-05", serology_collected: true, serology_tube: "S-05", physical_verdict: "A", observations: "Toro padre de cabaña", confidence: 0.99 },
        { id: 6, caravana: "TR-006", ce_cm: 33.5, bcs: 3.0, libido: "M", aplomos: "Buenos", scrape_collected: true, scrape_tube: "R-06", serology_collected: true, serology_tube: "S-06", physical_verdict: "A", observations: "Torito 2 años", confidence: 0.95 },
        { id: 7, caravana: "TR-007", ce_cm: 35.5, bcs: 3.5, libido: "A", aplomos: "Correctos", scrape_collected: true, scrape_tube: "R-07", serology_collected: true, serology_tube: "S-07", physical_verdict: "A", observations: "Testículos simétricos", confidence: 0.98 },
        { id: 8, caravana: "TR-008", ce_cm: 36.0, bcs: 3.5, libido: "MEDIA", aplomos: "Correctos", scrape_collected: true, scrape_tube: "R-08", serology_collected: true, serology_tube: "S-08", physical_verdict: "A", observations: "Destino entore 1", confidence: 0.97 },
        { id: 9, caravana: "TR-009", ce_cm: 34.0, bcs: 3.0, libido: "M", aplomos: "Buenos", scrape_collected: true, scrape_tube: "R-09", serology_collected: true, serology_tube: "S-09", physical_verdict: "A", observations: "Correcto", confidence: 0.96 },
        { id: 10, caravana: "TR-010", ce_cm: 37.0, bcs: 3.5, libido: "ALTA", aplomos: "Correctos", scrape_collected: true, scrape_tube: "R-10", serology_collected: true, serology_tube: "S-10", physical_verdict: "A", observations: "Plantel superior", confidence: 0.99 },
        { id: 11, caravana: "TR-011", ce_cm: 35.0, bcs: 3.0, libido: "M", aplomos: "Correctos", scrape_collected: true, scrape_tube: "R-11", serology_collected: true, serology_tube: "S-11", physical_verdict: "A", observations: "Repetir R2 en 15 d", confidence: 0.98 },
        { id: 12, caravana: "TR-012", ce_cm: 36.5, bcs: 3.5, libido: "A", aplomos: "Correctos", scrape_collected: true, scrape_tube: "R-12", serology_collected: true, serology_tube: "S-12", physical_verdict: "A", observations: "Lote vaquillonas", confidence: 0.99 },
      ]);
      setIsProcessed(true);
      return;
    }
    const title =
      selectedCode === "REP-01"
        ? "Planilla de Tacto y Ecografía"
        : selectedCode === "REP-02"
          ? "Planilla de Parición"
          : selectedCode === "OP-01"
            ? "Control Mensual de Pesajes"
            : "Ingreso de Compra Directa";
    setTemplateTitle(`${title} (Simulación)`);

    setBatchName(`LOTE-CRIA-${selectedCode}`);
    setActivityName("CRIA");
    setEntryDate(new Date().toISOString().slice(0, 10));
    setProviderCuit("30-71234567-9");
    setProviderRenspa("02.123.4.56789/00");
    setGuiaDte("DTE-884920");

    setRows([
      {
        id: 1,
        caravana: "caravana-test-1",
        category: "Vaca de Cría",
        sex: "H",
        breed: "Angus",
        teeth: 6,
        entry_weight: 430.0,
        observations: "Estado corporal 3.5",
        confidence: 0.98,
      },
      {
        id: 2,
        caravana: "caravana-test-2",
        category: "Vaca de Cría",
        sex: "H",
        breed: "Angus Negro",
        teeth: 4,
        entry_weight: 415.0,
        observations: "Preñada cabeza",
        confidence: 0.96,
      },
      {
        id: 3,
        caravana: "caravana-test-3",
        category: "Ternero",
        sex: "M",
        breed: "Brangus",
        teeth: 0,
        entry_weight: 160.0,
        observations: "Al pie de la madre",
        confidence: 0.99,
      },
      {
        id: 4,
        caravana: "caravana-test-4",
        category: "Ternera",
        sex: "H",
        breed: "Hereford",
        teeth: 0,
        entry_weight: 152.0,
        observations: "Al pie de la madre",
        confidence: 0.95,
      },
      {
        id: 5,
        caravana: "caravana-test-5",
        category: "Vaquillona Reposición",
        sex: "H",
        breed: "Angus",
        teeth: 2,
        entry_weight: 285.0,
        observations: "Para servicio",
        confidence: 0.97,
      },
      {
        id: 6,
        caravana: "caravana-test-6",
        category: "Vaquillona",
        sex: "H",
        breed: "Braford",
        teeth: 2,
        entry_weight: 290.0,
        observations: "Control sanitario al día",
        confidence: 0.94,
      },
      {
        id: 7,
        caravana: "caravana-test-7",
        category: "Toro",
        sex: "M",
        breed: "Angus Colorado",
        teeth: 8,
        entry_weight: 680.0,
        observations: "Apto reproductor",
        confidence: 0.99,
      },
      {
        id: 8,
        caravana: "caravana-test-8",
        category: "Toro",
        sex: "M",
        breed: "Brangus",
        teeth: 6,
        entry_weight: 640.0,
        observations: "Evaluación andrológica OK",
        confidence: 0.99,
      },
    ]);

    setIsProcessed(true);
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
            : "Ingreso de Compra Directa"),
      );

      if (detectedCode === "TOR-01") {
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
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddRow = () => {
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
            <MenuItem value="REP-01">REP-01 • Tacto & Ecografía</MenuItem>
            <MenuItem value="REP-02">REP-02 • Parición</MenuItem>
            <MenuItem value="OP-01">OP-01 • Control Mensual</MenuItem>
            <MenuItem value="OP-02">OP-02 • Invernada</MenuItem>
          </Select>

          {!isProcessed ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => handleSimulateDocument(templateCode)}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                borderRadius: "6px",
              }}
            >
              ⚡ Simular Documento ({templateCode})
            </Button>
          ) : (
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
                {isSaving ? "Guardando..." : `Confirmar Tropa (${rows.length})`}
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
                      handleSimulateDocument();
                    }}
                  >
                    ⚡ Cargar Simulación de Documento
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
              <Paper
                elevation={0}
                sx={{
                  flex: { xs: "1 1 100%", lg: "0 0 420px" },
                  width: { xs: "100%", lg: "420px" },
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
                  borderRadius: "8px",
                  p: 2,
                  bgcolor: "background.paper",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  position: "sticky",
                  top: 24,
                  maxHeight: "calc(100vh - 120px)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    Documento Original
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Acercar">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setZoomLevel((z) => Math.min(z + 0.25, 2.5))
                        }
                      >
                        <ZoomInIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Alejar">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setZoomLevel((z) => Math.max(z - 0.25, 0.5))
                        }
                      >
                        <ZoomOutIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Rotar">
                      <IconButton
                        size="small"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                      >
                        <RotateRightIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Abrir en Preview Modal">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={handleOpenPreviewModal}
                      >
                        <FullscreenIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ocultar Panel">
                      <IconButton
                        size="small"
                        onClick={() => setShowPreview(false)}
                      >
                        <VisibilityOffIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                {/* Clickable Image Thumbnail Container */}
                <Box
                  onClick={handleOpenPreviewModal}
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "#e2e8f0",
                    borderRadius: "6px",
                    bgcolor: "action.hover",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "400px",
                    position: "relative",
                    cursor: "pointer",
                    "&:hover .preview-overlay": {
                      opacity: 1,
                    },
                  }}
                >
                  <img
                    src={filePreviewUrl}
                    alt="Document Preview"
                    style={{
                      maxWidth: "100%",
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transformOrigin: "center center",
                      transition: "transform 0.2s ease",
                    }}
                  />
                  {/* Overlay text on hover */}
                  <Box
                    className="preview-overlay"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(0, 0, 0, 0.45)",
                      color: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    <FullscreenIcon sx={{ fontSize: 36 }} />
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      Haz clic para ampliar en Modal Preview
                    </Typography>
                  </Box>
                </Box>
              </Paper>
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
                {templateCode === "TOR-01" ? (
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
                {templateCode === "TOR-01" ? (
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
        <Dialog
          open={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 0,
              bgcolor: "background.paper",
              maxHeight: "90vh",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justify: "space-between",
              alignItems: "center",
              borderBottom: 1,
              borderColor: "divider",
              py: 1.5,
              px: 2,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <VisibilityIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Vista Previa del Documento Original Escaneado
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Acercar (Zoom In)">
                <IconButton
                  onClick={() =>
                    setModalZoomLevel((z) => Math.min(z + 0.25, 3.5))
                  }
                >
                  <ZoomInIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Alejar (Zoom Out)">
                <IconButton
                  onClick={() =>
                    setModalZoomLevel((z) => Math.max(z - 0.25, 0.5))
                  }
                >
                  <ZoomOutIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Rotar 90°">
                <IconButton
                  onClick={() => setModalRotation((r) => (r + 90) % 360)}
                >
                  <RotateRightIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Restablecer Vista">
                <IconButton
                  onClick={() => {
                    setModalZoomLevel(1);
                    setModalRotation(0);
                  }}
                >
                  <RestartAltIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={() => setIsPreviewModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent
            dividers
            sx={{
              p: 3,
              bgcolor: "action.hover",
              display: "flex",
              justify: "center",
              alignItems: "center",
              overflow: "auto",
              minHeight: "550px",
            }}
          >
            {filePreviewUrl ? (
              <img
                src={filePreviewUrl}
                alt="Document Full Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "75vh",
                  transform: `scale(${modalZoomLevel}) rotate(${modalRotation}deg)`,
                  transformOrigin: "center center",
                  transition: "transform 0.2s ease",
                  border: "1px solid #cbd5e1",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                }}
              />
            ) : (
              <Typography color="text.secondary">
                No hay documento cargado para previsualizar
              </Typography>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Controles: Usa Zoom y Rotación para verificar los datos extraídos
              contra el manuscrito original.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setIsPreviewModalOpen(false)}
              sx={{ borderRadius: 0, fontWeight: 700, px: 3 }}
            >
              Cerrar Previsualización
            </Button>
          </DialogActions>
        </Dialog>

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
