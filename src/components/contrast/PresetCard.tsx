import React from "react";
import { Paper, Box, Typography, Stack, Tooltip } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { ContrastPreset } from "@/contexts/ContrastThemeContext";

export interface PresetItemData {
  id: ContrastPreset;
  label: string;
  subtitle: string;
  icon: string;
  headerColor: string;
  asideColor: string;
  btnColor: string;
}

interface PresetCardProps {
  preset: PresetItemData;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (id: ContrastPreset) => void;
}

export const PresetCard: React.FC<PresetCardProps> = ({
  preset,
  isSelected,
  disabled,
  onSelect,
}) => {
  return (
    <Paper
      variant="outlined"
      onClick={() => !disabled && onSelect(preset.id)}
      sx={{
        p: 1.5,
        borderRadius: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        borderWidth: isSelected ? 2 : 1,
        borderColor: (theme) =>
          isSelected ? theme.palette.primary.main : theme.palette.divider,
        backgroundColor: (theme) =>
          isSelected
            ? `${theme.palette.primary.main}0D`
            : theme.palette.background.paper,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: (theme) =>
            disabled ? theme.palette.divider : theme.palette.primary.main,
          transform: disabled ? "none" : "translateY(-1px)",
          boxShadow: disabled ? 0 : 1,
        },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
      }}
    >
      {/* Left: Icon & Text */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: (theme) =>
              isSelected ? `${theme.palette.primary.main}20` : theme.palette.action.hover,
            color: (theme) =>
              isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
            flexShrink: 0,
          }}
        >
          <FuseSvgIcon size={18}>{preset.icon}</FuseSvgIcon>
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: isSelected ? 700 : 600,
              color: isSelected ? "primary.main" : "text.primary",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {preset.label}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              lineHeight: 1.2,
              fontSize: "0.72rem",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {preset.subtitle}
          </Typography>
        </Box>
      </Box>

      {/* Right: Color Swatches & Active Check */}
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
        {/* Swatch Trio: Header, Aside, Button */}
        <Tooltip title="Barra Superior / Header">
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: preset.headerColor,
              border: "1px solid rgba(0,0,0,0.15)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)",
            }}
          />
        </Tooltip>
        <Tooltip title="Barra Lateral / Sidebar">
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: preset.asideColor,
              border: "1px solid rgba(0,0,0,0.15)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)",
            }}
          />
        </Tooltip>
        <Tooltip title="Botón de Acción">
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: preset.btnColor,
              border: "1px solid rgba(0,0,0,0.15)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)",
            }}
          />
        </Tooltip>

        {isSelected && (
          <Box
            sx={{
              ml: 0.5,
              width: 18,
              height: 18,
              borderRadius: "50%",
              backgroundColor: "primary.main",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FuseSvgIcon size={12}>lucide:check</FuseSvgIcon>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};
