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
  Paper,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useContrastTheme } from "@/contexts/ContrastThemeContext";
import { PresetSelector } from "./contrast/PresetSelector";
import { ColorCustomizer } from "./contrast/ColorCustomizer";

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

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 420 },
          display: "flex",
          flexDirection: "column",
          boxShadow: 8,
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
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: (theme) => `${theme.palette.primary.main}18`,
              color: "primary.main",
            }}
          >
            <FuseSvgIcon size={20}>lucide:palette</FuseSvgIcon>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.2 }}>
              Contraste & Paletas
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
              Personalización visual del entorno de trabajo
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <FuseSvgIcon size={18}>lucide:x</FuseSvgIcon>
        </IconButton>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>
        {/* Enable/Disable Toggle Card */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: (theme) =>
              settings.enabled
                ? `${theme.palette.primary.main}0A`
                : theme.palette.background.paper,
            borderColor: (theme) =>
              settings.enabled ? `${theme.palette.primary.main}40` : theme.palette.divider,
            transition: "all 0.2s ease-in-out",
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Modo Contraste & Paletas
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {settings.enabled
                ? "Aplicando diseño seleccionado a la interfaz"
                : "Se utilizan los estilos base del sistema"}
            </Typography>
          </Box>
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

        {/* Preset Selector with Visual Swatches */}
        <PresetSelector
          currentPreset={settings.preset}
          enabled={settings.enabled}
          onSelect={(preset) => applyPreset(preset)}
        />

        <Divider sx={{ my: 3 }} />

        {/* Collapsible Manual Fine-Tuning */}
        <ColorCustomizer
          settings={settings}
          updateSettings={updateSettings}
        />
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
          Listo
        </Button>
      </Box>
    </Drawer>
  );
};
