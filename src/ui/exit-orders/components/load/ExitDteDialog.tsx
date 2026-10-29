import React from 'react';
import {
	Alert,
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	IconButton,
	Stack,
	TextField,
	Typography
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { filledInputProps } from '@/ui/weaning-orders/components/form/formStyles';
import type { ExitDteDraft } from '../../hooks/useExitLoadForm';
import { localToday } from '../exitOrderFormat';

interface ExitDteDialogProps {
	open: boolean;
	onClose: () => void;
	dte: ExitDteDraft;
	onChange: (patch: Partial<ExitDteDraft>) => void;
	errors: Record<string, string>;
}

/**
 * Modal to enter or edit the transit document (DTE) of the load.
 * Keeps the main animals sheet minimalist and clutter-free.
 */
export const ExitDteDialog: React.FC<ExitDteDialogProps> = ({ open, onClose, dte, onChange, errors }) => {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="sm"
			PaperProps={{
				sx: {
					borderRadius: '8px',
					boxShadow: 1,
					bgcolor: 'background.paper'
				}
			}}
		>
			<Box
				sx={{
					p: 2,
					px: 3,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: 1,
					borderColor: 'divider',
					bgcolor: 'background.paper'
				}}
			>
				<Typography
					variant="h6"
					sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
				>
					DTE (Documento de Tránsito)
				</Typography>
				<IconButton
					onClick={onClose}
					size="small"
					sx={{ color: 'primary.main' }}
					aria-label="Cerrar"
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>

			<DialogContent sx={{ p: 3, bgcolor: 'background.paper' }}>
				<Stack spacing={2.5}>
					<Alert
						severity="info"
						sx={{ fontSize: '0.8rem', py: 0.5, borderRadius: '6px' }}
					>
						Si ya tenés el DTE, cargalo acá. Si no, el egreso se guarda igual y queda marcado «Sin DTE» para
						cargarlo después.
					</Alert>

					<TextField
						label="Número de DTE"
						variant="filled"
						fullWidth
						value={dte.number}
						onChange={(e) => onChange({ number: e.target.value })}
						InputProps={filledInputProps}
						error={!!errors['dte.dte_number']}
						helperText={errors['dte.dte_number']}
					/>

					<Stack
						direction={{ xs: 'column', sm: 'row' }}
						spacing={2}
					>
						<TextField
							label="Fecha del DTE"
							type="date"
							variant="filled"
							fullWidth
							value={dte.date}
							onChange={(e) => onChange({ date: e.target.value })}
							InputProps={filledInputProps}
							InputLabelProps={{ shrink: true }}
							inputProps={{ max: localToday() }}
							error={!!errors['dte.dte_date']}
							helperText={errors['dte.dte_date']}
							sx={{ flex: 1 }}
						/>
						<TextField
							label="Cabezas"
							type="number"
							variant="filled"
							value={dte.heads}
							onChange={(e) => onChange({ heads: e.target.value })}
							InputProps={filledInputProps}
							inputProps={{ min: 1 }}
							error={!!errors['dte.head_count']}
							helperText={errors['dte.head_count']}
							sx={{ width: { xs: '100%', sm: 140 }, flex: { sm: 'none' } }}
						/>
					</Stack>
				</Stack>
			</DialogContent>

			<DialogActions
				sx={{
					p: 2,
					px: 3,
					bgcolor: 'background.default',
					borderTop: 1,
					borderColor: 'divider',
					justifyContent: 'flex-end'
				}}
			>
				<Button
					onClick={onClose}
					variant="contained"
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
					Listo
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ExitDteDialog;

