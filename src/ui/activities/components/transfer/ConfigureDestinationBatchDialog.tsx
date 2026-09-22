import React, { useEffect, useMemo, useState } from 'react';
import {
	Box,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	InputAdornment,
	MenuItem,
	Stack,
	TextField,
	Typography,
	alpha,
	useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Activity } from '@/core/activities/domain/entities/Activity';
import { BatchType } from '@/core/batch-types/domain/entities/BatchType';
import { NewBatchDraft } from './TransferDestinationBar';
import { useTransferPalette } from './transferPalette';

interface ConfigureDestinationBatchDialogProps {
	open: boolean;
	onClose: () => void;
	onSave: (draft: NewBatchDraft) => void;
	draft: NewBatchDraft;
	activities: Activity[];
	batchTypes: BatchType[];
	isLoadingBatchTypes?: boolean;
}

/**
 * Modal Dialog for configuring a brand new destination batch.
 * Adheres strictly to canonical CreateBatchDialog design tokens
 * (PaperProps: { borderRadius: '8px', boxShadow: 1 }, header 1.1rem fontWeight 600 with x-mark,
 * variant="filled" inputs with action.hover, and unified action bars).
 */
export const ConfigureDestinationBatchDialog: React.FC<ConfigureDestinationBatchDialogProps> = ({
	open,
	onClose,
	onSave,
	draft,
	activities,
	batchTypes,
	isLoadingBatchTypes
}) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const palette = useTransferPalette();

	const [localDraft, setLocalDraft] = useState<NewBatchDraft>({ ...draft });

	// Synchronize local form state with external draft when dialog opens
	useEffect(() => {
		if (open) {
			setLocalDraft({ ...draft });
		}
	}, [open, draft]);

	const enabledActivities = useMemo(
		() => activities.filter((a) => a.isEnabled !== false),
		[activities]
	);

	const selectedActivity = useMemo(
		() => activities.find((a) => a.id === localDraft.activityId),
		[activities, localDraft.activityId]
	);

	// The management system belongs to the batch, not to the stage: a destination batch
	// of any productive activity declares whether it is penned or grazing.
	const declaresManagement = Boolean(selectedActivity) && selectedActivity?.code !== 'INTERNAL';

	const selectableTypes = useMemo(() => {
		const selectable = batchTypes.filter((t) => t.is_selectable !== false);

		if (!localDraft.activityId) return selectable;

		return selectable.filter(
			(t) => t.activity_id === localDraft.activityId || t.activity_id == null
		);
	}, [batchTypes, localDraft.activityId]);

	const isManagementMissing =
		declaresManagement && localDraft.isConfined !== true && localDraft.isConfined !== false;

	const canSubmit =
		localDraft.name.trim().length > 0 &&
		localDraft.activityId != null &&
		localDraft.batchTypeId != null &&
		!isManagementMissing;

	const handleSave = () => {
		if (!canSubmit) return;
		onSave(localDraft);
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
							bgcolor: alpha(palette.sapEmerald, isDark ? 0.2 : 0.1),
							color: palette.sapEmerald,
							flexShrink: 0
						}}
					>
						<FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>
					</Box>
					<Box>
						<Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.25 }}>
							Configurar Nuevo Lote Destino
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Ingresa la identificación y categorización del lote a crear
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
					{/* Nombre del Lote */}
					<TextField
						label="Nombre del Lote"
						value={localDraft.name}
						onChange={(e) => setLocalDraft({ ...localDraft, name: e.target.value })}
						placeholder="Ej: Invernada Machos 2026-A"
						variant="filled"
						size="small"
						fullWidth
						required
						autoFocus
						sx={{
							bgcolor: 'action.hover',
							'& .MuiFilledInput-root': { borderRadius: '6px' }
						}}
						InputProps={{
							endAdornment: (
								<InputAdornment position="end">
									<Chip
										size="small"
										label="Sugerido"
										sx={{
											fontSize: '0.65rem',
											fontWeight: 700,
											height: 20,
											borderRadius: '4px',
											bgcolor: alpha(palette.sapEmerald, 0.15),
											color: palette.sapEmerald
										}}
									/>
								</InputAdornment>
							)
						}}
					/>

					{/* Fila en 2 columnas: Etapa de Destino y Tipo de Lote */}
					<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
						{/* Etapa de Destino */}
						<TextField
							select
							label="Etapa de Destino"
							value={localDraft.activityId ?? ''}
							onChange={(e) => {
								const nextId = e.target.value ? Number(e.target.value) : undefined;
								setLocalDraft({
									...localDraft,
									activityId: nextId,
									batchTypeId: undefined,
									isConfined: undefined
								});
							}}
							variant="filled"
							size="small"
							fullWidth
							required
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
								<em>Seleccionar etapa…</em>
							</MenuItem>
							{enabledActivities.map((act) => (
								<MenuItem key={act.id} value={act.id}>
									{act.name}
								</MenuItem>
							))}
						</TextField>

						{/* Tipo de Lote */}
						<TextField
							select
							label="Tipo de Lote"
							value={localDraft.batchTypeId ?? ''}
							onChange={(e) => {
								const nextId = e.target.value ? Number(e.target.value) : undefined;
								setLocalDraft({ ...localDraft, batchTypeId: nextId });
							}}
							disabled={!localDraft.activityId}
							variant="filled"
							size="small"
							fullWidth
							required
							helperText={
								!localDraft.activityId
									? 'Primero seleccioná la etapa'
									: isLoadingBatchTypes
										? 'Cargando tipos…'
										: undefined
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
								<em>{localDraft.activityId ? 'Seleccionar tipo…' : 'Primero seleccioná la etapa'}</em>
							</MenuItem>
							{selectableTypes.map((type) => (
								<MenuItem key={type.id} value={type.id}>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
										{type.color && (
											<Box
												sx={{
													width: 9,
													height: 9,
													borderRadius: '50%',
													bgcolor: type.color,
													flexShrink: 0
												}}
											/>
										)}
										<span>{type.name}</span>
									</Box>
								</MenuItem>
							))}
						</TextField>
					</Stack>

					{/* Tipo de Manejo (Solo para Recría) */}
					{declaresManagement && (
						<TextField
							select
							label="Sistema de Manejo (Recría)"
							value={
								localDraft.isConfined === true
									? 'confined'
									: localDraft.isConfined === false
										? 'pasture'
										: ''
							}
							onChange={(e) => {
								const val = e.target.value;
								setLocalDraft({
									...localDraft,
									isConfined:
										val === 'confined' ? true : val === 'pasture' ? false : undefined
								});
							}}
							error={isManagementMissing}
							helperText={
								isManagementMissing
									? 'Requerido: debe declarar el sistema de manejo para Recría'
									: undefined
							}
							variant="filled"
							size="small"
							fullWidth
							required
							sx={{
								bgcolor: 'action.hover',
								'& .MuiFilledInput-root': { borderRadius: '6px' }
							}}
							SelectProps={{
								MenuProps: {
									PaperProps: {
										sx: {
											maxHeight: 200,
											borderRadius: '6px',
											boxShadow: 3
										}
									}
								}
							}}
						>
							<MenuItem value="">
								<em>Elegir manejo…</em>
							</MenuItem>
							<MenuItem value="confined">A corral (Feedlot)</MenuItem>
							<MenuItem value="pasture">A campo (Pastoreo)</MenuItem>
						</TextField>
					)}
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
					onClick={handleSave}
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

export default ConfigureDestinationBatchDialog;
