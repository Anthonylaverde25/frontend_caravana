import React, { useEffect, useMemo, useState } from "react";
import { InstitutionMetaFields } from "../institutions/InstitutionMetaFields";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  Divider,
  FormControlLabel,
  IconButton,
  Link,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import {
  DiagnosticProtocol,
  InstitutionMeta,
  LabSampleStatus,
  RegisterLabReportInput,
  SampleShipment,
} from "@/core/veterinary/domain/VeterinaryTypes";
import { PortalLabReportDataTable } from "./report/PortalLabReportDataTable";

interface Props {
  /**
   * The CUIT the professional usually reports under. Last-resort prefill for the institution
   * block when the act declared nothing.
   *
   * A convenience, not a rule: nothing is inferred from it. The professional may report from a
   * laboratory whose CUIT is neither of theirs, which is the normal case for an employee and
   * exactly what the old comparison mistook for a derivation.
   */
  defaultInstitutionCuit?: string | null;
  open: boolean;
  act: DiagnosticProtocol | null;
  isSaving: boolean;
  /**
   * ADR-36: la caja vigente que cubre esta acta, si hubo una. Es la fuente del hecho: dice a quién
   * se derivó, y por eso el modal no tiene que preguntarlo.
   */
  shipment?: SampleShipment | null;
  /** Lleva a la pestaña de envíos: el destino equivocado se arregla ahí, no acá (ADR-37). */
  onReviewShipment?: () => void;
  onClose: () => void;
  onConfirm: (input: RegisterLabReportInput) => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Contenedor de sección al estilo Fiori Horizon: cabecera con paso numerado, título y subtítulo a
 * la izquierda, estado a la derecha, y el contenido separado por una línea.
 *
 * El formulario era una pila plana de campos donde el N° de protocolo vivía entre el bloque de
 * derivación y el adjunto. Agrupar por intención — qué documento es, de dónde salió el análisis,
 * qué dio, qué observó — es lo que vuelve legible una pantalla de esta densidad.
 */
/**
 * Contenedor integrado para cada sección del panel lateral.
 * Sin tarjetas ni bordes flotantes innecesarios: fluye de forma continua en una sola pieza.
 */
const AsideSection: React.FC<{
  step?: number | string;
  title: string;
  caption?: string;
  status?: React.ReactNode;
  children: React.ReactNode;
}> = ({ step, title, caption, status, children }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
    <Stack direction="row" alignItems="center" spacing={1.25}>
      {step !== undefined && (
        <Box
          sx={{
            width: 22,
            height: 22,
            flexShrink: 0,
            borderRadius: "50%",
            bgcolor: "#0f172a",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.72rem",
            fontWeight: 800,
          }}
        >
          {step}
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            fontSize: "0.78rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "text.primary",
          }}
        >
          {title}
        </Typography>
        {caption && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", fontSize: "0.7rem", lineHeight: 1.2 }}
          >
            {caption}
          </Typography>
        )}
      </Box>

      {status}
    </Stack>

    <Box>{children}</Box>
  </Box>
);

/**
 * Una institución mostrada como dato y no como formulario.
 *
 * A propósito NO es `InstitutionMetaFields` deshabilitado: un formulario gris sigue pareciendo un
 * formulario que alguien debería poder editar, y acá el punto es justamente que este dato no se
 * edita en esta pantalla — se arregla donde vive (ADR-37).
 */
