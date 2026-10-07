import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	MenuItem,
	Box,
	Typography,
	alpha,
	useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface CaravanTransferDialogProps {
	open: boolean;
	caravans: any | any[];
	availableCompanies: Array<{ id: number; name: string }>;
	onClose: () => void;
	onConfirm: (targetCompanyId: number | string, selected: any[]) => void;
}

/**
 * CaravanTransferDialog
 * Clean, isolated dialog for individual or bulk animal transfers between companies.
 */
export function CaravanTransferDialog({
	open,
	caravans,
	availableCompanies,
	onClose,
	onConfirm
}: CaravanTransferDialogProps) {
	const theme = useTheme();
	const [targetCompanyId, setTargetCompanyId] = useState<number | string>('');

	const selectedList = Array.isArray(caravans) ? caravans : caravans ? [caravans] : [];
	const count = selectedList.length;

	const handleClose = () => {
		setTargetCompanyId('');
		onClose();
	};

	const handleConfirm = () => {
		if (!targetCompanyId) return;
		onConfirm(targetCompanyId, selectedList);
		handleClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
		>
			<DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
				<Box
					sx={{
						p: 1,
						bgcolor: alpha(theme.palette.primary.main, 0.1),
						borderRadius: '12px',
						display: 'flex'
					}}
				>
					<FuseSvgIcon color="primary" size={24}>
						heroicons-outline:arrows-right-left
					</FuseSvgIcon>
				</Box>
				Transferencia {count > 1 ? `Masiva de ${count} Animales` : 'de Animal'}
			</DialogTitle>
			<DialogContent>
				<Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
					{count > 1
						? `Estás por transferir un lote de ${count} animales seleccionados.`
						: `Estás por transferir la caravana ${selectedList[0]?.identification || ''}.`}
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
					Esta acción registrará un movimiento de salida en la empresa actual y una entrada automática en la
					empresa destino para cada animal.
				</Typography>

				<Box
					sx={{
						p: 2,
						bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
						borderRadius: '12px',
						mb: 2,
						border: '1px solid',
						borderColor: 'divider'
					}}
				>
					<TextField
						select
						fullWidth
						label="Empresa Destino"
						value={targetCompanyId}
						onChange={(e) => setTargetCompanyId(e.target.value)}
						variant="outlined"
						helperText={
							availableCompanies.length === 0
								? 'No tienes otras empresas registradas'
								: 'Selecciona la empresa que recibirá los animales'
						}
					>
						{availableCompanies.map((company) => (
							<MenuItem key={company.id} value={company.id}>
								{company.name}
							</MenuItem>
						))}
					</TextField>
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: 2.5, pt: 1.5 }}>
				<Button onClick={handleClose} color="inherit" sx={{ fontWeight: 600, textTransform: 'none' }}>
					Cancelar
				</Button>
				<Button
					onClick={handleConfirm}
					variant="contained"
					color="primary"
					disabled={!targetCompanyId}
					sx={{
						fontWeight: 700,
						textTransform: 'none',
						px: 4,
						borderRadius: '8px',
						boxShadow: 'none'
					}}
				>
					Confirmar Transferencia
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default CaravanTransferDialog;
