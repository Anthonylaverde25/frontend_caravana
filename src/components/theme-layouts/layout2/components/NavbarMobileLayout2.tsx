import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { Box, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { memo } from 'react';
import UserMenu from 'src/components/theme-layouts/components/UserMenu';
import Logo from '../../components/Logo';
import Navigation from '../../components/navigation/Navigation';
import { useContrastTheme } from '@/contexts/ContrastThemeContext';

const Root = styled(Box)(({ theme }) => ({
	backgroundColor: theme.vars.palette.background.default,
	color: theme.vars.palette.text.primary,
	'& ::-webkit-scrollbar-thumb': {
		boxShadow: `inset 0 0 0 20px ${'rgba(255, 255, 255, 0.24)'}`,
		...theme.applyStyles('light', {
			boxShadow: `inset 0 0 0 20px ${'rgba(0, 0, 0, 0.24)'}`
		})
	},
	'& ::-webkit-scrollbar-thumb:active': {
		boxShadow: `inset 0 0 0 20px ${'rgba(255, 255, 255, 0.37)'}`,
		...theme.applyStyles('light', {
			boxShadow: `inset 0 0 0 20px ${'rgba(0, 0, 0, 0.37)'}`
		})
	}
}));

const StyledContent = styled(FuseScrollbars)(() => ({
	overscrollBehavior: 'contain',
	overflowX: 'hidden',
	overflowY: 'auto',
	WebkitOverflowScrolling: 'touch',
	backgroundRepeat: 'no-repeat',
	backgroundSize: '100% 40px, 100% 10px',
	backgroundAttachment: 'local, scroll'
}));

type NavbarMobileLayout2Props = {
	className?: string;
};

/**
 * The navbar mobile layout 2.
 * Clean, modern mobile drawer with vertical navigation and contrast theming.
 */
function NavbarMobileLayout2(props: NavbarMobileLayout2Props) {
	const { className = '' } = props;
	const { settings: contrastSettings } = useContrastTheme();

	const isContrastActive = contrastSettings.enabled;

	return (
		<Root
			className={clsx('flex h-full flex-col overflow-hidden', className)}
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
						'& .MuiTypography-root, & .fuse-list-item-text, & .fuse-list-item-icon, & .MuiSvgIcon-root, & svg':
							{
								color: `${contrastSettings.asideText} !important`
							}
					})
			})}
		>
			{/* ── Brand Logo Header ── */}
			<div className="flex h-14 shrink-0 flex-row items-center px-4 border-b border-divider">
				<Logo />
			</div>

			{/* ── Vertical Navigation ── */}
			<StyledContent
				className="flex min-h-0 flex-1 flex-col py-2"
				option={{ suppressScrollX: true, wheelPropagation: false }}
			>
				<Navigation layout="vertical" />
			</StyledContent>

			<Divider />

			{/* ── User Profile & Session ── */}
			<div className="w-full p-3">
				<UserMenu className="w-full" />
			</div>
		</Root>
	);
}

export default memo(NavbarMobileLayout2);