const InstitutionReadout: React.FC<{ value: InstitutionMeta }> = ({ value }) => {
  const rows: [string, string][] = [
    ["CUIT", value.cuit?.trim() || "No declarado"],
    ["Código oficial", value.codigo_oficial?.trim() || "No declarado"],
  ];

  if (value.direccion?.trim()) {
    rows.push(["Dirección", value.direccion.trim()]);
  }

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderLeft: 3,
        borderLeftColor: "primary.main",
        borderRadius: "6px",
        bgcolor: "action.hover",
        px: 2,
        py: 1.5,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <FuseSvgIcon size={16} sx={{ color: "primary.main" }}>
          heroicons-outline:building-office-2
        </FuseSvgIcon>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {value.nombre}
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 0.5, sm: 4 }}
        sx={{ flexWrap: "wrap" }}
      >
        {rows.map(([label, content]) => (
          <Box key={label}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.04em" }}
            >
              {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace", fontSize: "0.8rem" }}>
              {content}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

/**
 * ADR-11: the laboratory's own document, hanging off the act.
 *
 * Full-screen workspace, organizado en secciones al estilo SAP Fiori Horizon: cabecera de objeto
 * arriba, secciones numeradas en el cuerpo y barra de acciones abajo, que es donde Fiori pone la
 * acción principal de un objeto que se está editando.
 */
export const PortalLabReportDialog: React.FC<Props> = ({
  open,
  act,
  isSaving,
  shipment = null,
  onReviewShipment,
  onClose,
  onConfirm,
  defaultInstitutionCuit = null,
}) => {
  const [reportNumber, setReportNumber] = useState("");
  const [reportNumberError, setReportNumberError] = useState("");
  const [resultDate, setResultDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [observations, setObservations] = useState("");
  const [results, setResults] = useState<Record<number, LabSampleStatus>>({});
  // ADR-35 (rev.): the other institution's own PDF, demanded on a declared derivation.
  const [attachments, setAttachments] = useState<File[]>([]);
  // ADR-29: the centre this report is filed from. Named on every report, derived or not.
  const [institution, setInstitution] = useState<InstitutionMeta>({ nombre: "", cuit: "" });
  const [isDerived, setIsDerived] = useState(false);
  const [processor, setProcessor] = useState<InstitutionMeta>({ nombre: "", cuit: "" });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAsideOpen, setIsAsideOpen] = useState(true);

  const pendingSamples = useMemo(
    () => (act?.lab_samples ?? []).filter((s) => s.status === "PENDING_RESULTS"),
    [act],
  );

  /*
   * ADR-11 + ADR-40: el informe hereda lo que el acta declaró y sólo pregunta lo que el acta calló.
   *
   *   DERIVED  el acta declaró TO_BE_DERIVED. No se repregunta; si además sabemos a quién (hubo
   *            envío, o la columna del acta lo tiene), el bloque va en sólo lectura.
   *   IN_SITU  el acta declaró que se procesaba en casa. Tampoco se pregunta: una casilla sin
   *            marcar al lado de un dato que ya conocemos sólo confunde. Queda una salida discreta
   *            para el caso ADR-40 — la realidad que terminó difiriendo del plan.
   *   ASK      el acta no declaró nada (UNDECIDED, y toda acta anterior a ADR-39). Acá sí no hay
   *            nada que heredar y la pregunta es la de siempre.
   *
   * El envío manda sobre la columna del acta cuando los dos tienen destino: es la fuente del
   * hecho, y si alguien lo corrigió (ADR-37) la caja es la que quedó bien.
   */
  const derivation = useMemo(() => {
    if (act?.destination_plan === "TO_BE_DERIVED") {
      const declared = shipment?.institution ?? act?.destination_institution ?? null;

      return {
        mode: "DERIVED" as const,
        locked: Boolean(declared?.nombre?.trim()),
        destination: declared,
      };
    }

    return {
      mode: act?.destination_plan === "IN_SITU" ? ("IN_SITU" as const) : ("ASK" as const),
      locked: false,
      destination: null as InstitutionMeta | null,
    };
  }, [act?.destination_plan, act?.destination_institution, shipment]);

  useEffect(() => {
    if (open) {
      setReportNumber("");
      setReportNumberError("");
      setResultDate(new Date().toISOString().split("T")[0]);
      setObservations("");
      setAttachments([]);
      setIsAsideOpen(true);
      // ADR-41: the report inherits what the act declared and keeps its OWN copy. It is not read
      // live from the act, for the same reason ADR-38 freezes the signed CUITs: correcting the act
      // tomorrow must not change what a closed report says.
      setInstitution(
        act?.act_institution ?? { nombre: "", cuit: defaultInstitutionCuit ?? "" },
      );
      // ADR-11: heredado del acta, no repreguntado. Ver `derivation`.
      setIsDerived(derivation.mode === "DERIVED");
      setProcessor(
        derivation.locked && derivation.destination
          ? derivation.destination
          : { nombre: "", cuit: "" },
      );
      setValidationError(null);
      setResults(
        Object.fromEntries(
          pendingSamples.map((s) => [
            s.id,
            "PENDING_RESULTS" as LabSampleStatus,
          ]),
        ),
      );
    }
    // Ojo con las dependencias: este efecto resetea el formulario ENTERO, así que no puede
    // depender de `derivation` como objeto. Su identidad cambia con cada refetch de envíos en
    // segundo plano, y eso borraría lo que el profesional esté cargando. Van las primitivas.
  }, [
    open,
    pendingSamples,
    defaultInstitutionCuit,
    act?.act_institution,
    derivation.mode,
    derivation.locked,
    derivation.destination?.nombre,
    derivation.destination?.cuit,
  ]);

  if (!act) return null;

  const resolvedCount = Object.values(results).filter(
    (v) => v !== "PENDING_RESULTS",
  ).length;

  // ADR-35 (rev.): the declaration is what demands the paper, not a comparison of CUITs.
  const needsAttachment = isDerived && attachments.length === 0;

  // El acta previó procesar en casa y el análisis terminó derivándose igual (ADR-40).
  const contradictsPlan = derivation.mode === "IN_SITU" && isDerived;

  const applyToAll = (status: LabSampleStatus) =>
    setResults(Object.fromEntries(pendingSamples.map((s) => [s.id, status])));

  const clearError = () => {
    if (validationError) setValidationError(null);
  };

  const handleSignReport = () => {
    // 1. Validate report number
    if (!reportNumber.trim()) {
      setReportNumberError("El número de protocolo del laboratorio es obligatorio.");
      setValidationError(
        "Por favor ingrese el N° de protocolo del laboratorio para poder firmar el informe.",
      );
      return;
    }
    setReportNumberError("");

    // 2. Validate sample results
    const resolvedEntries = Object.entries(results).filter(
      ([, status]) => status !== "PENDING_RESULTS",
    );

    if (resolvedEntries.length === 0) {
      setValidationError(
        "Debe calificar el diagnóstico de al menos una muestra en la tabla (marcar como Negativo o Positivo) antes de firmar.",
      );
      return;
    }

    // 3. The report always names the institution it is filed from (ADR-29).
    if (!institution.nombre.trim()) {
      setValidationError(
        "Indique la institución desde la que informa: el protocolo siempre lleva su nombre y CUIT, incluso cuando el análisis se hizo en su propio centro.",
      );
      return;
    }

    // 4. A declared derivation has to name who processed it (ADR-31 rev.). Heredada del acta,
    // esto sólo puede faltar cuando no hubo envío registrado: no hay de dónde sacar el nombre.
    if (isDerived && !processor.nombre.trim()) {
      setValidationError(
        derivation.mode === "DERIVED"
          ? `El acta ${act.protocol_number} declaró que estas muestras se derivaban, pero no hay envío registrado que diga a quién: indique el nombre y CUIT de la institución que procesó el análisis.`
          : "Marcó que el análisis fue derivado: indique el nombre y CUIT de la institución que lo procesó.",
      );
      return;
    }

    // 5. And that institution's own paper is the only thing holding the result up (ADR-35 rev.).
    if (needsAttachment) {
      setValidationError(
        derivation.mode === "DERIVED"
          ? `El acta ${act.protocol_number} declaró una derivación a ${processor.nombre || "otra institución"}: el PDF original es lo único que sostiene el resultado, así que es obligatorio adjuntarlo.`
          : `El análisis lo procesó ${processor.nombre || "otra institución"}: está transcribiendo su informe, así que es obligatorio adjuntar el PDF original.`,
      );
      return;
    }

    setValidationError(null);

    // 6. Submit
    onConfirm({
      lab_report_number: reportNumber.trim(),
      result_date: resultDate,
      observations: observations.trim() || null,
      reporting_institution: institution,
      is_derived: isDerived,
      analysing_institution: isDerived ? processor : null,
      lines: resolvedEntries.map(([sampleId, status]) => ({
        sample_id: Number(sampleId),
        status,
      })),
      attachments,
    });
  };

  /* ---------------------------------------------------------------- sección 2: origen */

  const attachmentControl = (
    <Box>
      <Button
        component="label"
        variant={attachments.length > 0 ? "outlined" : "contained"}
        size="small"
        disabled={isSaving}
        startIcon={<FuseSvgIcon size={16}>heroicons-outline:paper-clip</FuseSvgIcon>}
        sx={{ fontWeight: 700, borderRadius: "6px", textTransform: "none", boxShadow: "none" }}
      >
        {attachments.length > 0
          ? `${attachments.length} archivo(s) adjunto(s)`
          : "Adjuntar el informe de quien lo procesó"}
        <input
          hidden
          multiple
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => {
            setAttachments(Array.from(e.target.files ?? []));
            clearError();
          }}
        />
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
        {attachments.length > 0
          ? attachments.map((file) => file.name).join(" · ")
          : "El PDF original es obligatorio: es lo único que sostiene un resultado que usted transcribe."}
      </Typography>
    </Box>
  );

  const processorFields = (
    <InstitutionMetaFields
      value={processor}
      onChange={(newInst) => {
        setProcessor(newInst);
        clearError();
      }}
      disabled={isSaving}
      caption="Institución que procesó el análisis — a quién se derivó"
    />
  );

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={isSaving ? undefined : onClose}
      TransitionComponent={Transition}
      PaperProps={{ sx: { bgcolor: "background.default" } }}
    >
      {/* ------------------------------------------------- cabecera oscura tipo Workbench */}
      <AppBar
        sx={{
          position: "sticky",
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          bgcolor: "#0f172a",
          color: "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, gap: 2, minHeight: { sm: 66 } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: "wrap" }}>
              <Typography variant="h6" noWrap sx={{ fontSize: "1.05rem", fontWeight: 700, color: "#ffffff" }}>
                Informe de Resultados de Laboratorio
              </Typography>
              <Chip
                size="small"
                label={`Acta ${act.protocol_number}`}
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  bgcolor: "rgba(30, 58, 138, 0.4)",
                  color: "#60a5fa",
                  border: "1px solid #1d4ed8",
                  height: 24,
                  borderRadius: "4px",
                }}
              />
            </Stack>
            <Typography variant="caption" sx={{ display: "block", mt: 0.25, color: "#94a3b8", fontSize: "0.75rem" }}>
              Fecha de manga: {act.sample_date} • {pendingSamples.length} muestras a procesar
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            {needsAttachment && (
              <Chip
                size="small"
                color="warning"
                label="Falta el informe del que lo procesó"
                icon={<FuseSvgIcon size={14}>heroicons-outline:exclamation-triangle</FuseSvgIcon>}
                sx={{ fontWeight: 600, fontSize: "0.75rem" }}
              />
            )}

            {/* Botón rápido en AppBar para togglear el panel */}
            <Tooltip title={isAsideOpen ? "Ocultar datos del informe (ampliar tabla)" : "Mostrar datos del informe"}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setIsAsideOpen(!isAsideOpen)}
                startIcon={
                  <FuseSvgIcon size={16} sx={{ color: isAsideOpen ? "#94a3b8" : "#38bdf8" }}>
                    {isAsideOpen ? "heroicons-outline:chevron-double-left" : "heroicons-outline:bars-3-bottom-left"}
                  </FuseSvgIcon>
                }
                sx={{
                  color: isAsideOpen ? "#94a3b8" : "#ffffff",
                  borderColor: isAsideOpen ? "rgba(255,255,255,0.2)" : "#0284c7",
                  bgcolor: isAsideOpen ? "rgba(255,255,255,0.05)" : "rgba(2, 132, 199, 0.2)",
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  textTransform: "none",
                  borderRadius: "6px",
                  height: 28,
                  display: { xs: "none", sm: "inline-flex" },
                  "&:hover": {
                    bgcolor: isAsideOpen ? "rgba(255,255,255,0.1)" : "rgba(2, 132, 199, 0.3)",
                    borderColor: isAsideOpen ? "rgba(255,255,255,0.4)" : "#38bdf8",
                  },
                }}
              >
                {isAsideOpen ? "Ocultar panel" : "Ver datos acta"}
              </Button>
            </Tooltip>

            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 500, display: { xs: "none", sm: "inline" } }}>
                Resolución del acta
              </Typography>
              <Box
                sx={{
                  borderRadius: "16px",
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  px: 1.5,
                  py: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor:
                      resolvedCount === pendingSamples.length && pendingSamples.length > 0
                        ? "#22c55e"
                        : resolvedCount > 0
                        ? "#eab308"
                        : "#94a3b8",
                  }}
                />
                <Typography
                  sx={{
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                >
                  {resolvedCount} / {pendingSamples.length} resueltos
                </Typography>
              </Box>
            </Stack>

            <IconButton
              edge="end"
              onClick={onClose}
              size="small"
              disabled={isSaving}
              aria-label="close"
              sx={{
                color: "#94a3b8",
                ml: 0.5,
                "&:hover": { color: "#ffffff", bgcolor: "rgba(255, 255, 255, 0.08)" },
              }}
            >
              <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* ------------------------------------------------------------------ cuerpo tipo Workbench */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          height: "calc(100vh - 130px)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* ==============================================================
            COLUMNA IZQUIERDA: ASIDE INTEGRADO EN UNA SOLA PIEZA
        ============================================================== */}
        <Box
          component="aside"
          sx={{
            width: isAsideOpen ? { xs: "100%", md: 390, lg: 410, xl: 430 } : 0,
            minWidth: isAsideOpen ? { xs: "100%", md: 390, lg: 410, xl: 430 } : 0,
            transition: "width 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
            borderRight: isAsideOpen ? 1 : 0,
            borderColor: "divider",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
            flexShrink: 0,
            zIndex: 5,
          }}
        >
          {/* Header del Aside */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 2.5,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              flexShrink: 0,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <FuseSvgIcon size={18} sx={{ color: "primary.main" }}>
                heroicons-outline:clipboard-document-list
              </FuseSvgIcon>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "text.primary",
                }}
              >
                Datos del Protocolo
              </Typography>
            </Stack>

            <Tooltip title="Ocultar panel lateral (dar prioridad a la tabla)">
              <IconButton
                size="small"
                onClick={() => setIsAsideOpen(false)}
                sx={{
                  color: "text.secondary",
                  bgcolor: "action.hover",
                  borderRadius: "6px",
                  p: 0.5,
                  "&:hover": { bgcolor: "action.selected", color: "text.primary" },
                }}
              >
                <FuseSvgIcon size={16}>heroicons-outline:chevron-double-left</FuseSvgIcon>
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Contenido en una sola pieza continua sin cards */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2.5,
              py: 2.5,
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            {/* 1. Identificación */}
            <AsideSection
              step={1}
              title="Identificación del informe"
              caption="Datos del protocolo y fecha oficial de emisión"
            >
              <Stack spacing={2}>
                <TextField
                  required
                  fullWidth
                  label="N° de protocolo del laboratorio *"
                  value={reportNumber}
                  onChange={(e) => {
                    setReportNumber(e.target.value);
                    if (reportNumberError) setReportNumberError("");
                    clearError();
                  }}
                  error={Boolean(reportNumberError)}
                  disabled={isSaving}
                  variant="filled"
                  size="small"
                  sx={{ bgcolor: "action.hover" }}
                  helperText={reportNumberError || "El número impreso en el informe oficial."}
                />
                <TextField
                  type="date"
                  fullWidth
                  label="Fecha del informe *"
                  value={resultDate}
                  onChange={(e) => setResultDate(e.target.value)}
                  disabled={isSaving}
                  variant="filled"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: "action.hover" }}
                  helperText="La fecha que figura en el certificado del laboratorio."
                />
              </Stack>
            </AsideSection>

            <Divider sx={{ my: 0.5, borderColor: "divider" }} />

            {/* 2. Origen del análisis */}
            <AsideSection
              step={2}
              title="Origen del análisis"
              caption="Lugar donde se procesan las muestras"
              status={
                derivation.mode === "DERIVED" ? (
                  <Chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    label="Derivado"
                    sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22 }}
                  />
                ) : contradictsPlan ? (
                  <Chip
                    size="small"
                    color="warning"
                    variant="outlined"
                    label="Derivado — difiere"
                    sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22 }}
                  />
                ) : (
                  <Chip
                    size="small"
                    label="In situ"
                    sx={{
                      bgcolor: "rgba(16, 185, 129, 0.1)",
                      color: "#059669",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      fontWeight: 700,
                      fontSize: "0.68rem",
                      height: 22,
                    }}
                  />
                )
              }
            >
              <Stack spacing={2}>
                <InstitutionMetaFields
                  value={institution}
                  onChange={(newInst) => {
                    setInstitution(newInst);
                    clearError();
                  }}
                  disabled={isSaving}
                  variant="card"
                />

                {derivation.mode === "IN_SITU" && !isDerived && (
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: "6px",
                        bgcolor: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                      }}
                    >
                      <FuseSvgIcon size={16} sx={{ color: "#059669", mt: 0.2, flexShrink: 0 }}>
                        heroicons-outline:check-circle
                      </FuseSvgIcon>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#065f46" }}>
                          Análisis in situ
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#047857", fontSize: "0.7rem", display: "block" }}>
                          Se procesa en el laboratorio de la institución seleccionada.
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
                      ¿Terminó procesándolo otra institución?{" "}
                      <Link
                        component="button"
                        type="button"
                        underline="always"
                        disabled={isSaving}
                        onClick={() => {
                          setIsDerived(true);
                          clearError();
                        }}
                        sx={{ fontWeight: 600, fontSize: "0.72rem", color: "primary.main" }}
                      >
                        Declarar la derivación
                      </Link>
                    </Typography>
                  </Stack>
                )}

                {derivation.mode === "DERIVED" && (
                  <Stack spacing={1.5}>
                    <Alert severity="info" sx={{ borderRadius: "6px", fontSize: "0.75rem" }}>
                      El acta <strong>{act.protocol_number}</strong> declaró derivación
                      {derivation.locked && derivation.destination ? (
                        <> a <strong>{derivation.destination.nombre}</strong></>
                      ) : null}
                      . Transcribiendo informe externo.
                    </Alert>

                    {derivation.locked && derivation.destination ? (
                      <>
                        <InstitutionReadout value={derivation.destination} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                          {shipment ? `Tomado del envío del ${shipment.shipped_on}. ` : `Tomado del acta. `}
                          <Link
                            component="button"
                            type="button"
                            underline="always"
                            disabled={isSaving}
                            onClick={onReviewShipment}
                            sx={{ verticalAlign: "baseline", fontSize: "0.7rem" }}
                          >
                            Corregir envío
                          </Link>
                        </Typography>
                      </>
                    ) : (
                      processorFields
                    )}

                    {attachmentControl}
                  </Stack>
                )}

                {contradictsPlan && (
                  <Stack spacing={1.5}>
                    <Alert severity="warning" sx={{ borderRadius: "6px", fontSize: "0.75rem" }}>
                      Declarando derivación no prevista en acta.{" "}
                      <Link
                        component="button"
                        type="button"
                        underline="always"
                        disabled={isSaving}
                        onClick={() => {
                          setIsDerived(false);
                          setProcessor({ nombre: "", cuit: "" });
                          clearError();
                        }}
                        sx={{ verticalAlign: "baseline" }}
                      >
                        Deshacer
                      </Link>
                    </Alert>
                    {processorFields}
                    {attachmentControl}
                  </Stack>
                )}

                {derivation.mode === "ASK" && (
                  <Stack spacing={1.5}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isDerived}
                          disabled={isSaving}
                          onChange={(e) => {
                            setIsDerived(e.target.checked);
                            if (!e.target.checked) setProcessor({ nombre: "", cuit: "" });
                            clearError();
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.78rem" }}>
                            Es derivado: procesó otra institución
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                            No se declaró en el acta; defínalo aquí.
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", ml: 0, "& .MuiCheckbox-root": { pt: 0 } }}
                    />

                    {isDerived && (
                      <Stack spacing={1.5} sx={{ pl: 2, borderLeft: 2, borderColor: "divider" }}>
                        {processorFields}
                        {attachmentControl}
                      </Stack>
                    )}
                  </Stack>
                )}
              </Stack>
            </AsideSection>

            <Divider sx={{ my: 0.5, borderColor: "divider" }} />

            {/* 3. Observaciones y Efectos */}
            <AsideSection
              step={3}
              title="Observaciones y efectos"
              caption="Notas del informe y normativa sanitaria"
            >
              <Stack spacing={2}>
                <TextField
                  label="Observaciones del informe"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  disabled={isSaving}
                  variant="filled"
                  size="small"
                  multiline
                  rows={3}
                  fullWidth
                  sx={{ bgcolor: "action.hover" }}
                  placeholder="Notas adicionales sobre las muestras o lecturas..."
                />

                <Alert
                  severity="info"
                  icon={<FuseSvgIcon size={16}>heroicons-outline:information-circle</FuseSvgIcon>}
                  sx={{
                    borderRadius: "6px",
                    fontSize: "0.72rem",
                    lineHeight: 1.3,
                    bgcolor: "rgba(14, 165, 233, 0.08)",
                    color: "#0369a1",
                    border: "1px solid rgba(14, 165, 233, 0.2)",
                    "& .MuiAlert-icon": { color: "#0284c7" },
                  }}
                >
                  <strong>Efecto clínico:</strong> Positivos e indeterminados generan alertas de aislamiento y cambio sanitario en el rodeo conforme a SENASA.
                </Alert>
              </Stack>
            </AsideSection>
          </Box>
        </Box>

        {/* ==============================================================
            COLUMNA DERECHA: RESULTADOS POR TUBO (WORKBENCH PRINCIPAL)
        ============================================================== */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
            bgcolor: "background.default",
          }}
        >
          {/* Barra superior de control de la tabla */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: { xs: 2, sm: 3 },
              py: 1.25,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              flexShrink: 0,
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              {!isAsideOpen && (
                <Tooltip title="Mostrar panel con los datos del protocolo">
                  <Button
                    onClick={() => setIsAsideOpen(true)}
                    size="small"
                    variant="outlined"
                    startIcon={<FuseSvgIcon size={16}>heroicons-outline:chevron-double-right</FuseSvgIcon>}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      borderRadius: "6px",
                      borderColor: "divider",
                      color: "primary.main",
                      bgcolor: "action.hover",
                      px: 1.5,
                      py: 0.5,
                      "&:hover": { bgcolor: "action.selected", borderColor: "primary.main" },
                    }}
                  >
                    Datos del informe
                  </Button>
                </Tooltip>
              )}

              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, fontSize: "0.92rem", lineHeight: 1.2 }}>
                    Resultados por Tubo
                  </Typography>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={
                      resolvedCount === pendingSamples.length && pendingSamples.length > 0
                        ? "success"
                        : resolvedCount > 0
                        ? "primary"
                        : "default"
                    }
                    label={`${resolvedCount} / ${pendingSamples.length} calificados`}
                    sx={{ fontWeight: 700, fontSize: "0.72rem", height: 22 }}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.7rem" }}>
                  Diagnóstico individual por determinación analítica
                </Typography>
              </Box>
            </Stack>

            {isAsideOpen ? (
              <Tooltip title="Ocultar datos laterales para ampliar la tabla a pantalla completa">
                <Button
                  onClick={() => setIsAsideOpen(false)}
                  size="small"
                  variant="text"
                  startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrows-pointing-out</FuseSvgIcon>}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.72rem",
                    color: "text.secondary",
                    "&:hover": { color: "text.primary", bgcolor: "action.hover" },
                  }}
                >
                  Pantalla completa
                </Button>
              </Tooltip>
            ) : (
              <Chip
                size="small"
                label="Modo Pantalla Completa Activo"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: "0.68rem", height: 22 }}
              />
            )}
          </Stack>

          {/* Mensaje de validación si existe */}
          {validationError && (
            <Alert
              severity="warning"
              onClose={() => setValidationError(null)}
              sx={{ borderRadius: 0, fontWeight: 600, borderBottom: 1, borderColor: "divider" }}
            >
              {validationError}
            </Alert>
          )}

          {/* Contenedor fluido de la tabla */}
          <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 2, sm: 3 }, py: 2 }}>
            <PortalLabReportDataTable
              samples={pendingSamples}
              results={results}
              onResultChange={(sampleId, status) => {
                setResults((prev) => ({ ...prev, [sampleId]: status }));
                clearError();
              }}
              onApplyToAll={(status) => {
                applyToAll(status);
                clearError();
              }}
              hideToolbarCounter={true}
              disabled={isSaving}
            />
          </Box>
        </Box>
      </Box>

      {/* ------------------------------------------- barra de acciones fija (Sticky Footer) */}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
          boxShadow: "0 -2px 6px rgba(0,0,0,0.04)",
          px: { xs: 2, sm: 3, md: 4 },
          py: 1.5,
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            maxWidth: 1600,
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 280 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "6px",
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FuseSvgIcon size={18} sx={{ color: "text.secondary" }}>
                heroicons-outline:lock-closed
              </FuseSvgIcon>
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.8rem", lineHeight: 1.2 }}>
                Firma digital y registro oficial
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.72rem" }}>
                Esta acción bloquea las muestras procesadas y genera el registro en la historia clínica animal.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              onClick={onClose}
              variant="outlined"
              disabled={isSaving}
              sx={{
                fontWeight: 600,
                textTransform: "none",
                borderColor: "divider",
                color: "text.primary",
                borderRadius: "6px",
                px: 2.5,
                "&:hover": { borderColor: "text.secondary", bgcolor: "action.hover" },
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={isSaving}
              onClick={handleSignReport}
              startIcon={
                isSaving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <FuseSvgIcon size={18}>heroicons-outline:check</FuseSvgIcon>
                )
              }
              sx={{
                px: 3.5,
                py: 1,
                fontWeight: 700,
                borderRadius: "6px",
                textTransform: "none",
                bgcolor: "#0f624d",
                color: "#ffffff",
                boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                "&:hover": { bgcolor: "#0b4839" },
              }}
            >
              {isSaving ? "Registrando..." : "Firmar informe"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
};

export default PortalLabReportDialog;
