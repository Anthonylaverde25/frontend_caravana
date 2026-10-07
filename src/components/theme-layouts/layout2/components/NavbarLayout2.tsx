import { Box, Divider, IconButton, Tooltip } from '@mui/material';
import clsx from 'clsx';
import { memo } from 'react';
import { useNavigate } from 'react-router';
import _ from 'lodash';
import Navigation from 'src/components/theme-layouts/components/navigation/Navigation';
import Logo from '../../components/Logo';
import CompanySelector from '../../components/CompanySelector';
import LightDarkModeToggle from 'src/components/LightDarkModeToggle';
import themeOptions from 'src/configs/themeOptions';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import UserMenu from '../../components/UserMenu';
import NavbarToggleButton from 'src/components/theme-layouts/components/navbar/NavbarToggleButton';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useContrastTheme } from '@/contexts/ContrastThemeContext';

type NavbarLayout2Props = {
	className?: string;
};

/**
 * Unified Header for Layout 2 (Single-Row Horizontal Navigation).
 * Combines in a single sleek enterprise row:
 * [ MobileToggle / Logo | CompanySelector ] ── [ Horizontal Navigation ] ── [ DarkMode | Settings | UserMenu ]
 */
function NavbarLayout2(props: NavbarLayout2Props) {
	const { className = '' } = props;
	const navigate = useNavigate();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const { settings: contrastSettings } = useContrastTheme();

	const isContrastActive = contrastSettings.enabled;
	const headerBg =
		isContrastActive && (contrastSettings.headerBg || contrastSettings.asideBg)
			? contrastSettings.headerBg || contrastSettings.asideBg
			: null;
	const headerText =
		isContrastActive && (contrastSettings.headerText || contrastSettings.asideText)
			? contrastSettings.headerText || contrastSettings.asideText
			: null;

	return (
		<Box
			id="fuse-header-unified"
			className={clsx('h-16 min-h-16 max-h-16 w-full relative z-20 flex shadow-sm', className)}
			sx={(theme) => ({
				backgroundColor: headerBg || theme.vars.palette.background.paper,
				color: headerText || theme.vars.palette.text.primary,
				borderBottom: `1px solid ${theme.vars.palette.divider}`,
				transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
				'& .fuse-list-item': {
					borderRadius: '8px',
					mx: 0.5,
					transition: 'all 0.15s ease-in-out',
				},
				...(headerText && {
					'& .MuiIconButton-root, & .MuiTypography-root, & .fuse-list-item-text, & .fuse-list-item-icon, & .MuiSvgIcon-root, & svg':
						{
							color: `${headerText} !important`
						},
					'& .fuse-list-item:hover': {
						backgroundColor: 'rgba(255, 255, 255, 0.1) !important'
					},
					'& .fuse-list-item.active, & .fuse-list-item.active:hover, & .fuse-list-item.active:focus': {
						backgroundColor: `${contrastSettings.primaryButtonBg || '#0E3D26'} !important`,
						color: '#ffffff !important',
						'& .fuse-list-item-text, & .fuse-list-item-icon, & .MuiSvgIcon-root, & svg': {
							color: '#ffffff !important'
						}
					}
				})
			})}
		>
			<div className="z-20 flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10 gap-4">
				{/* ── Left: Brand & Establishment / Farm Context ── */}
				<div className="flex shrink-0 items-center gap-2 md:gap-3">
					{isMobile && <NavbarToggleButton className="h-8 w-8 p-0 mr-1" />}

					<Logo />

					{!isMobile && (
						<>
							<Divider orientation="vertical" flexItem sx={{ mx: 1.5, my: 1.75 }} />
							<CompanySelector />
						</>
					)}
				</div>

				{/* ── Center: Horizontal Navigation Menu (Desktop) ── */}
				{!isMobile && (
					<Box
						className="flex h-full flex-auto items-center min-w-0 mx-2 lg:mx-6"
						sx={{
							overflowX: 'auto',
							scrollbarWidth: 'none',
							'&::-webkit-scrollbar': { display: 'none' },
							msOverflowStyle: 'none',
						}}
					>
						<Navigation
							className="w-full justify-start"
							layout="horizontal"
						/>
					</Box>
				)}

				{/* ── Right: Theme Toggle, Settings, User Menu ── */}
				<div className="flex shrink-0 items-center gap-1.5 md:gap-2">
					{isMobile && <CompanySelector />}

					<LightDarkModeToggle
						lightTheme={_.find(themeOptions, { id: 'Default' })}
						darkTheme={_.find(themeOptions, { id: 'Default Dark' })}
					/>

					<Tooltip title="Configuración" placement="bottom">
						<IconButton
							id="toolbar-settings-btn"
							onClick={() => navigate('/settings')}
							className="h-9 w-9 p-0"
							size="small"
						>
							<FuseSvgIcon size={19}>heroicons-outline:cog</FuseSvgIcon>
						</IconButton>
					</Tooltip>

					{!isMobile && (
						<>
							<Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.75 }} />
							<UserMenu
								className="border-none"
								arrowIcon="lucide:chevron-down"
								dense
							/>
						</>
					)}
				</div>
			</div>
		</Box>
	);
}

export default memo(NavbarLayout2);
