import React, { useState } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import clsx from "clsx";
import VirtualAssistantDrawer from "@/ui/assistant/VirtualAssistantDrawer";

export type VirtualAssistantNavButtonProps = {
  className?: string;
  onlyAvatar?: boolean;
  dense?: boolean;
  onClick?: () => void;
};

/**
 * Navigation button for launching the Virtual Assistant.
 * Designed with the exact dimensions of UserMenu, without an avatar, and enhanced with darker contrasting tones.
 */
export function VirtualAssistantNavButton(
  props: VirtualAssistantNavButtonProps,
) {
  const { className = "", onlyAvatar = false, dense = false, onClick } = props;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      setDrawerOpen(true);
    }
  };

  const buttonContent = (
    <Button
      className={clsx(
        "virtual-assistant-btn flex shrink-0 items-center transition-all",
        onlyAvatar
          ? "min-w-0 p-0 justify-center"
          : dense
            ? "h-8 min-h-8 gap-2 px-2 justify-start"
            : "h-14 min-h-14 gap-3 px-3.5 justify-start",
        className,
      )}
      onClick={handleClick}
      color="inherit"
      sx={(theme) => ({
        textTransform: "none",
        borderRadius: "10px",
        // Darker tone & elevated contrast relative to sidebar surface
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(0, 0, 0, 0.45)"
            : "rgba(15, 23, 42, 0.08)",
        border: `1px solid ${
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.10)"
            : "rgba(15, 23, 42, 0.14)"
        }`,
        boxShadow:
          theme.palette.mode === "dark"
            ? "inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 4px rgba(0, 0, 0, 0.3)"
            : "0 1px 3px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
        "&:hover": {
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(0, 0, 0, 0.65)"
              : "rgba(15, 23, 42, 0.14)",
          borderColor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.20)"
              : "rgba(15, 23, 42, 0.24)",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 4px 12px rgba(0, 0, 0, 0.45)"
              : "0 3px 8px rgba(15, 23, 42, 0.12)",
        },
      })}
    >
      {/* Assistant Icon (clean icon without avatar) */}
      <FuseSvgIcon
        size={onlyAvatar ? 22 : dense ? 18 : 22}
        className="shrink-0"
        sx={(theme) => ({
          color:
            theme.palette.mode === "dark" ? "primary.light" : "primary.main",
        })}
      >
        lucide:bot
      </FuseSvgIcon>

      {/* Label & Description (visible when expanded) */}
      {!onlyAvatar && (
        <>
          <div
            className={clsx(
              "flex flex-auto flex-col text-left",
              dense ? "max-w-[120px]" : "gap-0.5",
            )}
          >
            <Typography
              component="span"
              className={clsx(
                "flex truncate leading-tight font-semibold tracking-tight",
                dense ? "text-xs" : "text-sm",
              )}
              sx={{ color: "text.primary" }}
            >
              Asistente Virtual
            </Typography>
            {!dense && (
              <Typography
                className="flex leading-tight font-medium tracking-tight text-xs"
                color="text.secondary"
              >
                Ganadero AI • En línea
              </Typography>
            )}
          </div>

          <div className="flex shrink-0 items-center">
            <Chip
              label="IA"
              size="small"
              sx={{
                fontSize: "0.65rem",
                height: 18,
                fontWeight: 700,
                letterSpacing: "0.05em",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(16, 185, 129, 0.2)"
                    : "rgba(15, 23, 42, 0.1)",
                color: (theme) =>
                  theme.palette.mode === "dark" ? "#34D399" : "#0F172A",
                borderRadius: "4px",
              }}
            />
          </div>
        </>
      )}
    </Button>
  );

  return (
    <>
      {onlyAvatar ? (
        <Tooltip title="Asistente Virtual" placement="right" arrow>
          {buttonContent}
        </Tooltip>
      ) : (
        buttonContent
      )}

      <VirtualAssistantDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}

export default VirtualAssistantNavButton;
