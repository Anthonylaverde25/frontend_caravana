import React from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { FuseThemeOption } from '@fuse/core/FuseThemeSelector/ThemePreview';
import { useMainTheme } from '@fuse/core/FuseSettings/hooks/fuseThemeHooks';
import useFuseSettings from '@fuse/core/FuseSettings/hooks/useFuseSettings';
import { FuseSettingsConfigType } from '@fuse/core/FuseSettings/FuseSettings';
import useUser from '@auth/useUser';

type LightDarkModeToggleProps = {
	className?: string;
	lightTheme: FuseThemeOption;
	darkTheme: FuseThemeOption;
};

/**
 * Direct 1-click Light/Dark Mode Toggle.
 * Switches theme instantly upon clicking without opening a dropdown menu.
 */
function LightDarkModeToggle(props: LightDarkModeToggleProps) {
	const { className = '', lightTheme, darkTheme } = props;
	const { setSettings } = useFuseSettings();
	const { isGuest, updateUserSettings } = useUser();
	const mainTheme = useMainTheme();

	const isLight = mainTheme.palette.mode === 'light';

	const handleToggle = () => {
		const targetTheme = isLight ? darkTheme : lightTheme;
		const newSettings = setSettings({ theme: { ...targetTheme?.section } } as Partial<FuseSettingsConfigType>);

		// Background persistence without blocking UI
		if (!isGuest) {
			updateUserSettings(newSettings).catch((err) => {
				console.error('Failed to sync theme preferences:', err);
			});
		}
	};

	return (
		<Tooltip title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'} placement="bottom">
			<IconButton
				id="light-dark-toggle-btn"
				aria-label={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
				onClick={handleToggle}
				className={className}
				size="small"
			>
				{isLight ? (
					<FuseSvgIcon size={19}>lucide:sun</FuseSvgIcon>
				) : (
					<FuseSvgIcon size={19}>lucide:moon</FuseSvgIcon>
				)}
			</IconButton>
		</Tooltip>
	);
}

export default LightDarkModeToggle;
