import React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import {
  DiagnosticProtocol,
  PendingTube,
  SampleShipment,
} from "@/core/veterinary/domain/VeterinaryTypes";
import { PortalDerivedProtocolsList } from "./shipments/PortalDerivedProtocolsList";

interface Props {
  pendingTubes?: PendingTube[];
  shipments: SampleShipment[];
  derivedProtocols?: DiagnosticProtocol[];
  /** Absent when a management user is only looking. */
  onRegisterShipment?: (protocol?: DiagnosticProtocol) => void;
  onSignAct?: (act: DiagnosticProtocol) => void;
  onVoid?: (shipment: SampleShipment) => void;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

/**
 * ADR-30 / ADR-36: the professional's dispatch desk.
 *
 * Two questions, in the order somebody actually asks them while standing at a bench: what do I
 * still have here, and what did I already send.
 *
 * Having nothing pending is not an empty state to apologise for — a professional who processes
 * their own samples never dispatches anything, and the panel says so plainly.
 */
export const PortalShipmentsPanel: React.FC<Props> = ({
  shipments,
  derivedProtocols = [],
  onRegisterShipment,
  onSignAct,
  onVoid,
  isLoading,
  isReadOnly,
}) => {
  return (
    <Stack spacing={2.5}>
      {/* ADR-40: Protocols with destination plan TO_BE_DERIVED */}
      <PortalDerivedProtocolsList
        protocols={derivedProtocols}
        onRegisterShipment={onRegisterShipment}
        onSignAct={onSignAct}
        isReadOnly={isReadOnly}
        isLoading={isLoading}
      />

      <Paper
        elevation={0}
        sx={{ border: 1, borderColor: "divider", borderRadius: "8px", bgcolor: "background.paper" }}
      >
        <Box sx={{ p: 2, px: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          <FuseSvgIcon size={20} color="action">
            heroicons-outline:truck
          </FuseSvgIcon>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Envíos declarados
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Lo que despachó, a quién y en qué condiciones.
            </Typography>
          </Box>
          <Chip size="small" label={shipments.length} sx={{ fontWeight: 700, borderRadius: "6px" }} />
        </Box>

        <Divider />

        {isLoading && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2.5 }}>
            Cargando…
          </Typography>
        )}

        {!isLoading && shipments.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2.5 }}>
            Todavía no declaró ningún envío.
          </Typography>
        )}

        {!isLoading &&
          shipments.map((shipment, index) => (
            <Box key={shipment.id}>
              {index > 0 && <Divider />}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", sm: "center" }}
                sx={{ p: 2, px: 2.5, opacity: shipment.is_voided ? 0.55 : 1 }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {shipment.institution.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {shipment.shipped_on} · {shipment.samples_count} tubo(s)
                    {shipment.acts_covered > 1 ? ` de ${shipment.acts_covered} actas` : ""}
                    {shipment.institution.cuit ? ` · CUIT ${shipment.institution.cuit}` : ""}
                  </Typography>
                  {shipment.void_reason && (
                    <Typography variant="caption" color="error.main">
                      Anulado: {shipment.void_reason}
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  {!shipment.cold_chain_ok && (
                    <Chip
                      size="small"
                      variant="outlined"
                      color="warning"
                      label="Cadena de frío cortada"
                      sx={{ fontWeight: 600, borderRadius: "6px" }}
                    />
                  )}
                  {/* ADR-31: la derivación se deduce después, al comparar con el informe. */}
                  {!shipment.institution.cuit && !shipment.is_voided && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label="Sin CUIT"
                      sx={{ fontWeight: 600, borderRadius: "6px" }}
                    />
                  )}
                  {shipment.is_cited_by_report && !shipment.is_voided && (
                    <Chip
                      size="small"
                      variant="outlined"
                      color="success"
                      label="Con informe"
                      sx={{ fontWeight: 600, borderRadius: "6px" }}
                    />
                  )}
                </Stack>

                {!shipment.is_voided && onVoid && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => onVoid(shipment)}
                    sx={{ fontWeight: 700, borderRadius: "6px", textTransform: "none" }}
                  >
                    Anular
                  </Button>
                )}
              </Stack>
            </Box>
          ))}
      </Paper>
    </Stack>
  );
};

export default PortalShipmentsPanel;
