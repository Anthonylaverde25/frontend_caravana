import { useState } from "react";
import {
  Box,
  MenuItem,
  CircularProgress,
  Typography,
  Button,
  Menu,
  alpha,
  useTheme,
} from "@mui/material";
import { useCompany } from "@/contexts/CompanyContext";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useContrastTheme } from "@/contexts/ContrastThemeContext";
import { isColorDark, getContrastSurface } from "@/utils/colorUtils";

const CompanySelector = () => {
  const theme = useTheme();
  const { activeCompanyId, setActiveCompanyId, companies, loading, error } =
    useCompany();
  const { settings: contrastSettings } = useContrastTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const isContrastActive = contrastSettings.enabled;

  // Compute whether header is perceptually dark across all presets & themes
  const isHeaderDark =
    isContrastActive && contrastSettings.headerBg
      ? isColorDark(contrastSettings.headerBg)
      : theme.palette.mode === "dark";

  // Text color follows headerText if set, otherwise adapts to background darkness
  const headerTextColor =
    isContrastActive && contrastSettings.headerText
      ? contrastSettings.headerText
      : isHeaderDark
      ? "#ffffff"
      : theme.palette.text.primary;

  const headerSubtextColor =
    isContrastActive && contrastSettings.headerText
      ? alpha(contrastSettings.headerText, 0.72)
      : isHeaderDark
      ? "rgba(255, 255, 255, 0.7)"
      : theme.palette.text.secondary;

  const primaryAccent =
    contrastSettings.primaryButtonBg || theme.palette.primary.main;

  const surface = getContrastSurface(isHeaderDark, open);
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
                className="company-badge"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: "6px",
                  backgroundColor: isHeaderDark
                    ? "rgba(255, 255, 255, 0.16)"
                    : alpha(primaryAccent, 0.12),
                  color: isHeaderDark ? headerTextColor : primaryAccent,
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
                  color: `${headerSubtextColor} !important`,
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
              cursor: "pointer",
              transition: "all 0.15s ease-in-out",
              border: `1px solid ${surface.border}`,
              backgroundColor: surface.bg,
              boxShadow: surface.shadow,
              "&:hover": {
                borderColor: surface.hoverBorder,
                backgroundColor: surface.hoverBg,
                boxShadow: isHeaderDark
                  ? "0 3px 8px rgba(0, 0, 0, 0.35)"
                  : "0 2px 6px rgba(0, 0, 0, 0.1)",
                "& .company-badge": {
                  backgroundColor: isHeaderDark
                    ? "rgba(255, 255, 255, 0.24)"
                    : alpha(primaryAccent, 0.2),
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
                  color: `${headerTextColor} !important`,
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
                  className="company-renspa"
                  sx={{
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    lineHeight: 1,
                    letterSpacing: "0.02em",
                    color: `${headerSubtextColor} !important`,
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
                minWidth: 230,
                borderRadius: "12px",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                border: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography
                variant="overline"
                sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: "0.05em" }}
              >
                Haciendas & Empresas
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
                    backgroundColor: alpha(primaryAccent, 0.1),
                    fontWeight: 700,
                    "&:hover": {
                      backgroundColor: alpha(primaryAccent, 0.16),
                    },
                  },
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: company.id === activeCompanyId ? 700 : 500,
                      color: company.id === activeCompanyId ? primaryAccent : "inherit",
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
