import React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { DiagnosticProtocol } from "@/core/veterinary/domain/VeterinaryTypes";

interface Props {
  protocols: DiagnosticProtocol[];
  onRegisterShipment?: (protocol: DiagnosticProtocol) => void;
  onSignAct?: (act: DiagnosticProtocol) => void;
  isReadOnly?: boolean;
  isLoading?: boolean;
}

/**
 * ADR-40 / ADR-36: Protocols with destination plan = TO_BE_DERIVED.
 *
 * Displays protocols marked during chute closure to be derived to an external
 * laboratory/center, showing balances of unshipped vs shipped tubes and
 * providing direct dispatch actions.
 */
export const PortalDerivedProtocolsList: React.FC<Props> = ({
  protocols,
  onRegisterShipment,
  onSignAct,
  isReadOnly,
  isLoading,
}) => {
  return (
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
      {/* Header */}
      <Box
        sx={{
          p: 2,
          px: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "action.hover" : "grey.50",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <FuseSvgIcon size={20} className="text-blue-600">
          heroicons-outline:paper-airplane
        </FuseSvgIcon>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Protocolos con Destino a Derivación Externa
            </Typography>
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label="TO_BE_DERIVED"
              sx={{ fontWeight: 700, height: 20, fontSize: "0.7rem", borderRadius: "4px" }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Actas con plan declarado para remitir a laboratorios externos o centros de diagnóstico.
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`${protocols.length} protocolo(s)`}
          sx={{ fontWeight: 700, borderRadius: "6px" }}
        />
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Cargando protocolos a derivar…
          </Typography>
        </Box>
      )}

      {/* Empty State */}
      {!isLoading && protocols.length === 0 && (
        <Box
          sx={{
            p: 3,
            px: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 1.2,
              borderRadius: "50%",
              bgcolor: "success.light",
              color: "success.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FuseSvgIcon size={20}>heroicons-outline:check-circle</FuseSvgIcon>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Sin protocolos pendientes de derivación externa
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Los protocolos actuales están configurados para procesamiento interno (In Situ) o ya han completado su circuito de despacho.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Protocols List */}
      {!isLoading &&
        protocols.map((protocol, index) => {
          const totalSamples = protocol.samples_count || 1;
          const shippedSamples = protocol.shipped_samples_count || 0;
          const unshippedSamples = protocol.unshipped_samples_count ?? (totalSamples - shippedSamples);
          const percentShipped = Math.min(
            100,
            Math.round((shippedSamples / totalSamples) * 100)
          );
          const isAllShipped = unshippedSamples === 0;

          return (
            <Box key={protocol.id}>
              {index > 0 && <Divider />}
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", md: "center" }}
                sx={{
                  p: 2,
                  px: 2.5,
                  transition: "background-color 0.15s ease-in-out",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                {/* Protocol Identifiers & Destination */}
                <Box sx={{ flex: 1.2, minWidth: 220 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {protocol.protocol_number}
                    </Typography>
                    {protocol.is_signed ? (
                      <Chip
                        size="small"
                        color="success"
                        label="Firmada"
                        variant="outlined"
                        sx={{ fontWeight: 600, height: 20, fontSize: "0.7rem", borderRadius: "4px" }}
                      />
                    ) : (
                      <Chip
                        size="small"
                        color="warning"
                        label="Pendiente de firma"
                        variant="outlined"
                        sx={{ fontWeight: 600, height: 20, fontSize: "0.7rem", borderRadius: "4px" }}
                      />
                    )}
                  </Stack>

                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Fecha muestra: {protocol.sample_date || "S/F"}
                    {protocol.protocol_type_label ? ` · ${protocol.protocol_type_label}` : ""}
                  </Typography>

                  {/* Destination Institution */}
                  <Box sx={{ mt: 0.8, display: "flex", alignItems: "center", gap: 0.75 }}>
                    <FuseSvgIcon size={14} color="action">
                      heroicons-outline:office-building
                    </FuseSvgIcon>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
                      {protocol.act_institution?.nombre
                        ? protocol.act_institution.nombre
                        : "Laboratorio a definir en remito"}
                    </Typography>
                    {protocol.act_institution?.cuit && (
                      <Typography variant="caption" color="text.secondary">
                        (CUIT {protocol.act_institution.cuit})
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Tubes Tracking & Progress */}
                <Box sx={{ minWidth: 200, flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      Balance de Tubos:
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {shippedSamples} de {totalSamples} despachado(s) ({percentShipped}%)
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={percentShipped}
                    color={isAllShipped ? "success" : "primary"}
                    sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: "action.disabledBackground" }}
                  />

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      label={`${unshippedSamples} pendiente(s)`}
                      color={unshippedSamples > 0 ? "warning" : "default"}
                      variant={unshippedSamples > 0 ? "filled" : "outlined"}
                      sx={{ fontWeight: 700, height: 22, fontSize: "0.72rem", borderRadius: "4px" }}
                    />
                    <Chip
                      size="small"
                      label={`${shippedSamples} despachado(s)`}
                      color={shippedSamples > 0 ? "success" : "default"}
                      variant="outlined"
                      sx={{ fontWeight: 600, height: 22, fontSize: "0.72rem", borderRadius: "4px" }}
                    />
                  </Stack>
                </Box>

                {/* Direct Actions */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, alignSelf: { xs: "flex-end", md: "center" } }}>
                  {!isReadOnly && (
                    <>
                      {!protocol.is_signed && onSignAct ? (
                        <Tooltip title="El acta debe estar firmada antes de generar remitos de envío para sus tubos">
                          <span>
                            <Button
                              variant="outlined"
                              size="small"
                              color="warning"
                              onClick={() => onSignAct(protocol)}
                              startIcon={<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>}
                              sx={{
                                fontWeight: 700,
                                borderRadius: "6px",
                                textTransform: "none",
                              }}
                            >
                              Firmar Acta
                            </Button>
                          </span>
                        </Tooltip>
                      ) : !isAllShipped && onRegisterShipment ? (
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => onRegisterShipment(protocol)}
                          startIcon={<FuseSvgIcon size={16}>heroicons-outline:truck</FuseSvgIcon>}
                          sx={{
                            fontWeight: 700,
                            borderRadius: "6px",
                            textTransform: "none",
                            boxShadow: "none",
                          }}
                        >
                          Despachar Muestras
                        </Button>
                      ) : (
                        <Chip
                          size="small"
                          color="success"
                          icon={<FuseSvgIcon size={14}>heroicons-outline:check</FuseSvgIcon>}
                          label="Despacho Completo"
                          sx={{ fontWeight: 700, borderRadius: "6px" }}
                        />
                      )}
                    </>
                  )}
                </Box>
              </Stack>
            </Box>
          );
        })}
    </Paper>
  );
};

export default PortalDerivedProtocolsList;
