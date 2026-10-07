import Toolbar from '@mui/material/Toolbar';
import clsx from 'clsx';
import { memo } from 'react';
import NavbarToggleButton from 'src/components/theme-layouts/components/navbar/NavbarToggleButton';
import useFuseLayoutSettings from '@fuse/core/FuseLayout/useFuseLayoutSettings';
import { Layout1ConfigDefaultsType } from '@/components/theme-layouts/layout1/Layout1Config';
import useThemeMediaQuery from '../../../../@fuse/hooks/useThemeMediaQuery';
import { AppBar, Divider } from '@mui/material';
import ToolbarTheme from 'src/contexts/ToolbarTheme';
import CompanySelector from '../../components/CompanySelector';
import { useContrastTheme } from '@/contexts/ContrastThemeContext';
import QuickActionsSpeedDial from '../../components/QuickActionsSpeedDial';
import NotificationsMenu from '../../components/header/NotificationsMenu';
import UserMenu from '../../components/UserMenu';
import LightDarkModeToggle from 'src/components/LightDarkModeToggle';
import themeOptions from 'src/configs/themeOptions';
import _ from 'lodash';

type ToolbarLayout1Props = {
  className?: string;
};

/**
 * Enterprise Toolbar Layout 1 for GANADERO v1.
 * Ergonomic 3-zone architecture:
 * [ Left: NavbarToggle | CompanySelector ] ── [ Center: Omnibox (Ctrl+K) ] ── [ Right: Sync | Notifications | UserMenu ]
 */
function ToolbarLayout1(props: ToolbarLayout1Props) {
  const { className } = props;

  const settings = useFuseLayoutSettings();
  const config = settings.config as Layout1ConfigDefaultsType;
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('md'));
  const isSmallScreen = useThemeMediaQuery((theme) => theme.breakpoints.down('sm'));
  const { settings: contrastSettings } = useContrastTheme();

  const isContrastActive = contrastSettings.enabled;

  return (
    <>
      <ToolbarTheme>
        <AppBar
          id="fuse-toolbar"
          className={clsx('relative z-20 flex shadow-sm', className)}
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
                '& .MuiIconButton-root, & .MuiTypography-root, & .MuiSvgIcon-root, & svg': {
                  color: `${contrastSettings.headerText} !important`
                }
              }),
            borderBottom: `1px solid ${theme.vars.palette.divider}`
          })}
        >
          <Toolbar className="h-12 min-h-12 p-0 md:h-12 md:min-h-12 flex items-center justify-between">
            {/* ── Left Zone: Navigation Toggle + Company Context ────── */}
            <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 shrink-0">
              {config.navbar.display && config.navbar.position === 'left' && (
                <NavbarToggleButton />
              )}
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />
              <CompanySelector />
            </div>

            {/* ── Spacer ────────────────────────────────────────────── */}
            <div className="flex-1" />

            {/* ── Right Zone: Theme Toggle, Notifications & User Identity ─ */}
            <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 shrink-0">
              <NotificationsMenu />

              <LightDarkModeToggle
                className="h-8 w-8 p-0"
                lightTheme={_.find(themeOptions, { id: 'Default' })}
                darkTheme={_.find(themeOptions, { id: 'Default Dark' })}
              />

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

              <UserMenu
                dense
                onlyAvatar={isSmallScreen}
                arrowIcon="heroicons-mini:chevron-down"
                showRoleBadge={false}
                popoverProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'right',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                  },
                }}
              />
            </div>

            {config.navbar.display && config.navbar.position === 'right' && (
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

      {/* Floating quick-actions — rendered outside AppBar to stay fixed on scroll */}
      <QuickActionsSpeedDial />
    </>
  );
}

export default memo(ToolbarLayout1);
