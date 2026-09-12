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
  Container,
  Dialog,
  Divider,
  FormControlLabel,
  IconButton,
  Slide,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import {
  DiagnosticProtocol,
  InstitutionMeta,
  LabSampleStatus,
  RegisterLabReportInput,
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
 * ADR-11: the laboratory's own document, hanging off the act.
 *
 * Full-screen dialog workspace providing maximum viewport area for the diagnostic
 * spreadsheet grid, sample tracking, and document signing.
 * Restores original field distribution without unnecessary card wrappers, while
 * providing active click-validation on the sign button.
 */
export const PortalLabReportDialog: React.FC<Props> = ({
  open,
  act,
  isSaving,
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
  // ADR-31 (rev.): the professional says whether the tubes were processed somewhere else. The
  // system cannot work this out — a CUIT tells you who the taxpayer is, not where the tubes went.
  const [isDerived, setIsDerived] = useState(false);
  const [processor, setProcessor] = useState<InstitutionMeta>({ nombre: "", cuit: "" });
  const [validationError, setValidationError] = useState<string | null>(null);

  const pendingSamples = useMemo(
    () => (act?.lab_samples ?? []).filter((s) => s.status === "PENDING_RESULTS"),
    [act],
  );

  useEffect(() => {
    if (open) {
      setReportNumber("");
      setReportNumberError("");
      setResultDate(new Date().toISOString().split("T")[0]);
      setObservations("");
      setAttachments([]);
      // ADR-41: the report inherits what the act declared and keeps its OWN copy. It is not read
      // live from the act, for the same reason ADR-38 freezes the signed CUITs: correcting the act
      // tomorrow must not change what a closed report says.
      setInstitution(
        act?.act_institution ?? { nombre: "", cuit: defaultInstitutionCuit ?? "" },
      );
      // ADR-40: the plan only SUGGESTS the tick. The professional confirms or overrides it, and
      // whichever they leave is what gets recorded — the act never decides this.
      setIsDerived(act?.destination_plan === "TO_BE_DERIVED");
      setProcessor({ nombre: "", cuit: "" });
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
  }, [open, pendingSamples, defaultInstitutionCuit, act?.act_institution, act?.destination_plan]);

  if (!act) return null;

  const resolvedCount = Object.values(results).filter(
    (v) => v !== "PENDING_RESULTS",
  ).length;

  // ADR-35 (rev.): the declaration is what demands the paper, not a comparison of CUITs.
  const needsAttachment = isDerived && attachments.length === 0;

  const applyToAll = (status: LabSampleStatus) =>
    setResults(Object.fromEntries(pendingSamples.map((s) => [s.id, status])));

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

    // 4. A declared derivation has to name who processed it (ADR-31 rev.).
    if (isDerived && !processor.nombre.trim()) {
      setValidationError(
        "Marcó que el análisis fue derivado: indique el nombre y CUIT de la institución que lo procesó.",
      );
      return;
    }

    // 5. And that institution's own paper is the only thing holding the result up (ADR-35 rev.).
    if (needsAttachment) {
      setValidationError(
        `El análisis lo procesó ${processor.nombre || "otra institución"}: está transcribiendo su informe, así que es obligatorio adjuntar el PDF original.`,
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

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={isSaving ? undefined : onClose}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          bgcolor: "background.default",
        },
      }}
    >
      {/* Top Application Bar */}
      <AppBar
        sx={{
          position: "sticky",
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, gap: 2 }}>
          <IconButton
            edge="start"
            onClick={onClose}
            size="small"
            disabled={isSaving}
            aria-label="close"
            sx={{
              color: "text.secondary",
              bgcolor: "action.hover",
              "&:hover": { bgcolor: "action.selected" },
            }}
          >
            <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
          </IconButton>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="h6" noWrap sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
                Informe de Laboratorio
              </Typography>
              <Chip
                size="small"
                label={`Acta ${act.protocol_number}`}
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  bgcolor: "action.hover",
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
              Manga del {act.sample_date} · {pendingSamples.length} tubos en este protocolo
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {needsAttachment && (
              <Chip
                size="small"
                color="warning"
                label="Falta el informe del que lo procesó"
                icon={<FuseSvgIcon size={14}>heroicons-outline:exclamation-triangle</FuseSvgIcon>}
                sx={{ fontWeight: 600, fontSize: "0.75rem" }}
              />
            )}
            <Chip
              size="small"
              color={
                resolvedCount === pendingSamples.length && pendingSamples.length > 0
                  ? "success"
                  : resolvedCount > 0
                  ? "primary"
                  : "default"
              }
              variant="outlined"
              label={`${resolvedCount} / ${pendingSamples.length} resueltos`}
              sx={{ fontWeight: 700, fontSize: "0.75rem" }}
            />
            <Button
              onClick={onClose}
              variant="text"
              color="inherit"
              disabled={isSaving}
              sx={{ fontWeight: 600, textTransform: "none", color: "text.secondary" }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
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
                px: 3,
                fontWeight: 700,
                borderRadius: "6px",
                textTransform: "none",
                boxShadow: "none",
              }}
            >
              {isSaving ? "Registrando..." : "Firmar informe"}
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Full-Screen Workspace (No Unnecessary Floating Cards) */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          py: 3,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Container maxWidth="xl" disableGutters sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Validation Alert */}
          {validationError && (
            <Alert
              severity="warning"
              onClose={() => setValidationError(null)}
              sx={{ borderRadius: "6px", fontWeight: 600 }}
            >
              {validationError}
            </Alert>
          )}

          {/* Top Fields: Laboratory Metadata and Attachments (Original Distribution) */}
          <Stack spacing={2}>
            {/* ADR-29: siempre, aunque el trabajo no haya salido del propio centro. */}
            <InstitutionMetaFields
              value={institution}
              onChange={(newInst) => {
                setInstitution(newInst);
                if (validationError) setValidationError(null);
              }}
              disabled={isSaving}
              caption="Institución desde la que informa — la que recibió y conservó los tubos"
            />

            {act.act_institution && (
              <Typography variant="caption" color="text.secondary">
                Precargado desde el acta {act.protocol_number}, que declaró{" "}
                <strong>{act.destination_plan_label.toLowerCase()}</strong>. Podés cambiarlo: lo que
                vale es lo que firmes acá.
              </Typography>
            )}

            <Divider />

            {/* ADR-31 (rev.): lo declara el profesional. No se deduce de ningún CUIT. */}
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isDerived}
                    disabled={isSaving}
                    onChange={(e) => {
                      setIsDerived(e.target.checked);
                      if (!e.target.checked) setProcessor({ nombre: "", cuit: "" });
                      if (validationError) setValidationError(null);
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Es derivado: el análisis lo procesó otra institución
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Márquelo si los tubos se enviaron a otro laboratorio o centro de salud.
                      Déjelo sin marcar si el análisis se hizo en la institución de arriba.
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", ml: 0, "& .MuiCheckbox-root": { pt: 0 } }}
              />
            </Box>

            {isDerived && (
              <Stack spacing={1.5} sx={{ pl: { sm: 4 }, borderLeft: { sm: 2 }, borderColor: "divider" }}>
                <InstitutionMetaFields
                  value={processor}
                  onChange={(newInst) => {
                    setProcessor(newInst);
                    if (validationError) setValidationError(null);
                  }}
                  disabled={isSaving}
                  caption="Institución que procesó el análisis — a quién se derivó"
                />

                <Alert severity="warning" sx={{ borderRadius: "6px" }}>
                  Está transcribiendo el informe de{" "}
                  <strong>{processor.nombre || "la institución que lo procesó"}</strong>, así que el
                  PDF original es obligatorio: es lo único que sostiene el resultado.
                </Alert>
              </Stack>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
              <TextField
                required
                label="N° de protocolo del laboratorio"
                value={reportNumber}
                onChange={(e) => {
                  setReportNumber(e.target.value);
                  if (reportNumberError) setReportNumberError("");
                  if (validationError) setValidationError(null);
                }}
                error={Boolean(reportNumberError)}
                variant="filled"
                size="small"
                sx={{ bgcolor: "action.hover", flex: 2 }}
                helperText={reportNumberError || "El número impreso en el informe. No es el número del acta."}
              />
              <TextField
                type="date"
                label="Fecha del informe"
                value={resultDate}
                onChange={(e) => setResultDate(e.target.value)}
                variant="filled"
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ bgcolor: "action.hover", flex: 1 }}
              />

              {isDerived && (
                <Box sx={{ pt: 0.5 }}>
                  <Button
                    component="label"
                    variant={attachments.length > 0 ? "outlined" : "contained"}
                    size="small"
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
                        if (validationError) setValidationError(null);
                      }}
                    />
                  </Button>
                  {attachments.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                      {attachments.map((file) => file.name).join(" · ")}
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>
          </Stack>

          {/* Central Panel: Spreadsheet Table matching PedigreeDataTable */}
          <PortalLabReportDataTable
            samples={pendingSamples}
            results={results}
            onResultChange={(sampleId, status) => {
              setResults((prev) => ({
                ...prev,
                [sampleId]: status,
              }));
              if (validationError) setValidationError(null);
            }}
            onApplyToAll={(status) => {
              applyToAll(status);
              if (validationError) setValidationError(null);
            }}
            disabled={isSaving}
          />

          {/* Bottom Fields: Observations and Clinical Note (Original Distribution) */}
          <Stack spacing={2}>
            <TextField
              label="Observaciones del informe"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              variant="filled"
              size="small"
              multiline
              rows={2}
              sx={{ bgcolor: "action.hover" }}
              placeholder="Notas adicionales sobre las muestras, lecturas o incidencias del laboratorio..."
            />

            <Alert severity="info" sx={{ borderRadius: "6px" }}>
              Cada resultado positivo deriva automáticamente un hallazgo clínico y
              recalcula la aptitud del reproductor. Los negativos sólo suman una ronda.
            </Alert>
          </Stack>
        </Container>
      </Box>
    </Dialog>
  );
};
