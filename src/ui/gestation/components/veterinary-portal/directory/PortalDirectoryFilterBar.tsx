import React from "react";
import {
  Paper,
  Stack,
  TextField,
  InputAdornment,
  Box,
  Button,
  alpha,
} from "@mui/material";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";

export type DirectoryFilterStatus =
  | "ALL"
  | "PENDING_ACTIONS"
  | "WITH_ACCOUNT"
  | "WITH_TOKEN"
  | "WITHOUT_ACCOUNT";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: DirectoryFilterStatus;
  onFilterChange: (status: DirectoryFilterStatus) => void;
  totalRecordsCount: number;
  isDark: boolean;
}

const FILTER_ITEMS: { id: DirectoryFilterStatus; label: string }[] = [
  { id: "ALL", label: "Todos" },
  { id: "PENDING_ACTIONS", label: "Tareas pendientes" },
  { id: "WITH_ACCOUNT", label: "Con cuenta" },
  { id: "WITH_TOKEN", label: "Enlace activo" },
  { id: "WITHOUT_ACCOUNT", label: "Sin cuenta" },
];

export const PortalDirectoryFilterBar: React.FC<Props> = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  totalRecordsCount,
  isDark,
}) => {
  const active = isDark ? "#60a5fa" : "#0a6ed1";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
        bgcolor: isDark ? "#1e293b" : "#ffffff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={1.5}
      >
        {/* Search input */}
        <TextField
          size="small"
          placeholder="Buscar por profesional, matrícula (M.P.) o correo..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            flexGrow: 1,
            maxWidth: { md: 400 },
            "& .MuiOutlinedInput-root": {
              borderRadius: "6px",
              fontSize: "0.85rem",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FuseSvgIcon size={18} color="action">
                  heroicons-outline:magnifying-glass
                </FuseSvgIcon>
              </InputAdornment>
            ),
          }}
        />

        {/* Quick filters (segmented control pill) */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.25,
              p: 0.25,
              borderRadius: "8px",
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
              bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
            }}
          >
            {FILTER_ITEMS.map((item) => {
              const isSelected = filterStatus === item.id;
              return (
                <Button
                  key={item.id}
                  size="small"
                  onClick={() => onFilterChange(item.id)}
                  sx={{
                    minWidth: 0,
                    px: 1.25,
                    height: 26,
                    borderRadius: "6px",
                    fontSize: "0.72rem",
                    fontWeight: isSelected ? 600 : 500,
                    textTransform: "none",
                    lineHeight: 1.2,
                    color: isSelected ? active : isDark ? "#94a3b8" : "#64748b",
                    bgcolor: isSelected ? alpha(active, 0.12) : "transparent",
                    "&:hover": {
                      bgcolor: isSelected
                        ? alpha(active, 0.16)
                        : isDark
                          ? "rgba(255, 255, 255, 0.07)"
                          : "#edf1f5",
                    },
                    transition: "background-color 160ms ease, color 160ms ease",
                  }}
                >
                  {item.id === "ALL" ? `Todos (${totalRecordsCount})` : item.label}
                </Button>
              );
            })}
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default PortalDirectoryFilterBar;
