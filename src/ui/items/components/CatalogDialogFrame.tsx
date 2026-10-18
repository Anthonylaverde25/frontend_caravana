import { ReactNode } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface CatalogDialogFrameProps {
	open: boolean;
	title: string;
	onClose: () => void;
	/** The main button validates on click; it is never disabled for missing data. */
	onSubmit: () => void;
	submitLabel: string;
	pending?: boolean;
	/** A rule the backend refused (errors.domain), above the footer. */
	error?: string | null;
	maxWidth?: 'xs' | 'sm' | 'md';
	children: ReactNode;
}

/**
 * The shell of every catalog dialog, with the CreateBatchDialog tokens: header with the close
 * mark, filled body, footer with "Cancelar" on the left and the main action on the right.
 */
export default function CatalogDialogFrame({
	open,
	title,
	onClose,
	onSubmit,
	submitLabel,
	pending = false,
	error,
	maxWidth = 'sm',
	children
}: CatalogDialogFrameProps) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth={maxWidth}
			PaperProps={{ sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' } }}
		>
			<Box sx={{ p: 2, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
				<Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
					{title}
				</Typography>
				<IconButton onClick={onClose} size="small" sx={{ color: 'primary.main' }}>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>

			<Box
				component="form"
				noValidate
				onSubmit={(e) => {
					e.preventDefault();
					onSubmit();
				}}
			>
				<DialogContent sx={{ p: 3 }}>
					{children}
					{error && (
						<Alert severity="error" sx={{ mt: 2, fontSize: '0.8rem', py: 0.5 }}>
							{error}
						</Alert>
					)}
				</DialogContent>

				<DialogActions
					sx={{ p: 2, px: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}
				>
					<Button onClick={onClose} variant="text" sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
						Cancelar
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={pending}
						sx={{
							bgcolor: 'primary.main',
							color: 'primary.contrastText',
							px: 3.5,
							fontWeight: 700,
							borderRadius: '6px',
							textTransform: 'none',
							boxShadow: 'none',
							'&:hover': { bgcolor: 'primary.dark' }
						}}
					>
						{pending ? 'Guardando...' : submitLabel}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	);
}
