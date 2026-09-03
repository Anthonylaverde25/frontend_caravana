import FuseScrollbars from "@fuse/core/FuseScrollbars";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import { memo } from "react";
import Navigation from "src/components/theme-layouts/components/navigation/Navigation";
import UserMenu from "src/components/theme-layouts/components/UserMenu";
import Logo from "../../../../components/Logo";
import { useContrastTheme } from "@/contexts/ContrastThemeContext";
import { Box } from "@mui/material";
import { useNavbarContext } from "@/components/theme-layouts/components/navbar/contexts/NavbarContext/useNavbarContext";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";

const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.vars.palette.background.default,
  color: theme.vars.palette.text.primary,
  "& ::-webkit-scrollbar-thumb": {
    boxShadow: `inset 0 0 0 20px ${"rgba(255, 255, 255, 0.24)"}`,
    ...theme.applyStyles("light", {
      boxShadow: `inset 0 0 0 20px ${"rgba(0, 0, 0, 0.24)"}`,
    }),
  },
  "& ::-webkit-scrollbar-thumb:active": {
    boxShadow: `inset 0 0 0 20px ${"rgba(255, 255, 255, 0.37)"}`,
    ...theme.applyStyles("light", {
      boxShadow: `inset 0 0 0 20px ${"rgba(0, 0, 0, 0.37)"}`,
    }),
  },
}));

const StyledContent = styled(FuseScrollbars)(() => ({
  overscrollBehavior: "contain",
  overflowX: "hidden",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  backgroundRepeat: "no-repeat",
  backgroundSize: "100% 40px, 100% 10px",
  backgroundAttachment: "local, scroll",
}));

type NavbarStyle1ContentProps = {
  className?: string;
};

/**
 * The navbar style 1 content.
 */
function NavbarStyle1Content(props: NavbarStyle1ContentProps) {
  const { className = "" } = props;
  const { settings: contrastSettings } = useContrastTheme();
  const { isOpen } = useNavbarContext();
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  const isContracted = !isOpen && !isMobile;
  const isContrastActive = contrastSettings.enabled;

  return (
    <Root
      className={clsx(
        "flex h-full flex-auto flex-col overflow-hidden",
        className,
      )}
      sx={(theme) => ({
        backgroundColor:
          isContrastActive && contrastSettings.asideBg
            ? contrastSettings.asideBg
            : theme.vars.palette.background.default,
        color:
          isContrastActive && contrastSettings.asideText
            ? contrastSettings.asideText
            : theme.vars.palette.text.primary,
        ...(isContrastActive &&
          contrastSettings.asideText && {
            "& .MuiTypography-root, & .fuse-list-item-text, & .fuse-list-item-icon, & .MuiSvgIcon-root, & svg":
              {
                color: `${contrastSettings.asideText} !important`,
              },
          }),
        ...(isContracted && {
          "& .logo-text, & .logo-badge": {
            display: "none !important",
          },
          "& .logo-icon": {
            width: "36px !important",
            height: "36px !important",
            margin: "0 auto !important",
          },
          "& .fuse-list-item-title, & .fuse-list-item-subtitle, & .arrow-icon, & .collapse-children, & .MuiChip-root":
            {
              display: "none !important",
            },
          "& .navigation": {
            width: "100% !important",
            padding: "0 !important",
          },
          "& .fuse-list-item, & .MuiButton-root": {
            justifyContent: "center !important",
            alignItems: "center !important",
            padding: "0 !important",
            minWidth: "44px !important",
            maxWidth: "44px !important",
            width: "44px !important",
            height: "44px !important",
            minHeight: "44px !important",
            margin: "4px auto !important",
            borderRadius: "8px !important",
          },
          "& .fuse-list-item-icon": {
            margin: "0 !important",
            padding: "0 !important",
            display: "flex !important",
            alignItems: "center !important",
            justifyContent: "center !important",
            fontSize: "22px !important",
          },
          "& .MuiCollapse-root": {
            paddingLeft: "0 !important",
            "& > .MuiCollapse-wrapper": {
              borderLeft: "none !important",
              "& > .MuiCollapse-wrapperInner": {
                paddingLeft: "0 !important",
              },
            },
          },
        }),
      })}
    >
      <div
        className={clsx(
          "flex h-12 shrink-0 flex-row items-center px-4 md:h-12 transition-all overflow-hidden",
          isContracted && "justify-center px-0 w-full",
        )}
      >
        <Logo className={clsx(isContracted && "justify-center gap-0 w-full")} />
      </div>

      <StyledContent
        className="flex min-h-0 flex-1 flex-col"
        option={{ suppressScrollX: true, wheelPropagation: false }}
      >
        <Navigation layout="vertical" />
      </StyledContent>

      <div
        className={clsx(
          "flex flex-col gap-3 p-3",
          isContracted && "p-1 items-center justify-center w-full",
        )}
      >
        <UserMenu className="w-full" onlyAvatar={isContracted} />
      </div>
    </Root>
  );
}

export default memo(NavbarStyle1Content);
