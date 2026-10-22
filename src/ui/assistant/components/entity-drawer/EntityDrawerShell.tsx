import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Box, Button, CircularProgress, Drawer, IconButton, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export interface EntityDrawerShellProps {
	open: boolean;
	onClose: () => void;
	icon: string;
	title: string;
	/** Order and movement codes read in monospace; names (an item, a batch) do not. */
	codeTitle?: boolean;
	subtitle?: ReactNode;
	chip?: ReactNode;
	isLoading: boolean;
	isError: boolean;
	/** Screen where the record is worked; the drawer itself only reads. */
	screen: { route: string; label: string };
	/** Called after navigating, so the host can close the assistant around it. */
	onNavigate?: () => void;
	children: ReactNode;
}

const actionSx = {
	textTransform: 'none',
	fontWeight: 600,
	borderRadius: '6px'
} as const;

/**
 * Read-only detail of one record opened from an assistant table. Same frame as the order drawers
 * (header with code and status, scrolling body), with a single action: open the record's screen.
 */
export function EntityDrawerShell({
	open,
	onClose,
	icon,
	title,
	codeTitle = false,
	subtitle,
	chip,
	isLoading,
	isError,
	screen,
	onNavigate,
	children
}: EntityDrawerShellProps) {
	const navigate = useNavigate();

	const openScreen = () => {
		navigate(screen.route);
		onClose();
		onNavigate?.();
	};

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: { xs: '100%', md: 720 },
					boxSizing: 'border-box',
					display: 'flex',
					flexDirection: 'column'
				}
			}}
		>
			<Box
				sx={{
					p: 2.5,
					borderBottom: '1px solid',
					borderColor: 'divider',
					display: 'flex',
					alignItems: 'center',
					gap: 1.5
				}}
			>
				<FuseSvgIcon size={22}>{icon}</FuseSvgIcon>
				<Box sx={{ flexGrow: 1, minWidth: 0 }}>
					<Stack
						direction="row"
						spacing={1}
						alignItems="center"
					>
						<Typography
							sx={{
								fontSize: '1.1rem',
								fontWeight: 700,
								fontFamily: codeTitle ? 'monospace' : undefined
							}}
						>
							{title}
						</Typography>
						{chip}
					</Stack>
					{subtitle && (
						<Typography
							variant="caption"
							color="text.secondary"
						>
							{subtitle}
						</Typography>
					)}
				</Box>
				<IconButton
					size="small"
					onClick={onClose}
					aria-label="Cerrar"
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>

			{isError ? (
				<Box sx={{ p: 2.5 }}>
					<Alert severity="warning">No se encontró el registro o no tenés acceso a él.</Alert>
				</Box>
			) : isLoading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress size={28} />
				</Box>
			) : (
				<Box sx={{ p: 2.5, overflowY: 'auto', flexGrow: 1 }}>{children}</Box>
			)}

			{/* A record that is not there has no screen to open. */}
			{!isError && (
				<Box
					sx={{
						p: 2,
						borderTop: '1px solid',
						borderColor: 'divider',
						display: 'flex',
						justifyContent: 'flex-end'
					}}
				>
					<Button
						variant="outlined"
						color="inherit"
						endIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-top-right-on-square</FuseSvgIcon>}
						onClick={openScreen}
						sx={actionSx}
					>
						{screen.label}
					</Button>
				</Box>
			)}
		</Drawer>
	);
}

export default EntityDrawerShell;
