import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import {
  InstitutionMeta,
  PendingTube,
  RegisterSampleShipmentInput,
  SampleDestinationPlan,
} from "@/core/veterinary/domain/VeterinaryTypes";
import { InstitutionMetaFields } from "../institutions/InstitutionMetaFields";

interface Props {
  open: boolean;
  tubes: PendingTube[];
  isSaving: boolean;
  accessToken?: string | null;
  onClose: () => void;
  onConfirm: (input: RegisterSampleShipmentInput) => void;
  initialSelectedActId?: number | null;
}

const EMPTY_INSTITUTION: InstitutionMeta = { nombre: "", cuit: "" };

/**
 * ADR-30: the professional declares what they dispatched — a fact they witnessed.
 *
 * Nothing here asks about an arrival. The laboratory on the other side does not use the system,
 * and its report is what acknowledges receipt (ADR-32). The predecessor of this screen asked the
 * person handing the box over to also certify it got there, which is attesting something they
 * did not see.
 *
 * ADR-36: it opens with every tube the professional holds, across all their acts, because a
 * cooler is packed from a bench and not from one chute session.
 */
export const PortalShipmentDialog: React.FC<Props> = ({
  open,
  tubes,
  isSaving,
  accessToken = null,
  initialSelectedActId = null,
  onClose,
  onConfirm,
}) => {
  const [shippedOn, setShippedOn] = useState(new Date().toISOString().split("T")[0]);
  const [coldChainOk, setColdChainOk] = useState(true);
  const [notes, setNotes] = useState("");
  const [institution, setInstitution] = useState<InstitutionMeta>(EMPTY_INSTITUTION);
  // Una sugerencia sólo puede escribir sobre un campo intacto. Destildar un tubo no tiene
  // derecho a borrar lo que el profesional ya escribió a mano.
  const [institutionTouched, setInstitutionTouched] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  /*
   * One checkbox per PHYSICAL TUBE.
   *
   * `pending-tubes` returns one entry per DETERMINATION: a preputial scrape is cultured for both
   * venereal agents and aptitude is counted per agent, so one tube arrives as two entries sharing a
   * tube number. Checkboxes per entry let the professional untick half a tube — physically
   * meaningless, and it would leave one determination marked as shipped and its twin still in hand
   * for the same piece of glass. Grouping them means a tube travels whole or not at all.
   */
  const groups = useMemo(() => {
    const byKey = new Map<
      string,
      {
        key: string;
        tubeNumber: string | null;
        caravanLabel: string;
        actNumber: string | null;
        extractedOn: string | null;
        extractionActId: number;
        sampleIds: number[];
        destinationPlan: SampleDestinationPlan | null;
        destinationInstitution: InstitutionMeta | null;
      }
    >();

    tubes.forEach((tube) => {
      // No tube number means nothing safe to group on, so the entry stands alone.
      const key = tube.tube_number
        ? `${tube.extraction_act_id}|${tube.caravan_id}|${tube.tube_number}`
        : `sample-${tube.id}`;

      const existing = byKey.get(key);

      if (existing) {
        existing.sampleIds.push(tube.id);
        return;
      }

      byKey.set(key, {
        key,
        tubeNumber: tube.tube_number ?? null,
        caravanLabel: String(tube.caravan_number ?? `Caravana ${tube.caravan_id}`),
        actNumber: tube.act_number ?? null,
        extractedOn: tube.extracted_on ?? null,
        extractionActId: tube.extraction_act_id,
        sampleIds: [tube.id],
        destinationPlan: tube.destination_plan ?? null,
        destinationInstitution: tube.destination_institution ?? null,
      });
    });

    return Array.from(byKey.values());
  }, [tubes]);

  // Opens with everything ticked: one trip is the common case, and fractioning is the exception
  // the operator opts into by unticking.
  useEffect(() => {
    if (!open) return;

    setShippedOn(new Date().toISOString().split("T")[0]);
    setColdChainOk(true);
    setNotes("");
    setInstitution(EMPTY_INSTITUTION);
    setInstitutionTouched(false);
    if (initialSelectedActId) {
      setSelected(
        Object.fromEntries(
          groups.map((group) => [
            group.key,
            group.extractionActId === initialSelectedActId,
          ])
        )
      );
    } else {
      setSelected(Object.fromEntries(groups.map((group) => [group.key, true])));
    }
  }, [open, groups, initialSelectedActId]);

  const selectedGroups = useMemo(
    () => groups.filter((group) => selected[group.key]),
    [groups, selected]
  );

  // The API still takes determination ids — every one belonging to a selected tube goes together.
  const selectedIds = useMemo(
    () => selectedGroups.flatMap((group) => group.sampleIds),
    [selectedGroups]
  );

  const actsCovered = useMemo(
    () => new Set(selectedGroups.map((group) => group.extractionActId)).size,
    [selectedGroups]
  );

  /*
   * ADR-39 rev.: el destino que el acta ya declaró vuelve a aparecer solo.
   *
   * Se sugiere únicamente si TODAS las actas seleccionadas que declararon un destino declararon
   * el MISMO. Si la caja mezcla dos laboratorios el campo queda vacío: precargar uno de los dos
   * sería elegir por el profesional, y elegir mal la mitad de las veces.
   *
   * La identidad es el CUIT cuando está y el nombre en minúsculas cuando no (ADR-29), que es el
   * mismo criterio con el que el backend deduplica las sugerencias.
   */
  const destinationConsensus = useMemo(() => {
    const declared = selectedGroups
      .map((group) => group.destinationInstitution)
      .filter((meta): meta is InstitutionMeta => Boolean(meta?.nombre?.trim()));

    if (declared.length === 0) {
      return { suggestion: null as InstitutionMeta | null, conflicting: false };
    }

    const keys = new Set(
      declared.map((meta) => meta.cuit?.trim() || meta.nombre.trim().toLowerCase())
    );

    return keys.size === 1
      ? { suggestion: declared[0], conflicting: false }
      : { suggestion: null as InstitutionMeta | null, conflicting: true };
  }, [selectedGroups]);

  // Mientras nadie escribió nada, el campo espeja la sugerencia — incluso al vaciarse, que es lo
  // que corresponde cuando la selección pasa a mezclar destinos distintos.
  useEffect(() => {
    if (!open || institutionTouched) return;

    setInstitution(destinationConsensus.suggestion ?? EMPTY_INSTITUTION);
  }, [open, institutionTouched, destinationConsensus]);

  // Actas que preveían derivar y todavía no tienen destino asentado: lo que se escriba acá se les
  // va a escribir a ellas.
  const derivedWithoutDestination = useMemo(
    () =>
      selectedGroups.filter(
        (group) =>
          group.destinationPlan === "TO_BE_DERIVED" &&
          !group.destinationInstitution?.nombre?.trim()
      ).length,
    [selectedGroups]
  );

  // §4: a broken cold chain never blocks the record — the professional judges whether the sample
  // is still usable — but the judgement has to be written down.
  const needsColdChainNote = !coldChainOk && notes.trim() === "";
  const canConfirm =
    selectedIds.length > 0 && institution.nombre.trim() !== "" && !needsColdChainNote && !isSaving;

  const deferred = groups.length - selectedGroups.length;

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "8px", boxShadow: 1, bgcolor: "background.paper" } }}
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
            Registrar envío de muestras
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Declare lo que despachó. Lo que pase del otro lado lo acredita el informe.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={isSaving} sx={{ color: "primary.main" }}>
          <FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              type="date"
              label="Fecha de despacho"
              value={shippedOn}
              onChange={(e) => setShippedOn(e.target.value)}
              variant="filled"
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ bgcolor: "action.hover", flex: 1 }}
              helperText="Cuándo salieron de sus manos."
            />

            <FormControlLabel
              control={
                <Switch
                  checked={coldChainOk}
                  onChange={(e) => setColdChainOk(e.target.checked)}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Cadena de frío mantenida
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Si se cortó, deje constancia abajo.
                  </Typography>
                </Box>
              }
              sx={{ flex: 1, ml: 0 }}
            />
          </Stack>

          <Divider />

          <InstitutionMetaFields
            value={institution}
            onChange={(value) => {
              setInstitutionTouched(true);
              setInstitution(value);
            }}
            accessToken={accessToken}
            disabled={isSaving}
            caption="¿A quién le entregó los tubos?"
          />

          {destinationConsensus.conflicting && (
            <Alert severity="warning" sx={{ borderRadius: "6px" }}>
              Las actas de esta caja declararon <strong>destinos distintos</strong>. Escriba el que
              corresponde a este viaje: se va a asentar en todas las actas a derivar que lleva la
              caja.
            </Alert>
          )}

          {derivedWithoutDestination > 0 && (
            <Alert severity="info" sx={{ borderRadius: "6px" }}>
              {derivedWithoutDestination} tubo(s) de actas marcadas <strong>a derivar</strong>{" "}
              todavía no tienen destino declarado. Lo que escriba acá queda asentado en esas actas.
            </Alert>
          )}

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Tubos que viajan ({selectedGroups.length} de {groups.length})
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Destilde los que quedan para otro viaje. Vuelven a aparecer en el próximo envío.
            </Typography>

            <Stack spacing={0.5} sx={{ maxHeight: 280, overflowY: "auto" }}>
              {groups.map((group) => (
                <FormControlLabel
                  key={group.key}
                  control={
                    <Checkbox
                      size="small"
                      checked={Boolean(selected[group.key])}
                      onChange={(e) =>
                        setSelected((prev) => ({ ...prev, [group.key]: e.target.checked }))
                      }
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {group.tubeNumber ?? "Sin rótulo"} · {group.caravanLabel}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {group.actNumber ?? "Acta sin número"}
                        {group.extractedOn ? ` · extraído el ${group.extractedOn}` : ""}
                        {group.sampleIds.length > 1
                          ? ` · ${group.sampleIds.length} determinaciones`
                          : ""}
                      </Typography>
                    </Box>
                  }
                />
              ))}

              {groups.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No tiene tubos sin despachar. Si procesó las muestras usted mismo, no hace falta
                  registrar ningún envío.
                </Typography>
              )}
            </Stack>
          </Box>

          <TextField
            label={coldChainOk ? "Observaciones (opcional)" : "En qué condiciones viajaron"}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            variant="filled"
            size="small"
            multiline
            rows={2}
            required={!coldChainOk}
            error={needsColdChainNote}
            helperText={
              needsColdChainNote
                ? "Si la cadena de frío se cortó, el criterio profesional tiene que quedar escrito."
                : "Por ejemplo: conservadas a 4 °C desde el día anterior."
            }
            sx={{ bgcolor: "action.hover" }}
          />

          {deferred > 0 && (
            <Alert severity="info" sx={{ borderRadius: "6px" }}>
              {deferred} tubo(s) quedan en su poder y vuelven a aparecer en el próximo envío. Una
              jornada de dos días se entrega en dos viajes.
            </Alert>
          )}

          {actsCovered > 1 && (
            <Alert severity="info" sx={{ borderRadius: "6px" }}>
              Esta conservadora lleva tubos de <strong>{actsCovered} actas</strong> distintas. Queda
              como un solo envío: se empaqueta una caja, no un acta.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{ p: 2, px: 3, bgcolor: "background.default", borderTop: 1, borderColor: "divider", gap: 1.5 }}
      >
        <Button onClick={onClose} variant="text" disabled={isSaving} sx={{ fontWeight: 600, textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          onClick={() =>
            onConfirm({
              shipped_on: shippedOn,
              cold_chain_ok: coldChainOk,
              condition_notes: notes.trim() || null,
              institution,
              sample_ids: selectedIds,
            })
          }
          variant="contained"
          disabled={!canConfirm}
          sx={{ px: 4, fontWeight: 700, borderRadius: "6px", textTransform: "none", boxShadow: "none" }}
        >
          {isSaving ? "Registrando…" : `Despaché ${selectedGroups.length} tubo(s)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PortalShipmentDialog;
