import Toolbar from '@mui/material/Toolbar';
import clsx from 'clsx';
import { memo } from 'react';
import NavbarToggleButton from 'src/components/theme-layouts/components/navbar/NavbarToggleButton';
import themeOptions from 'src/configs/themeOptions';
import _ from 'lodash';
import LightDarkModeToggle from 'src/components/LightDarkModeToggle';
import useFuseLayoutSettings from '@fuse/core/FuseLayout/useFuseLayoutSettings';
import { Layout1ConfigDefaultsType } from '@/components/theme-layouts/layout1/Layout1Config';
import useThemeMediaQuery from '../../../../@fuse/hooks/useThemeMediaQuery';
import { AppBar, Divider, IconButton, Tooltip } from '@mui/material';
import ToolbarTheme from 'src/contexts/ToolbarTheme';
import CompanySelector from '../../components/CompanySelector';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useNavigate } from 'react-router';
import { useContrastTheme } from '@/contexts/ContrastThemeContext';
import QuickActionsSpeedDial from '../../components/QuickActionsSpeedDial';

type ToolbarLayout1Props = {
  className?: string;
};

/**
 * The toolbar layout 1.
 * Contains: NavbarToggle | CompanySelector | [spacer] | LightDarkToggle | Settings
 * QuickActionsSpeedDial renders fixed/floating — independent of AppBar flow.
 */
function ToolbarLayout1(props: ToolbarLayout1Props) {
  const { className } = props;

  const settings = useFuseLayoutSettings();
  const config = settings.config as Layout1ConfigDefaultsType;
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
  const navigate = useNavigate();
  const { settings: contrastSettings } = useContrastTheme();

  const isContrastActive = contrastSettings.enabled;

  return (
    <>
      <ToolbarTheme>
        <AppBar
          id="fuse-toolbar"
          className={clsx('relative z-20 flex', className)}
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
          <Toolbar className="h-12 min-h-12 p-0 md:h-12 md:min-h-12">
            {/* ── Left side: Navbar toggle ───────────────────────────── */}
            <div className="flex flex-1 items-center gap-2 px-2 md:px-3">
              {config.navbar.display && config.navbar.position === 'left' && (
                <NavbarToggleButton />
              )}
            </div>

            {/* ── Right side: Core actions ───────────────────────────── */}
            <div className="flex items-center gap-0.5 px-2 md:px-3">
              <CompanySelector />

              <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1 }} />

              <LightDarkModeToggle
                lightTheme={_.find(themeOptions, { id: 'Default' })}
                darkTheme={_.find(themeOptions, { id: 'Default Dark' })}
              />

              <Tooltip title="Configuración" placement="bottom">
                <IconButton
                  id="toolbar-settings-btn"
                  onClick={() => navigate('/settings')}
                  className="h-8 w-8 p-0"
                  size="small"
                >
                  <FuseSvgIcon size={18}>heroicons-outline:cog</FuseSvgIcon>
                </IconButton>
              </Tooltip>
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

