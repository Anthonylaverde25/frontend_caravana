import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useVeterinaryPortalContext } from "../../components/veterinary-portal/context/VeterinaryPortalContext";

type TubeFilter = "ALL" | "TO_BE_DERIVED" | "IN_SITU" | "PREPUCE_SCRAPE" | "BLOOD_SEROLOGY";

/**
 * Tab: Tubos en Custodia View.
 *
 * Dedicated screen for inspecting, searching, and managing physical sample tubes
 * currently in the professional's custody across all extraction acts.
 */
export const PortalCustodyTubesView: React.FC = () => {
  const {
    pendingTubes,
    loadingTubes,
    onOpenShipment,
    isReadOnly,
  } = useVeterinaryPortalContext();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TubeFilter>("ALL");

  const acts = useMemo(
    () => new Set(pendingTubes.map((tube) => tube.extraction_act_id)),
    [pendingTubes]
  );

  const derivedCount = useMemo(
    () => pendingTubes.filter((t) => t.destination_plan === "TO_BE_DERIVED").length,
    [pendingTubes]
  );

  const inSituCount = useMemo(
    () => pendingTubes.filter((t) => t.destination_plan === "IN_SITU").length,
    [pendingTubes]
  );

  const filteredTubes = useMemo(() => {
    return pendingTubes.filter((tube) => {
      // Filter check
      if (filter === "TO_BE_DERIVED" && tube.destination_plan !== "TO_BE_DERIVED") return false;
      if (filter === "IN_SITU" && tube.destination_plan !== "IN_SITU") return false;
      if (filter === "PREPUCE_SCRAPE" && tube.sample_type !== "PREPUCE_SCRAPE") return false;
      if (filter === "BLOOD_SEROLOGY" && tube.sample_type !== "BLOOD_SEROLOGY") return false;

      // Search check
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const tubeNum = (tube.tube_number ?? "").toLowerCase();
      const caravan = (tube.caravan_number ?? `caravana ${tube.caravan_id}`).toLowerCase();
      const actNum = (tube.act_number ?? "").toLowerCase();
      return tubeNum.includes(q) || caravan.includes(q) || actNum.includes(q);
    });
  }, [pendingTubes, filter, search]);

  return (
    <div className="mx-auto max-w-[1720px] space-y-4 px-4 py-4 sm:px-6">
      {/* Top Header & Summary */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          border: 1,
          borderColor: "divider",
          borderRadius: "8px",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <FuseSvgIcon size={24} className="text-emerald-700">
                heroicons-outline:beaker
              </FuseSvgIcon>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Tubos en Custodia
              </Typography>
              <Chip
                size="small"
                label={`${pendingTubes.length} tubos`}
                color="primary"
                sx={{ fontWeight: 700, borderRadius: "6px" }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Muestras físicas extraídas en manga bajo custodia profesional, pendientes de procesamiento o despacho.
            </Typography>
          </Box>

          {!isReadOnly && onOpenShipment && (
            <Button
              variant="contained"
              size="medium"
              color="primary"
              disabled={pendingTubes.length === 0}
              onClick={() => onOpenShipment()}
              startIcon={<FuseSvgIcon size={18}>heroicons-outline:truck</FuseSvgIcon>}
              sx={{
                fontWeight: 700,
                borderRadius: "6px",
                textTransform: "none",
                boxShadow: "none",
              }}
            >
              Registrar Envío General
            </Button>
          )}
        </Stack>

        {/* Metric Badges */}
        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: "divider" }}
        >
          <Box sx={{ minWidth: 140 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Total en custodia
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
              {pendingTubes.length}
            </Typography>
          </Box>

          <Box sx={{ minWidth: 140 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Actas involucradas
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
              {acts.size}
            </Typography>
          </Box>

          <Box sx={{ minWidth: 140 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              A derivar externamente
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>
              {derivedCount}
            </Typography>
          </Box>

          <Box sx={{ minWidth: 140 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Procesamiento In Situ
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "text.secondary" }}>
              {inSituCount}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Filter and Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2,
          border: 1,
          borderColor: "divider",
          borderRadius: "8px",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            size="small"
            placeholder="Buscar por tubo, caravana o acta…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: "100%", md: 320 } }}
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

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label="Todos"
              size="small"
              clickable
              color={filter === "ALL" ? "primary" : "default"}
              variant={filter === "ALL" ? "filled" : "outlined"}
              onClick={() => setFilter("ALL")}
              sx={{ fontWeight: 600, borderRadius: "6px" }}
            />
            <Chip
              label={`A Derivar (${derivedCount})`}
              size="small"
              clickable
              color={filter === "TO_BE_DERIVED" ? "primary" : "default"}
              variant={filter === "TO_BE_DERIVED" ? "filled" : "outlined"}
              onClick={() => setFilter("TO_BE_DERIVED")}
              sx={{ fontWeight: 600, borderRadius: "6px" }}
            />
            <Chip
              label={`In Situ (${inSituCount})`}
              size="small"
              clickable
              color={filter === "IN_SITU" ? "primary" : "default"}
              variant={filter === "IN_SITU" ? "filled" : "outlined"}
              onClick={() => setFilter("IN_SITU")}
              sx={{ fontWeight: 600, borderRadius: "6px" }}
            />
            <Chip
              label="Raspajes"
              size="small"
              clickable
              color={filter === "PREPUCE_SCRAPE" ? "primary" : "default"}
              variant={filter === "PREPUCE_SCRAPE" ? "filled" : "outlined"}
              onClick={() => setFilter("PREPUCE_SCRAPE")}
              sx={{ fontWeight: 600, borderRadius: "6px" }}
            />
            <Chip
              label="Serología"
              size="small"
              clickable
              color={filter === "BLOOD_SEROLOGY" ? "primary" : "default"}
              variant={filter === "BLOOD_SEROLOGY" ? "filled" : "outlined"}
              onClick={() => setFilter("BLOOD_SEROLOGY")}
              sx={{ fontWeight: 600, borderRadius: "6px" }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Custody Tubes Table */}
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: "8px",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        {loadingTubes ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Cargando tubos en custodia…
            </Typography>
          </Box>
        ) : filteredTubes.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <FuseSvgIcon size={36} color="action" className="mx-auto mb-2 opacity-40">
              heroicons-outline:beaker
            </FuseSvgIcon>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {pendingTubes.length === 0
                ? "No tiene tubos en custodia actualmente"
                : "No se encontraron tubos con los filtros aplicados"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {pendingTubes.length === 0
                ? "Todos los tubos extraídos han sido procesados internamente o despachados a laboratorio."
                : "Pruebe modificando el término de búsqueda o el filtro de destino."}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: (theme) => (theme.palette.mode === "dark" ? "action.hover" : "grey.50") }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Rótulo de Tubo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Caravana</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Acta de Origen</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tipo de Ensayo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Plan de Destino</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Fecha Extracción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTubes.map((tube) => (
                  <TableRow
                    key={tube.id}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700 }}>
                      {tube.tube_number ? (
                        <Chip
                          size="small"
                          label={tube.tube_number}
                          sx={{ fontWeight: 700, borderRadius: "4px" }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Sin rótulo
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {tube.caravan_number ?? `Caravana ${tube.caravan_id}`}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {tube.act_number ?? `Acta #${tube.extraction_act_id}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={tube.sample_type === "PREPUCE_SCRAPE" ? "Raspaje" : "Serología"}
                        sx={{ fontWeight: 600, borderRadius: "4px" }}
                      />
                    </TableCell>
                    <TableCell>
                      {tube.destination_plan === "TO_BE_DERIVED" ? (
                        <Chip
                          size="small"
                          color="primary"
                          variant="outlined"
                          label="A derivar"
                          sx={{ fontWeight: 700, borderRadius: "4px" }}
                        />
                      ) : tube.destination_plan === "IN_SITU" ? (
                        <Chip
                          size="small"
                          variant="outlined"
                          color="default"
                          label="In Situ"
                          sx={{ fontWeight: 600, borderRadius: "4px" }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Sin definir
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {tube.extracted_on || "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </div>
  );
};

export default PortalCustodyTubesView;
