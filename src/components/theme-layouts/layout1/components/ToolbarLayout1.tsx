import Toolbar from "@mui/material/Toolbar";
import clsx from "clsx";
import { memo } from "react";
import NavbarToggleButton from "src/components/theme-layouts/components/navbar/NavbarToggleButton";
import themeOptions from "src/configs/themeOptions";
import _ from "lodash";
import LightDarkModeToggle from "src/components/LightDarkModeToggle";
import useFuseLayoutSettings from "@fuse/core/FuseLayout/useFuseLayoutSettings";
import AdjustFontSize from "../../components/AdjustFontSize";
import FullScreenToggle from "../../components/FullScreenToggle";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import NavigationShortcuts from "../../components/navigation/NavigationShortcuts";
import NavigationSearch from "../../components/navigation/NavigationSearch";
import QuickPanelToggleButton from "../../components/quickPanel/QuickPanelToggleButton";
import { Layout1ConfigDefaultsType } from "@/components/theme-layouts/layout1/Layout1Config";
import useThemeMediaQuery from "../../../../@fuse/hooks/useThemeMediaQuery";
import { AppBar, Divider, IconButton } from "@mui/material";
import ToolbarTheme from "src/contexts/ToolbarTheme";
import CompanySelector from "../../components/CompanySelector";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useNavigate } from "react-router";
import { useContrastTheme } from "@/contexts/ContrastThemeContext";

type ToolbarLayout1Props = {
  className?: string;
};

/**
 * The toolbar layout 1.
 */
function ToolbarLayout1(props: ToolbarLayout1Props) {
  const { className } = props;

  const settings = useFuseLayoutSettings();
  const config = settings.config as Layout1ConfigDefaultsType;
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));
  const navigate = useNavigate();
  const { settings: contrastSettings } = useContrastTheme();

  const isContrastActive = contrastSettings.enabled;

  return (
    <ToolbarTheme>
      <AppBar
        id="fuse-toolbar"
        className={clsx("relative z-20 flex", className)}
        sx={(theme) => ({
          backgroundColor:
            isContrastActive && contrastSettings.headerBg
              ? contrastSettings.headerBg
              : theme.vars.palette.background.default,
          color:
            isContrastActive && contrastSettings.headerText
              ? contrastSettings.headerText
              : theme.vars.palette.text.primary,
          ...(isContrastActive &&
            contrastSettings.headerText && {
              "& .MuiIconButton-root, & .MuiTypography-root, & .MuiSvgIcon-root, & svg":
                {
                  color: `${contrastSettings.headerText} !important`,
                },
            }),
          borderBottom: `1px solid ${theme.vars.palette.divider}`,
        })}
      >
        <Toolbar className="h-12 min-h-12 p-0 md:h-12 md:min-h-12">
          <div className="flex flex-1 items-center gap-2 px-2 md:px-3">
            {config.navbar.display && config.navbar.position === "left" && (
              <NavbarToggleButton />
            )}

            {!isMobile && <NavigationShortcuts />}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto px-2 py-0.5 md:px-3">
            <CompanySelector />
            {/* <LanguageSwitcher /> */}
            {/* <AdjustFontSize /> */}
            <FullScreenToggle />
            <LightDarkModeToggle
              lightTheme={_.find(themeOptions, { id: "Default" })}
              darkTheme={_.find(themeOptions, { id: "Default Dark" })}
            />
            {/* <NavigationSearch /> */}
            {/* <QuickPanelToggleButton /> */}

            <IconButton
              onClick={() => navigate("/settings")}
              className="h-8 w-8 p-0"
              size="small"
            >
              <FuseSvgIcon size={18}>heroicons-outline:cog</FuseSvgIcon>
            </IconButton>
          </div>

          {config.navbar.display && config.navbar.position === "right" && (
            <>
              {!isMobile && <NavbarToggleButton />}

              {isMobile && (
                <NavbarToggleButton className="h-8 w-8 p-0 sm:mx-2" />
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
    </ToolbarTheme>
  );
}

export default memo(ToolbarLayout1);
