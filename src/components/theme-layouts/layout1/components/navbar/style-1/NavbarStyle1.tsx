import { styled, Theme } from "@mui/material/styles";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { useEffect, useRef } from "react";
import useFuseLayoutSettings from "@fuse/core/FuseLayout/useFuseLayoutSettings";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import NavbarStyle1Content from "./NavbarStyle1Content";
import { Layout1ConfigDefaultsType } from "@/components/theme-layouts/layout1/Layout1Config";
import { useNavbarContext } from "@/components/theme-layouts/components/navbar/contexts/NavbarContext/useNavbarContext";

const navbarWidth = 280;
const navbarFoldedWidth = 64;
// Delay before a folded navbar unfolds on hover, so crossing it does not open it.
const hoverOpenDelay = 150;

type StyledNavBarProps = {
  theme?: Theme;
  open: boolean;
  position: string;
};

const StyledNavBar = styled("div")<StyledNavBarProps>(({ theme, open }) => ({
  minWidth: open ? navbarWidth : navbarFoldedWidth,
  width: open ? navbarWidth : navbarFoldedWidth,
  maxWidth: open ? navbarWidth : navbarFoldedWidth,
  transition: theme.transitions.create(["width", "min-width", "max-width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter,
  }),
  overflowX: "hidden",
}));

const StyledNavBarMobile = styled(SwipeableDrawer)(() => ({
  "& .MuiDrawer-paper": {
    minWidth: navbarWidth,
    width: navbarWidth,
    maxWidth: navbarWidth,
  },
}));

/**
 * The navbar style 1.
 */
function NavbarStyle1() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  const settings = useFuseLayoutSettings();
  const config = settings.config as Layout1ConfigDefaultsType;

  const {
    isOpen: isNavbarOpen,
    mobileOpen: isNavbarMobileOpen,
    reset: resetNavbar,
    closeMobileNavbar,
    openNavbar,
    closeNavbar,
  } = useNavbarContext();

  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Only a navbar unfolded by hover folds back on leave; one opened with the toolbar button stays open.
  const isOpenedByHover = useRef(false);

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  // Hovering a folded navbar unfolds it exactly as the toolbar button does.
  const handleMouseEnter = () => {
    if (isNavbarOpen) {
      return;
    }

    clearHoverTimer();
    hoverTimer.current = setTimeout(() => {
      isOpenedByHover.current = true;
      openNavbar();
    }, hoverOpenDelay);
  };

  const handleMouseLeave = () => {
    clearHoverTimer();

    if (isOpenedByHover.current) {
      isOpenedByHover.current = false;
      closeNavbar();
    }
  };

  useEffect(() => {
    return () => {
      clearHoverTimer();
      resetNavbar();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {!isMobile && (
        <StyledNavBar
          className="sticky top-0 z-20 h-screen flex-auto shrink-0 flex-col"
          open={isNavbarOpen}
          position={config.navbar.position}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <NavbarStyle1Content />
        </StyledNavBar>
      )}

      {isMobile && (
        <StyledNavBarMobile
          classes={{
            paper: "flex-col flex-auto h-full",
          }}
          anchor={config.navbar.position as "left" | "top" | "right" | "bottom"}
          variant="temporary"
          open={isNavbarMobileOpen}
          onClose={() => closeMobileNavbar()}
          onOpen={() => {}}
          disableSwipeToOpen
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          <NavbarStyle1Content />
        </StyledNavBarMobile>
      )}
    </>
  );
}

export default NavbarStyle1;
