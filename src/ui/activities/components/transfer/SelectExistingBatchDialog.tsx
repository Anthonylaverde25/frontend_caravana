import React, { useEffect, useMemo, useState } from 'react';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	MenuItem,
	Stack,
	TextField,
	Typography,
	alpha,
	useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Activity } from '@/core/activities/domain/entities/Activity';
import { DestinationCandidate } from './TransferDestinationBar';
import { useTransferPalette } from './transferPalette';

interface SelectExistingBatchDialogProps {
	open: boolean;
	onClose: () => void;
	onSelect: (activityId: number, targetBatchId: number) => void;
	currentActivityId?: number;
	currentTargetBatchId?: number;
	activities: Activity[];
	candidateBatches: DestinationCandidate[];
}

/**
 * Modal Dialog for selecting an existing open destination batch.
 * Conforms to canonical CreateBatchDialog design tokens
 * (PaperProps: { borderRadius: '8px', boxShadow: 3 }, header with x-mark,
 * variant="filled" inputs with action.hover, and DialogContent dividers).
 */
export const SelectExistingBatchDialog: React.FC<SelectExistingBatchDialogProps> = ({
	open,
	onClose,
	onSelect,
	currentActivityId,
	currentTargetBatchId,
	activities,
	candidateBatches
}) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const palette = useTransferPalette();

	const [localActivityId, setLocalActivityId] = useState<number | ''>(currentActivityId ?? '');
	const [localBatchId, setLocalBatchId] = useState<number | ''>(currentTargetBatchId ?? '');

	// Synchronize when opening dialog
	useEffect(() => {
		if (open) {
			setLocalActivityId(currentActivityId ?? '');
			setLocalBatchId(currentTargetBatchId ?? '');
		}
	}, [open, currentActivityId, currentTargetBatchId]);

	const enabledActivities = useMemo(
		() => activities.filter((a) => a.isEnabled !== false),
		[activities]
	);

	const batchesInActivity = useMemo(() => {
		if (localActivityId === '') return [];
		return candidateBatches.filter((b) => b.activityId === localActivityId);
	}, [candidateBatches, localActivityId]);

	const canSubmit = localActivityId !== '' && localBatchId !== '';

	const handleConfirm = () => {
		if (!canSubmit) return;
		onSelect(Number(localActivityId), Number(localBatchId));
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="sm"
			scroll="paper"
			PaperProps={{
				sx: {
					borderRadius: '8px',
					boxShadow: 3,
					bgcolor: 'background.paper',
					m: { xs: 1.5, sm: 2 }
				}
			}}
		>
			{/* Header */}
			<DialogTitle
				sx={{
					m: 0,
					p: 2,
					px: { xs: 2, sm: 3 },
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: '1px solid',
					borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'
				}}
			>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box
						sx={{
							width: 36,
							height: 36,
							borderRadius: '8px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							bgcolor: isDark ? alpha('#60a5fa', 0.2) : alpha('#0a6ed1', 0.1),
							color: isDark ? '#60a5fa' : '#0a6ed1',
							flexShrink: 0
						}}
					>
						<FuseSvgIcon size={20}>heroicons-outline:folder-open</FuseSvgIcon>
					</Box>
					<Box>
						<Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.25 }}>
							Seleccionar Lote Existente
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Elige la etapa productiva y el lote abierto que recibirá los animales
						</Typography>
					</Box>
				</Stack>
				<IconButton
					aria-label="close"
					onClick={onClose}
					size="small"
					sx={{ color: 'text.secondary' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</DialogTitle>

			{/* Form Content */}
			<DialogContent
				dividers
				sx={{
					p: { xs: 2, sm: 3 },
					borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'
				}}
			>
				<Stack spacing={2.5}>
					{/* Etapa Destino */}
					<TextField
						select
						label="Etapa Productiva de Destino"
						value={localActivityId}
						onChange={(e) => {
							const nextId = e.target.value === '' ? '' : Number(e.target.value);
							setLocalActivityId(nextId);
							setLocalBatchId('');
						}}
						variant="filled"
						size="small"
						fullWidth
						required
						autoFocus
						sx={{
							bgcolor: 'action.hover',
							'& .MuiFilledInput-root': { borderRadius: '6px' }
						}}
						SelectProps={{
							MenuProps: {
								PaperProps: {
									sx: {
										maxHeight: 260,
										borderRadius: '6px',
										boxShadow: 3
									}
								}
							}
						}}
					>
						<MenuItem value="">
							<em>Seleccionar etapa destino…</em>
						</MenuItem>
						{enabledActivities.map((act) => (
							<MenuItem key={act.id} value={act.id}>
								{act.name} ({act.batches?.length ?? 0} {act.batches?.length === 1 ? 'lote' : 'lotes'})
							</MenuItem>
						))}
					</TextField>

					{/* Lote Existente */}
					<TextField
						select
						label="Lote Existente de Destino"
						value={localBatchId}
						onChange={(e) => {
							const nextId = e.target.value === '' ? '' : Number(e.target.value);
							setLocalBatchId(nextId);
						}}
						disabled={localActivityId === ''}
						variant="filled"
						size="small"
						fullWidth
						required
						helperText={
							localActivityId === ''
								? 'Primero seleccioná la etapa productiva'
								: batchesInActivity.length === 0
									? 'No hay lotes abiertos disponibles en esta etapa'
									: `${batchesInActivity.length} ${batchesInActivity.length === 1 ? 'lote disponible' : 'lotes disponibles'}`
						}
						sx={{
							bgcolor: 'action.hover',
							'& .MuiFilledInput-root': { borderRadius: '6px' }
						}}
						SelectProps={{
							MenuProps: {
								PaperProps: {
									sx: {
										maxHeight: 260,
										borderRadius: '6px',
										boxShadow: 3
									}
								}
							}
						}}
					>
						<MenuItem value="">
							<em>
								{localActivityId === ''
									? 'Primero seleccioná la etapa'
									: batchesInActivity.length === 0
										? 'No hay lotes disponibles'
										: 'Seleccionar lote existente…'}
							</em>
						</MenuItem>
						{batchesInActivity.map((batch) => (
							<MenuItem key={batch.id} value={batch.id}>
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										width: '100%',
										gap: 1.5
									}}
								>
									<Typography variant="body2" sx={{ fontWeight: 600 }}>
										{batch.name}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{batch.count} cab {batch.batchTypeName ? `· ${batch.batchTypeName}` : ''}
									</Typography>
								</Box>
							</MenuItem>
						))}
					</TextField>
				</Stack>
			</DialogContent>

			{/* Actions Footer */}
			<DialogActions
				sx={{
					p: 2,
					px: { xs: 2, sm: 3 },
					bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
					borderTop: '1px solid',
					borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'
				}}
			>
				<Button
					onClick={onClose}
					sx={{
						textTransform: 'none',
						fontWeight: 600,
						color: 'text.secondary'
					}}
				>
					Cancelar
				</Button>
				<Button
					variant="contained"
					onClick={handleConfirm}
					disabled={!canSubmit}
					sx={{
						textTransform: 'none',
						fontWeight: 700,
						borderRadius: '6px',
						px: 3,
						bgcolor: palette.sapGreen,
						color: '#ffffff',
						'&:hover': {
							bgcolor: palette.sapGreenHover
						}
					}}
				>
					Continuar
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default SelectExistingBatchDialog;
