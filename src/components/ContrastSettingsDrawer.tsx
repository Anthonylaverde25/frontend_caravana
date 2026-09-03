import React from "react";
import {
  Drawer,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  Divider,
  Stack,
  Chip,
  TextField,
  Paper,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import {
  useContrastTheme,
  ContrastPreset,
} from "@/contexts/ContrastThemeContext";

interface ContrastSettingsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const ContrastSettingsDrawer: React.FC<ContrastSettingsDrawerProps> = ({
  open,
  onClose,
}) => {
  const {
    settings,
    updateSettings,
    applyPreset,
    resetToDefault,
    toggleEnabled,
  } = useContrastTheme();

  const presetsList: { id: ContrastPreset; label: string; icon: string }[] = [
    { id: "default", label: "Predeterminado", icon: "lucide:rotate-ccw" },
    {
      id: "high-contrast-dark",
      label: "Alto Contraste Oscuro",
      icon: "lucide:moon",
    },
    {
      id: "high-contrast-light",
      label: "Alto Contraste Claro",
      icon: "lucide:sun",
    },
    { id: "sap-fiori", label: "SAP Fiori Azul", icon: "lucide:layers" },
    { id: "emerald", label: "Verde Esmeralda", icon: "lucide:tree-pine" },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 380 },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FuseSvgIcon color="primary">lucide:palette</FuseSvgIcon>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
            Contraste & Colores
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <FuseSvgIcon>lucide:x</FuseSvgIcon>
        </IconButton>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
        {/* Enable/Disable Toggle */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Modo Contraste & Colores
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={settings.enabled}
                onChange={toggleEnabled}
                color="primary"
              />
            }
            label={settings.enabled ? "Activo" : "Inactivo"}
            labelPlacement="start"
            sx={{ m: 0 }}
          />
        </Paper>

        {/* SAP Fiori Section Header: Presets */}
        <Box
          sx={{
            mb: 1.5,
            pl: 1,
            borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
          >
            Presets Rápidos
          </Typography>
        </Box>

        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
          {presetsList.map((p) => {
            const isSelected = settings.preset === p.id && settings.enabled;
            return (
              <Chip
                key={p.id}
                label={p.label}
                onClick={() => applyPreset(p.id)}
                color={isSelected ? "primary" : "default"}
                variant={isSelected ? "filled" : "outlined"}
                icon={<FuseSvgIcon size={16}>{p.icon}</FuseSvgIcon>}
                sx={{ borderRadius: "6px", fontWeight: isSelected ? 600 : 400 }}
              />
            );
          })}
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        {/* SAP Fiori Section Header: Custom Color Pickers */}
        <Box
          sx={{
            mb: 2,
            pl: 1,
            borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}
          >
            Personalización de Colores
          </Typography>
        </Box>

        <Stack gap={2.5}>
          {/* Action Buttons Section */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: "8px",
              backgroundColor: (theme) => theme.palette.background.paper,
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
              <FuseSvgIcon size={18}>lucide:mouse-pointer-click</FuseSvgIcon> Botones
              (Principales & Secundarios)
            </Typography>

            <Stack gap={1.5}>
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
                    width: 50,
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
                    width: 50,
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

              {/* Live Preview Bar */}
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
              backgroundColor: (theme) => theme.palette.background.paper,
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
              <FuseSvgIcon size={18}>lucide:panel-top</FuseSvgIcon> Header
              (Toolbar)
            </Typography>

            <Stack gap={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <TextField
                  type="color"
                  value={settings.headerBg || "#ffffff"}
                  onChange={(e) => updateSettings({ headerBg: e.target.value })}
                  disabled={!settings.enabled}
                  variant="filled"
                  size="small"
                  sx={{
                    width: 50,
                    height: 40,
                    p: 0,
                    "& input": { p: 0.5, cursor: "pointer", height: 32 },
                  }}
                />
                <TextField
                  label="Color de Fondo"
                  variant="filled"
                  size="small"
                  fullWidth
                  value={settings.headerBg}
                  onChange={(e) => updateSettings({ headerBg: e.target.value })}
                  disabled={!settings.enabled}
                  placeholder="#0A6ED1"
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
                    width: 50,
                    height: 40,
                    p: 0,
                    "& input": { p: 0.5, cursor: "pointer", height: 32 },
                  }}
                />
                <TextField
                  label="Color de Fuente/Texto"
                  variant="filled"
                  size="small"
                  fullWidth
                  value={settings.headerText}
                  onChange={(e) =>
                    updateSettings({ headerText: e.target.value })
                  }
                  disabled={!settings.enabled}
                  placeholder="#FFFFFF"
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
              backgroundColor: (theme) => theme.palette.background.paper,
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
              <FuseSvgIcon size={18}>lucide:panel-left</FuseSvgIcon> Aside
              (Sidebar/Navbar)
            </Typography>

            <Stack gap={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <TextField
                  type="color"
                  value={settings.asideBg || "#ffffff"}
                  onChange={(e) => updateSettings({ asideBg: e.target.value })}
                  disabled={!settings.enabled}
                  variant="filled"
                  size="small"
                  sx={{
                    width: 50,
                    height: 40,
                    p: 0,
                    "& input": { p: 0.5, cursor: "pointer", height: 32 },
                  }}
                />
                <TextField
                  label="Color de Fondo"
                  variant="filled"
                  size="small"
                  fullWidth
                  value={settings.asideBg}
                  onChange={(e) => updateSettings({ asideBg: e.target.value })}
                  disabled={!settings.enabled}
                  placeholder="#1D232A"
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
                    width: 50,
                    height: 40,
                    p: 0,
                    "& input": { p: 0.5, cursor: "pointer", height: 32 },
                  }}
                />
                <TextField
                  label="Color de Fuente/Texto"
                  variant="filled"
                  size="small"
                  fullWidth
                  value={settings.asideText}
                  onChange={(e) =>
                    updateSettings({ asideText: e.target.value })
                  }
                  disabled={!settings.enabled}
                  placeholder="#F4F4F4"
                />
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>

      {/* Action Toolbar */}
      <Box
        sx={{
          p: 2,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: (theme) => theme.palette.background.default,
          display: "flex",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={resetToDefault}
          fullWidth
          sx={{ borderRadius: "6px" }}
          startIcon={<FuseSvgIcon size={16}>lucide:rotate-ccw</FuseSvgIcon>}
        >
          Restablecer
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onClose}
          fullWidth
          sx={{ borderRadius: "6px" }}
        >
          Aplicar
        </Button>
      </Box>
    </Drawer>
  );
};
