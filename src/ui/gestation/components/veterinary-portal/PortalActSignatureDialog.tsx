import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { InstitutionMetaFields } from "../institutions/InstitutionMetaFields";
import { ActTubesTable } from "./signature/ActTubesTable";
import { countPhysicalTubes } from "./signature/actTubes";
import {
  DiagnosticProtocol,
  InstitutionMeta,
  SampleDestinationPlan,
  SAMPLE_DESTINATION_PLAN_LABELS,
  SignExtractionActInput,
} from "@/core/veterinary/domain/VeterinaryTypes";

interface Props {
  open: boolean;
  act: DiagnosticProtocol | null;
  veterinarianName: string;
  licenseNumber: string;
  healthCenterName?: string | null;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (input: SignExtractionActInput) => void;
}

/**
 * ADR-13: the professional reviews tube by tube and closes the chain of custody.
 *
 * The warning is not decoration. After this the act cannot be edited — correcting it means
 * voiding and reissuing — and that is precisely what stops a tube from being reassigned to a
 * different bull once a positive comes back.
 */
export const PortalActSignatureDialog: React.FC<Props> = ({
  open,
  act,
  veterinarianName,
  licenseNumber,
  healthCenterName,
  isSaving,
  onClose,
  onConfirm,
}) => {
  const [observations, setObservations] = useState("");
  const [dispatchNote, setDispatchNote] = useState("");
  // ADR-39: what the chute declared, shown so the professional signs what they actually meant.
  // This is the last moment it can change: after the signature the act attests to it.
  const [institution, setInstitution] = useState<InstitutionMeta>(
    act?.act_institution ?? { nombre: "", cuit: "" },
  );
  const [destinationPlan, setDestinationPlan] = useState<SampleDestinationPlan>(
    act?.destination_plan ?? "UNDECIDED",
  );

  useEffect(() => {
    setInstitution(act?.act_institution ?? { nombre: "", cuit: "" });
    setDestinationPlan(act?.destination_plan ?? "UNDECIDED");
  }, [act?.id, act?.act_institution, act?.destination_plan]);


  if (!act) return null;

  /*
   * Tubes vs determinations. `lab_samples` has one row per DETERMINATION — a preputial scrape is
   * cultured for both venereal agents, and aptitude is counted per agent — so calling that count
   * "tubos" told the professional they were holding two tubes when there is one in their hand.
   */
  const tubeCount = countPhysicalTubes(act.lab_samples);
  const determinationCount = act.lab_samples.length;
  const tubeLabel = tubeCount === 1 ? "1 tubo" : `${tubeCount} tubos`;

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { borderRadius: "8px", boxShadow: 1, bgcolor: "background.paper" },
      }}
    >
      <Box
        sx={{
          p: 2,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Firmar acta {act.protocol_number}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Manga del {act.sample_date} · {tubeLabel}
            {determinationCount !== tubeCount && ` · ${determinationCount} determinaciones`}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          disabled={isSaving}
          sx={{ color: "primary.main" }}
        >
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/*
          Order of importance. What the professional DECIDES comes before what they merely CHECK:
          the signature that gets frozen, then the three things they can still change, then the
          register of tubes they are certifying, then the consequence of pressing the button.

          The table used to come first, which read as if reviewing tubes were the task and the
          fields an afterthought. It is the other way round — the tubes are already what they are.
        */}
        <Stack spacing={2.5}>
          <Box sx={{ p: 2, borderRadius: "8px", bgcolor: "action.hover" }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                fontSize: "0.66rem",
                letterSpacing: "0.04em",
                color: "text.secondary",
              }}
            >
              Firma que quedará congelada
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {veterinarianName} — M.P. {licenseNumber}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {/* ADR-29: la firma atestigua a una persona, no a una institución. */}
              {act.signed_cuit ? `CUIT ${act.signed_cuit}` : "Sin CUIT cargado"}
            </Typography>
          </Box>

          {/* ADR-39: confirmar o corregir lo declarado en la manga, antes de congelarlo. */}
          <InstitutionMetaFields
            value={institution}
            onChange={setInstitution}
            disabled={isSaving}
            caption="Institución desde la que trabajó (opcional)"
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              select
              label="Destino previsto de las muestras"
              value={destinationPlan}
              onChange={(e) => setDestinationPlan(e.target.value as SampleDestinationPlan)}
              disabled={isSaving}
              variant="filled"
              size="small"
              sx={{ bgcolor: "action.hover", flex: 2 }}
              helperText="Una intención, no un compromiso: si después cambia, lo que vale es el informe."
            >
              {(Object.keys(SAMPLE_DESTINATION_PLAN_LABELS) as SampleDestinationPlan[]).map((plan) => (
                <MenuItem key={plan} value={plan}>
                  {SAMPLE_DESTINATION_PLAN_LABELS[plan]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="N° de remito (opcional)"
              value={dispatchNote}
              onChange={(e) => setDispatchNote(e.target.value)}
              disabled={isSaving}
              variant="filled"
              size="small"
              sx={{ bgcolor: "action.hover", flex: 1 }}
              placeholder={act.dispatch_note_number ?? ""}
              helperText="El papel que acompaña la conservadora."
            />
          </Stack>

          <TextField
            label="Observaciones profesionales"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            disabled={isSaving}
            variant="filled"
            size="small"
            multiline
            rows={2}
            sx={{ bgcolor: "action.hover" }}
            placeholder="Incidencias de manga, estado de los animales, cualquier cosa que el informe deba tener en cuenta..."
          />

          <Divider />

          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="baseline"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Tubos que certifica
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {tubeLabel}
                {determinationCount !== tubeCount && ` · ${determinationCount} determinaciones`}
              </Typography>
            </Stack>
            <ActTubesTable samples={act.lab_samples} />
          </Box>

          <Alert severity="warning" sx={{ borderRadius: "6px" }}>
            Al firmar, el acta queda <strong>inmutable</strong>. Si más tarde se detecta un error,
            la única corrección posible es anularla y reemitirla.
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          px: 3,
          bgcolor: "background.default",
          borderTop: 1,
          borderColor: "divider",
          gap: 1.5,
        }}
      >
        <Chip
          size="small"
          variant="outlined"
          label={tubeLabel}
          sx={{ mr: "auto", fontWeight: 600, borderRadius: "6px" }}
        />
        <Button
          onClick={onClose}
          variant="text"
          disabled={isSaving}
          sx={{ fontWeight: 600, textTransform: "none" }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={isSaving}
          onClick={() =>
            onConfirm({
              observations: observations || null,
              institution: institution.nombre.trim() ? institution : null,
              destination_plan: destinationPlan,
              dispatch_note_number: dispatchNote || null,
            })
          }
          sx={{
            px: 4,
            fontWeight: 700,
            borderRadius: "6px",
            textTransform: "none",
            boxShadow: "none",
          }}
        >
          {isSaving ? "Firmando..." : "Firmar acta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
