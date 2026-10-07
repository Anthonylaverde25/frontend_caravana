import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Paper,
  Stack,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { ContrastSettings } from "@/contexts/ContrastThemeContext";

interface ColorCustomizerProps {
  settings: ContrastSettings;
  updateSettings: (newSettings: Partial<ContrastSettings>) => void;
}

export const ColorCustomizer: React.FC<ColorCustomizerProps> = ({
  settings,
  updateSettings,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExp) => setExpanded(isExp)}
      variant="outlined"
      sx={{
        borderRadius: "8px !important",
        "&:before": { display: "none" },
        overflow: "hidden",
      }}
    >
      <AccordionSummary
        expandIcon={<FuseSvgIcon size={18}>lucide:chevron-down</FuseSvgIcon>}
        sx={{
          backgroundColor: (theme) => theme.palette.background.paper,
          px: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FuseSvgIcon size={18} color="action">
            lucide:sliders
          </FuseSvgIcon>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Ajustes Manuales Personalizados
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2, pb: 2, pt: 1 }}>
        <Stack spacing={2.5}>
          {/* Action Buttons Section */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: "8px",
              backgroundColor: (theme) => theme.palette.background.default,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <FuseSvgIcon size={16}>lucide:mouse-pointer-click</FuseSvgIcon>{" "}
              Botones Principales y Secundarios
            </Typography>

            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <TextField
                  type="color"
                  value={settings.primaryButtonBg || "#0E3D26"}
                  onChange={(e) =>
                    updateSettings({ primaryButtonBg: e.target.value })
                  }
                  disabled={!settings.enabled}
                  variant="filled"
                  size="small"
                  sx={{
                    width: 48,
                    height: 40,
                    p: 0,
                    "& input": { p: 0.5, cursor: "pointer", height: 32 },
                  }}
                />
                <TextField
                  label="Botón Principal (Verde Esmeralda)"
                  variant="filled"
                  size="small"
                  fullWidth
                  value={settings.primaryButtonBg}
                  onChange={(e) =>
                    updateSettings({ primaryButtonBg: e.target.value })
                  }
                  disabled={!settings.enabled}
                  placeholder="#0E3D26"
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <TextField
                  type="color"
                  value={settings.secondaryButtonBg || "#059669"}
                  onChange={(e) =>
                    updateSettings({ secondaryButtonBg: e.target.value })
                  }
                  disabled={!settings.enabled}
                  variant="filled"
                  size="small"
                  sx={{
                    width: 48,
                    height: 40,
                    p: 0,
                    "& input": { p: 0.5, cursor: "pointer", height: 32 },
                  }}
                />
                <TextField
                  label="Botón Secundario (Acento)"
                  variant="filled"
                  size="small"
                  fullWidth
                  value={settings.secondaryButtonBg}
                  onChange={(e) =>
                    updateSettings({ secondaryButtonBg: e.target.value })
                  }
                  disabled={!settings.enabled}
                  placeholder="#059669"
                />
              </Box>

              <Box sx={{ pt: 1, display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  fullWidth
                  sx={{ borderRadius: "6px" }}
                >
                  Principal
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  fullWidth
                  sx={{ borderRadius: "6px" }}
                >
                  Secundario
                </Button>
              </Box>
            </Stack>
          </Paper>

          {/* Header Colors */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: "8px",
              backgroundColor: (theme) => theme.palette.background.default,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <FuseSvgIcon size={16}>lucide:panel-top</FuseSvgIcon> Barra Superior (Header)
            </Typography>

            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <TextField
                  type="color"
                  value={settings.headerBg || "#ffffff"}
                  onChange={(e) => updateSettings({ headerBg: e.target.value })}
                  disabled={!settings.enabled}
                  variant="filled"
                  size="small"
                  sx={{
                    width: 48,
                    height: 40,
                    p: 0,
                    "& input": { p: 0.5, cursor: "pointer", height: 32 },
                  }}
                />
                <TextField
                  label="Fondo Header"
                  variant="filled"
                  size="small"
                  fullWidth
                  value={settings.headerBg}
                  onChange={(e) => updateSettings({ headerBg: e.target.value })}
                  disabled={!settings.enabled}
                  placeholder="#064E3B"
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <TextField
                  type="color"
                  value={settings.headerText || "#000000"}
                  onChange={(e) =>
                    updateSettings({ headerText: e.target.value })
                  }
                  disabled={!settings.enabled}
                  variant="filled"
                  size="small"
                  sx={{
                    width: 48,
                    height: 40,
                    p: 0,
                    "& input": { p: 0.5, cursor: "pointer", height: 32 },
                  }}
                />
                <TextField
                  label="Texto Header"
                  variant="filled"
                  size="small"
                  fullWidth
                  value={settings.headerText}
                  onChange={(e) =>
                    updateSettings({ headerText: e.target.value })
                  }
                  disabled={!settings.enabled}
                  placeholder="#ECFDF5"
                />
              </Box>
            </Stack>
          </Paper>

          {/* Aside Colors */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: "8px",
              backgroundColor: (theme) => theme.palette.background.default,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <FuseSvgIcon size={16}>lucide:panel-left</FuseSvgIcon> Barra Lateral (Sidebar)
            </Typography>

            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <TextField
                  type="color"
                  value={settings.asideBg || "#ffffff"}
                  onChange={(e) => updateSettings({ asideBg: e.target.value })}
                  disabled={!settings.enabled}
                  variant="filled"
                  size="small"
                  sx={{
                    width: 48,
                    height: 40,
                    p: 0,
                    "& input": { p: 0.5, cursor: "pointer", height: 32 },
                  }}
                />
                <TextField
                  label="Fondo Sidebar"
                  variant="filled"
                  size="small"
                  fullWidth
                  value={settings.asideBg}
                  onChange={(e) => updateSettings({ asideBg: e.target.value })}
                  disabled={!settings.enabled}
                  placeholder="#022C22"
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <TextField
                  type="color"
                  value={settings.asideText || "#000000"}
                  onChange={(e) =>
                    updateSettings({ asideText: e.target.value })
                  }
                  disabled={!settings.enabled}
                  variant="filled"
                  size="small"
                  sx={{
                    width: 48,
                    height: 40,
                    p: 0,
                    "& input": { p: 0.5, cursor: "pointer", height: 32 },
                  }}
                />
                <TextField
                  label="Texto Sidebar"
                  variant="filled"
                  size="small"
                  fullWidth
                  value={settings.asideText}
                  onChange={(e) =>
                    updateSettings({ asideText: e.target.value })
                  }
                  disabled={!settings.enabled}
                  placeholder="#F0FDF4"
                />
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
