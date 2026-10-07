import { useState } from "react";
import {
  Box,
  MenuItem,
  CircularProgress,
  Typography,
  Button,
  Menu,
  alpha,
} from "@mui/material";
import { useCompany } from "@/contexts/CompanyContext";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useContrastTheme } from "@/contexts/ContrastThemeContext";

const CompanySelector = () => {
  const { activeCompanyId, setActiveCompanyId, companies, loading, error } =
    useCompany();
  const { settings: contrastSettings } = useContrastTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const isContrastActive = contrastSettings.enabled;
  const headerTextColor =
    isContrastActive && contrastSettings.headerText
      ? contrastSettings.headerText
      : "inherit";

  const activeCompany = companies.find((c) => c.id === activeCompanyId);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (id: number) => {
    setActiveCompanyId(id);
    handleClose();
  };

  if (error) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", px: 2 }}>
        <Typography color="error" variant="caption">
          Error cargando empresas
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {loading ? (
        <CircularProgress size={16} sx={{ mx: 2 }} />
      ) : companies.length > 0 ? (
        <>
          <Button
            id="company-selector-button"
            aria-controls={open ? "company-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            startIcon={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: "6px",
                  backgroundColor: (theme) =>
                    isContrastActive
                      ? "rgba(255, 255, 255, 0.18)"
                      : alpha(theme.palette.primary.main, 0.12),
                  color: isContrastActive ? "inherit" : "primary.main",
                  transition: "all 0.15s ease",
                }}
              >
                <FuseSvgIcon size={14}>
                  heroicons-outline:building-office-2
                </FuseSvgIcon>
              </Box>
            }
            endIcon={
              <FuseSvgIcon
                size={14}
                className="transition-transform duration-200"
                sx={{
                  transform: open ? "rotate(180deg)" : "none",
                  color: isContrastActive ? headerTextColor : "text.secondary",
                }}
              >
                heroicons-mini:chevron-down
              </FuseSvgIcon>
            }
            sx={{
              textTransform: "none",
              py: 0.5,
              px: 1.25,
              height: 34,
              borderRadius: "8px",
              border: (theme) =>
                `1px solid ${
                  isContrastActive
                    ? "rgba(255, 255, 255, 0.28)"
                    : open
                    ? theme.palette.primary.main
                    : theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.18)"
                    : "rgba(0, 0, 0, 0.15)"
                }`,
              backgroundColor: (theme) =>
                isContrastActive
                  ? open
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(255, 255, 255, 0.1)"
                  : open
                  ? alpha(theme.palette.primary.main, 0.12)
                  : theme.palette.mode === "dark"
                  ? alpha(theme.palette.common.white, 0.06)
                  : alpha(theme.palette.action.hover, 0.65),
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "none"
                  : "0 1px 2px rgba(0, 0, 0, 0.05)",
              transition: "all 0.15s ease-in-out",
              "&:hover": {
                borderColor: (theme) =>
                  isContrastActive
                    ? "rgba(255, 255, 255, 0.5)"
                    : theme.palette.primary.main,
                backgroundColor: (theme) =>
                  isContrastActive
                    ? "rgba(255, 255, 255, 0.18)"
                    : alpha(theme.palette.primary.main, 0.08),
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
                "& .MuiBox-root": {
                  backgroundColor: (theme) =>
                    isContrastActive
                      ? "rgba(255, 255, 255, 0.25)"
                      : alpha(theme.palette.primary.main, 0.2),
                },
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
                mr: 0.5,
              }}
            >
              <Typography
                component="span"
                sx={{
                  fontWeight: 700,
                  fontSize: 12.5,
                  lineHeight: 1.2,
                  color: isContrastActive ? headerTextColor : "text.primary",
                  maxWidth: { xs: 130, sm: 190, md: 240 },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {activeCompany?.name || "Seleccionar Empresa"}
              </Typography>
              {activeCompany?.renspa && (
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    lineHeight: 1,
                    letterSpacing: "0.02em",
                    color: isContrastActive
                      ? "rgba(255, 255, 255, 0.75)"
                      : "text.secondary",
                    maxWidth: { xs: 120, sm: 170 },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activeCompany.renspa}
                </Typography>
              )}
            </Box>
          </Button>
          <Menu
            id="company-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "company-selector-button",
            }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 220,
                borderRadius: "12px",
                boxShadow:
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                border: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography
                variant="overline"
                sx={{ fontWeight: 800, color: "text.secondary" }}
              >
                Mis Empresas
              </Typography>
            </Box>
            {companies.map((company) => (
              <MenuItem
                key={company.id}
                onClick={() => handleSelect(company.id)}
                selected={company.id === activeCompanyId}
                sx={{
                  py: 1.5,
                  px: 2,
                  mx: 1,
                  borderRadius: "8px",
                  mb: 0.5,
                  "&.Mui-selected": {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.08),
                    fontWeight: 700,
                    "&:hover": {
                      backgroundColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.12),
                    },
                  },
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: company.id === activeCompanyId ? 700 : 500,
                    }}
                  >
                    {company.name}
                  </Typography>
                  {company.renspa && (
                    <Typography variant="caption" color="text.secondary">
                      {company.renspa}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Menu>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
          Sin empresas
        </Typography>
      )}
    </Box>
  );
};

export default CompanySelector;
