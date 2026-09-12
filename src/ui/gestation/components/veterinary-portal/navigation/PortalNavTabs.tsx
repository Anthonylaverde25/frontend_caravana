import React from "react";
import { useLocation, useNavigate } from "react-router";
import { Box, Button, Chip, Stack, useTheme, alpha } from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

export type PortalTabKey =
  | "home"
  | "evaluation"
  | "acts"
  | "receptions"
  | "tubes"
  | "history"
  | "access";

export interface PortalNavTabsProps {
  basePath: string;
  pendingCount?: number;
  actsCount?: number;
  receptionsCount?: number;
  tubesCount?: number;
  showAccessTab?: boolean;
}

/**
 * Enterprise Portal Navigation Tabs (SAP Fiori Horizon / ALV Standards).
 * Integrated directly below the ShellBar as a single full-width header unit.
 * No gaps, no underline hover effect, clean segmented pill design.
 */
export const PortalNavTabs: React.FC<PortalNavTabsProps> = ({
  basePath,
  pendingCount = 0,
  actsCount = 0,
  receptionsCount = 0,
  tubesCount = 0,
  showAccessTab = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab: PortalTabKey = (() => {
    const p = location.pathname;
    if (p.includes("/home")) return "home";
    if (p.includes("/actas")) return "acts";
    if (p.includes("/envios")) return "receptions";
    if (p.includes("/tubos")) return "tubes";
    if (p.includes("/historial")) return "history";
    if (p.includes("/accesos")) return "access";
    if (p.includes("/evaluacion")) return "evaluation";
    return "home";
  })();

  const tabPaths: Record<PortalTabKey, string> = {
    home: "home",
    evaluation: "evaluacion",
    acts: "actas",
    receptions: "envios",
    tubes: "tubos",
    history: "historial",
    access: "accesos",
  };

  const handleTabClick = (tab: PortalTabKey) => {
    navigate(`${basePath}/${tabPaths[tab]}`);
  };

  const tabs: {
    key: PortalTabKey;
    label: string;
    icon: string;
    badge?: number | string;
    show?: boolean;
  }[] = [
    {
      key: "home",
      label: "Home",
      icon: "heroicons-outline:home",
      show: true,
    },
    {
      key: "evaluation",
      label: "Carga de Evaluación Directa",
      icon: "heroicons-outline:clipboard-document-list",
      badge: pendingCount > 0 ? `${pendingCount} pendientes` : undefined,
      show: true,
    },
    {
      key: "acts",
      label: "Mis Actas y Protocolos",
      icon: "heroicons-outline:document-text",
      badge: actsCount,
      show: true,
    },
    {
      key: "receptions",
      label: "Envío de Muestras",
      icon: "heroicons-outline:truck",
      badge: receptionsCount,
      show: true,
    },
    {
      key: "tubes",
      label: "Tubos en Custodia",
      icon: "heroicons-outline:beaker",
      badge: tubesCount,
      show: true,
    },
    {
      key: "history",
      label: "Historial de Laboratorio",
      icon: "heroicons-outline:archive-box",
      show: true,
    },
    {
      key: "access",
      label: "Gestión de Accesos",
      icon: "heroicons-outline:key",
      show: showAccessTab,
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: isDark
          ? alpha(theme.palette.background.paper, 0.98)
          : "background.paper",
        m: 0,
        p: 0,
        borderRadius: 0,
        boxShadow: isDark
          ? "0 2px 4px rgba(0,0,0,0.25)"
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <Box
        sx={{
          maxWidth: 1720,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          py: 0.75,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", py: 0.25 }}>
          {tabs
            .filter((t) => t.show !== false)
            .map((tab) => {
              const isSelected = currentTab === tab.key;
              return (
                <Button
                  key={tab.key}
                  size="small"
                  onClick={() => handleTabClick(tab.key)}
                  startIcon={<FuseSvgIcon size={16}>{tab.icon}</FuseSvgIcon>}
                  disableRipple={false}
                  sx={{
                    minWidth: 0,
                    px: 1.75,
                    py: 0.75,
                    fontSize: "0.82rem",
                    fontWeight: isSelected ? 700 : 500,
                    textTransform: "none",
                    borderRadius: "6px",
                    color: isSelected
                      ? isDark
                        ? "success.light"
                        : "success.dark"
                      : "text.secondary",
                    bgcolor: isSelected
                      ? isDark
                        ? alpha(theme.palette.success.main, 0.16)
                        : "#ecfdf5"
                      : "transparent",
                    border: "1px solid",
                    borderColor: isSelected
                      ? isDark
                        ? alpha(theme.palette.success.main, 0.3)
                        : "#a7f3d0"
                      : "transparent",
                    borderBottom: "1px solid",
                    borderBottomColor: isSelected
                      ? isDark
                        ? alpha(theme.palette.success.main, 0.3)
                        : "#a7f3d0"
                      : "transparent",
                    textDecoration: "none !important",
                    transition: "all 0.15s ease-in-out",
                    "&:hover": {
                      textDecoration: "none !important",
                      bgcolor: isSelected
                        ? isDark
                          ? alpha(theme.palette.success.main, 0.22)
                          : "#e8f5e9"
                        : isDark
                          ? alpha(theme.palette.action.hover, 0.08)
                          : "rgba(0, 0, 0, 0.04)",
                    },
                    "& .MuiButton-startIcon": {
                      mr: 1,
                    },
                  }}
                >
                  {tab.label}
                  {tab.badge !== undefined && (
                    <Chip
                      label={tab.badge}
                      size="small"
                      sx={{
                        ml: 1,
                        height: 18,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        bgcolor: isSelected
                          ? "success.light"
                          : "action.selected",
                        color: isSelected
                          ? "success.contrastText"
                          : "text.secondary",
                      }}
                    />
                  )}
                </Button>
              );
            })}
        </Stack>
      </Box>
    </Box>
  );
};

export default PortalNavTabs;
