import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { useState } from 'react';
import Link from '@fuse/core/Link';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { darken } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import Popover, { PopoverProps } from '@mui/material/Popover';
import useUser from '@auth/useUser';
import { useNavigate } from 'react-router';
import { useMainTheme } from '@fuse/core/FuseSettings/hooks/fuseThemeHooks';
import useFuseSettings from '@fuse/core/FuseSettings/hooks/useFuseSettings';
import { FuseSettingsConfigType } from '@fuse/core/FuseSettings/FuseSettings';
import themeOptions from 'src/configs/themeOptions';
import _ from 'lodash';

type UserMenuProps = {
	className?: string;
	popoverProps?: Partial<PopoverProps>;
	arrowIcon?: string;
	dense?: boolean;
	onlyAvatar?: boolean;
	showRoleBadge?: boolean;
};

/**
 * The user menu.
 * Enhanced for Header & Sidebar navigation with user profile, theme toggle, and settings.
 */
function UserMenu(props: UserMenuProps) {
	const {
		className,
		popoverProps,
		arrowIcon = 'lucide:chevron-down',
		dense = false,
		onlyAvatar = false,
		showRoleBadge = false,
	} = props;
	const { data: user, signOut, isGuest } = useUser();
	const [userMenu, setUserMenu] = useState<HTMLElement | null>(null);
	const navigate = useNavigate();
	const mainTheme = useMainTheme();
	const { setSettings } = useFuseSettings();

	const userMenuClick = (event: React.MouseEvent<HTMLElement>) => {
		setUserMenu(event.currentTarget);
	};

	const userMenuClose = () => {
		setUserMenu(null);
	};

	const handleThemeToggle = () => {
		const isDark = mainTheme.palette.mode === 'dark';
		const targetTheme = isDark
			? _.find(themeOptions, { id: 'Default' })
			: _.find(themeOptions, { id: 'Default Dark' });

		if (targetTheme) {
			setSettings({ theme: { ...targetTheme.section } } as Partial<FuseSettingsConfigType>);
		}
	};

	if (!user) {
		return null;
	}

	const roleLabel =
		(user as any)?.role?.toString() ||
		(user as any)?.companies?.[0]?.role ||
		'Operador';

	return (
		<>
			<Button
				className={clsx(
					'user-menu flex shrink-0 justify-start',
					onlyAvatar ? 'min-w-0 p-0' : dense ? 'h-8 min-h-8 gap-1.5 px-1.5' : 'h-14 min-h-14 gap-3',
					className
				)}
				onClick={userMenuClick}
				color="inherit"
				sx={{ textTransform: 'none' }}
			>
				{user?.photoURL ? (
					<Avatar
						sx={(theme) => ({
							background: theme.vars.palette.background.default,
							color: theme.vars.palette.text.secondary
						})}
						className={clsx('avatar rounded-lg', dense ? 'h-7 w-7' : 'h-10 w-10')}
						alt="user photo"
						src={user?.photoURL}
						variant="rounded"
					/>
				) : (
					<Avatar
						sx={(theme) => ({
							background: (t) => darken(t.palette.background.default, 0.05),
							color: theme.vars.palette.text.secondary,
							fontWeight: 700,
							fontSize: dense ? '0.75rem' : '1rem',
						})}
						className={clsx('avatar rounded-full', dense ? 'h-7 w-7' : 'h-10 w-10')}
					>
						{user?.displayName?.[0] || 'U'}
					</Avatar>
				)}
				{!onlyAvatar && (
					<>
						<div className={clsx('flex flex-auto flex-col text-left', dense ? 'max-w-[120px]' : 'gap-1')}>
							<Typography
								component="span"
								className={clsx(
									'title flex truncate leading-none font-semibold tracking-tight capitalize',
									dense ? 'text-sm' : 'text-base'
								)}
							>
								{user?.displayName}
							</Typography>
							{!dense && (
								<Typography
									className="flex leading-none font-medium tracking-tighter text-xs"
									color="text.secondary"
								>
									{user?.email}
								</Typography>
							)}
						</div>
						<div className="flex shrink-0 items-center gap-1">
							{showRoleBadge && (
								<Chip
									label={roleLabel}
									size="small"
									sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
								/>
							)}
							<FuseSvgIcon
								className="arrow text-action"
								size={13}
							>
								{arrowIcon}
							</FuseSvgIcon>
						</div>
					</>
				)}
			</Button>

			<Popover
				open={Boolean(userMenu)}
				anchorEl={userMenu}
				onClose={userMenuClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right'
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right'
				}}
				PaperProps={{
					sx: {
						minWidth: 230,
						borderRadius: '12px',
						mt: 1,
						boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
						border: (theme) => `1px solid ${theme.palette.divider}`,
						p: 0.5,
					}
				}}
				{...popoverProps}
			>
				{/* User Profile Header */}
				<Box sx={{ px: 2, py: 1.5 }}>
					<Typography variant="subtitle2" sx={{ fontWeight: 700 }} className="truncate">
						{user?.displayName || 'Usuario'}
					</Typography>
					<Typography variant="caption" color="text.secondary" className="truncate block">
						{user?.email}
					</Typography>
					<Box sx={{ mt: 0.8 }}>
						<Chip
							label={roleLabel}
							size="small"
							color="primary"
							variant="outlined"
							sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
						/>
					</Box>
				</Box>

				<Divider sx={{ my: 0.5 }} />

				{isGuest ? (
					<>
						<MenuItem
							component={Link}
							to="/sign-in"
							role="button"
							onClick={userMenuClose}
						>
							<ListItemIcon>
								<FuseSvgIcon size={18}>heroicons-outline:lock-closed</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Iniciar sesión" />
						</MenuItem>
						<MenuItem
							component={Link}
							to="/sign-up"
							role="button"
							onClick={userMenuClose}
						>
							<ListItemIcon>
								<FuseSvgIcon size={18}>heroicons-outline:user-plus</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Registrarse" />
						</MenuItem>
					</>
				) : (
					<>
						<MenuItem
							onClick={() => {
								navigate('/settings');
								userMenuClose();
							}}
						>
							<ListItemIcon>
								<FuseSvgIcon size={18}>heroicons-outline:cog-6-tooth</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Configuración" />
						</MenuItem>

						<MenuItem
							onClick={() => {
								handleThemeToggle();
							}}
						>
							<ListItemIcon>
								<FuseSvgIcon size={18}>
									{mainTheme.palette.mode === 'dark'
										? 'heroicons-outline:sun'
										: 'heroicons-outline:moon'}
								</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText
								primary={
									mainTheme.palette.mode === 'dark' ? 'Modo Claro' : 'Modo Oscuro'
								}
							/>
						</MenuItem>

						<Divider sx={{ my: 0.5 }} />

						<MenuItem
							onClick={() => {
								userMenuClose();
								signOut();
							}}
							sx={{
								color: 'error.main',
								'& .MuiListItemIcon-root': { color: 'error.main' },
							}}
						>
							<ListItemIcon>
								<FuseSvgIcon size={18}>heroicons-outline:arrow-right-on-rectangle</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Cerrar sesión" />
						</MenuItem>
					</>
				)}
			</Popover>
		</>
	);
}

export default UserMenu;
