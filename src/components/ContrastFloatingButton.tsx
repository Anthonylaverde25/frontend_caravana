import React, { useState } from "react";
import { Fab, Tooltip, Badge, Zoom } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useContrastTheme } from "@/contexts/ContrastThemeContext";
import { ContrastSettingsDrawer } from "./ContrastSettingsDrawer";

export const ContrastFloatingButton: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { settings } = useContrastTheme();

  return (
    <>
      <Zoom in={true}>
        <Tooltip title="Contraste Header & Aside" placement="left">
          <Fab
            color={settings.enabled ? "primary" : "default"}
            size="medium"
            aria-label="Ajustes de Contraste"
            onClick={() => setDrawerOpen(true)}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 1200,
              boxShadow: (theme) =>
                settings.enabled
                  ? `0 0 16px ${theme.palette.primary.main}80`
                  : "0 4px 12px rgba(0,0,0,0.15)",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.08)",
              },
            }}
          >
            <Badge
              color="success"
              variant="dot"
              invisible={!settings.enabled}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <FuseSvgIcon color={settings.enabled ? "inherit" : "action"}>
                lucide:contrast
              </FuseSvgIcon>
            </Badge>
          </Fab>
        </Tooltip>
      </Zoom>

      <ContrastSettingsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};
