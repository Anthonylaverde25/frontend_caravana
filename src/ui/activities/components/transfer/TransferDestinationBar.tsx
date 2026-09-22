import React, { useMemo, useState } from 'react';
import {
	Box,
	Button,
	Divider,
	Paper,
	Stack,
	Typography,
	alpha,
	useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Activity } from '@/core/activities/domain/entities/Activity';
import { BatchType } from '@/core/batch-types/domain/entities/BatchType';
import { ConfigureDestinationBatchDialog } from './ConfigureDestinationBatchDialog';
import { SelectExistingBatchDialog } from './SelectExistingBatchDialog';
import { useTransferPalette } from './transferPalette';

export interface NewBatchDraft {
	name: string;
	activityId?: number;
	batchTypeId?: number;
	isConfined?: boolean;
}

export interface DestinationCandidate {
	id: number;
	name: string;
	activityId: number;
	activityName: string;
	batchTypeId: number | null;
	batchTypeName: string | null;
	count: number;
	totalWeight: number | null;
	/** true = penned, false = pasture, null = nobody declared it. */
	isConfined: boolean | null;
}

interface TransferDestinationBarProps {
	mode: 'existing' | 'new';
	onModeChange: (mode: 'existing' | 'new') => void;
	activities: Activity[];
	batchTypes: BatchType[];
	isLoadingBatchTypes?: boolean;
	candidateBatches: DestinationCandidate[];
	targetBatchId?: number;
	onTargetBatchChange: (batchId: number | undefined) => void;
	draft: NewBatchDraft;
	onDraftChange: (draft: NewBatchDraft) => void;
	isManagementMissing: boolean;
	movedCount?: number;
	onResetDestination?: () => void;
}

/**
 * High-End Destination Selector Bar.
 * Clean, executive ERP design pattern with structured metadata,
 * strict typography, and intuitive modal triggers.
 */
export const TransferDestinationBar: React.FC<TransferDestinationBarProps> = ({
	mode,
	onModeChange,
	activities,
	batchTypes,
	isLoadingBatchTypes,
	candidateBatches,
	targetBatchId,
	onTargetBatchChange,
	draft,
	onDraftChange,
	isManagementMissing,
	onResetDestination
}) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const palette = useTransferPalette();

	const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
	const [isExistingDialogOpen, setIsExistingDialogOpen] = useState(false);

	const activeColor = isDark ? '#60a5fa' : '#0a6ed1';
	const emeraldColor = isDark ? '#34d399' : '#059669';

	// Selected destination entities
	const targetBatch = useMemo(() => {
		if (targetBatchId == null) return undefined;
		const found = candidateBatches.find((b) => Number(b.id) === Number(targetBatchId));
		if (found) return found;

		for (const act of activities) {
			const b = act.batches?.find((batch) => Number(batch.id) === Number(targetBatchId));
			if (b) {
				return {
					id: b.id,
					name: b.name,
					activityId: act.id,
					activityName: act.name,
					batchTypeId: b.batchTypeId ?? null,
					batchTypeName: b.batchTypeName ?? null,
					count: b.count,
					totalWeight: b.total_weight ?? null,
					isConfined: b.isConfined ?? null
				};
			}
		}
		return undefined;
	}, [candidateBatches, activities, targetBatchId]);

	const selectedActivity = useMemo(
		() => activities.find((a) => Number(a.id) === Number(mode === 'existing' ? targetBatch?.activityId : draft.activityId)),
		[activities, mode, targetBatch?.activityId, draft.activityId]
	);

	const selectedType = useMemo(
		() => batchTypes.find((t) => Number(t.id) === Number(mode === 'existing' ? targetBatch?.batchTypeId : draft.batchTypeId)),
		[batchTypes, mode, targetBatch?.batchTypeId, draft.batchTypeId]
	);

	// Whether a valid destination is currently selected
	const isDestinationSet =
		mode === 'existing'
			? targetBatchId != null && targetBatch != null
			: Boolean(draft.name.trim() && draft.activityId && draft.batchTypeId && !isManagementMissing);

	const handleReset = () => {
		onTargetBatchChange(undefined);
		onDraftChange({
			name: '',
			activityId: undefined,
			batchTypeId: undefined,
			isConfined: undefined
		});
		onModeChange('new');
		onResetDestination?.();
	};

	const destinationName = mode === 'new' ? draft.name : targetBatch?.name;
	const activityName = selectedActivity?.name ?? targetBatch?.activityName;
	const typeName = selectedType?.name ?? targetBatch?.batchTypeName;
	const typeColor = selectedType?.color;

	const isConfined = mode === 'new' ? draft.isConfined : targetBatch?.isConfined;

	// Used to be `code === 'RECRIA' || activityName.includes('recría')`: the same rule
	// written twice, the second time against a display name whose accent is not
	// guaranteed. The management system now belongs to every productive batch, so the
	// chip shows up whenever there is something declared to show.
	const declaresManagement = isConfined != null;

	return (
		<Paper
			elevation={0}
			sx={{
				p: { xs: 1.75, sm: 2 },
				px: { xs: 2, sm: 2.5 },
				borderRadius: '8px',
				border: '1px solid',
				borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
				bgcolor: isDark ? '#1e293b' : '#ffffff',
				boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
			}}
		>
			{!isDestinationSet ? (
				/* State 1: Unset / Pending Destination */
				<Stack
					direction={{ xs: 'column', md: 'row' }}
					justifyContent="space-between"
					alignItems={{ xs: 'flex-start', md: 'center' }}
					spacing={2}
				>
					{/* Left: Purposeful prompt */}
					<Stack direction="row" spacing={1.5} alignItems="center">
						<Box
							sx={{
								width: 38,
								height: 38,
								borderRadius: '8px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
								border: '1px solid',
								borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
								color: 'text.secondary',
								flexShrink: 0
							}}
						>
							<FuseSvgIcon size={20}>heroicons-outline:arrow-right-circle</FuseSvgIcon>
						</Box>

						<Box>
							<Stack direction="row" spacing={1} alignItems="center">
								<Typography
									variant="caption"
									sx={{
										fontSize: '0.68rem',
										fontWeight: 800,
										letterSpacing: '0.06em',
										textTransform: 'uppercase',
										color: 'text.secondary'
									}}
								>
									Destino de la Transferencia
								</Typography>
								<Box
									component="span"
									sx={{
										fontSize: '0.68rem',
										fontWeight: 700,
										px: 1,
										py: 0.15,
										borderRadius: '4px',
										bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
										color: 'text.secondary'
									}}
								>
									Sin asignar
								</Box>
							</Stack>
							<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.88rem' }}>
								Seleccioná un lote abierto de la estancia o configurá uno nuevo
							</Typography>
						</Box>
					</Stack>

					{/* Right: Actions */}
					<Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
						<Button
							size="small"
							variant="outlined"
							onClick={() => setIsExistingDialogOpen(true)}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:folder-open</FuseSvgIcon>}
							sx={{
								borderRadius: '6px',
								textTransform: 'none',
								fontSize: '0.8rem',
								fontWeight: 600,
								height: 32,
								borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : '#cbd5e1',
								color: 'text.primary',
								px: 2,
								'&:hover': {
									borderColor: activeColor,
									bgcolor: alpha(activeColor, 0.06),
									color: activeColor
								}
							}}
						>
							Lote existente
						</Button>

						<Button
							size="small"
							variant="contained"
							onClick={() => setIsNewDialogOpen(true)}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
							sx={{
								borderRadius: '6px',
								textTransform: 'none',
								fontSize: '0.8rem',
								fontWeight: 700,
								height: 32,
								bgcolor: palette.sapGreen,
								color: '#ffffff',
								px: 2.25,
								boxShadow: 'none',
								'&:hover': {
									bgcolor: palette.sapGreenHover,
									boxShadow: 'none'
								}
							}}
						>
							Nuevo lote
						</Button>
					</Stack>
				</Stack>
			) : (
				/* State 2: Destination Set - Executive ERP Presentation */
				<Stack
					direction={{ xs: 'column', lg: 'row' }}
					justifyContent="space-between"
					alignItems={{ xs: 'flex-start', lg: 'center' }}
					spacing={2}
				>
					{/* Left: Structured Target Metadata */}
					<Box sx={{ flexGrow: 1, minWidth: 0 }}>
						<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
							<Typography
								variant="caption"
								sx={{
									fontSize: '0.66rem',
									fontWeight: 800,
									letterSpacing: '0.06em',
									textTransform: 'uppercase',
									color: 'text.secondary'
								}}
							>
								Lote de Destino Asignado
							</Typography>
							<Box
								component="span"
								sx={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: 0.6,
									fontSize: '0.68rem',
									fontWeight: 700,
									px: 1,
									py: 0.15,
									borderRadius: '4px',
									bgcolor: mode === 'new'
										? isDark ? alpha(emeraldColor, 0.16) : '#ecfdf5'
										: isDark ? alpha(activeColor, 0.16) : '#eff6ff',
									color: mode === 'new' ? emeraldColor : activeColor
								}}
							>
								<Box
									component="span"
									sx={{
										width: 6,
										height: 6,
										borderRadius: '50%',
										bgcolor: mode === 'new' ? emeraldColor : activeColor
									}}
								/>
								{mode === 'new' ? 'Nuevo Lote' : 'Lote Existente'}
							</Box>
						</Stack>

						{/* Identity & Structured Data Row */}
						<Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ rowGap: 0.5 }}>
							{/* Batch Name */}
							<Typography
								variant="body1"
								sx={{
									fontWeight: 800,
									color: 'text.primary',
									fontSize: '1.02rem',
									letterSpacing: '-0.01em'
								}}
							>
								{destinationName}
							</Typography>

							<Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />

							{/* Etapa Productiva */}
							<Stack direction="row" spacing={0.6} alignItems="center">
								<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
									Etapa:
								</Typography>
								<Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.primary' }}>
									{activityName ?? 'Sin etapa'}
								</Typography>
							</Stack>

							{/* Tipo de Lote */}
							{typeName && (
								<>
									<Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />
									<Stack direction="row" spacing={0.6} alignItems="center">
										{typeColor && (
											<Box
												sx={{
													width: 7,
													height: 7,
													borderRadius: '50%',
													bgcolor: typeColor,
													flexShrink: 0
												}}
											/>
										)}
										<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
											Tipo:
										</Typography>
										<Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: typeColor ?? 'text.primary' }}>
											{typeName}
										</Typography>
									</Stack>
								</>
							)}

							{/* Stock Actual (Lote Existente) */}
							{mode === 'existing' && targetBatch != null && (
								<>
									<Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />
									<Stack direction="row" spacing={0.6} alignItems="center">
										<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
											Stock actual:
										</Typography>
										<Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.primary' }}>
											{targetBatch.count} cab
										</Typography>
									</Stack>
								</>
							)}

							{/* Sistema de Manejo (Recría) */}
							{declaresManagement && (
								<>
									<Divider orientation="vertical" flexItem sx={{ height: 16, my: 'auto' }} />
									<Stack direction="row" spacing={0.6} alignItems="center">
										<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
											Manejo:
										</Typography>
										<Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.primary' }}>
											{isConfined ? 'A corral (Feedlot)' : 'A campo (Pastoreo)'}
										</Typography>
									</Stack>
								</>
							)}
						</Stack>
					</Box>

					{/* Right: Actions */}
					<Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
						<Button
							size="small"
							variant="outlined"
							onClick={() => (mode === 'new' ? setIsNewDialogOpen(true) : setIsExistingDialogOpen(true))}
							startIcon={
								<FuseSvgIcon size={14}>
									{mode === 'new' ? 'heroicons-outline:pencil-square' : 'heroicons-outline:arrow-path'}
								</FuseSvgIcon>
							}
							sx={{
								height: 30,
								px: 1.5,
								borderRadius: '6px',
								textTransform: 'none',
								fontSize: '0.78rem',
								fontWeight: 600,
								borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : '#cbd5e1',
								color: 'text.primary',
								'&:hover': {
									borderColor: activeColor,
									bgcolor: alpha(activeColor, 0.05),
									color: activeColor
								}
							}}
						>
							{mode === 'new' ? 'Editar datos' : 'Cambiar lote'}
						</Button>

						<Button
							size="small"
							variant="text"
							onClick={handleReset}
							startIcon={<FuseSvgIcon size={14}>heroicons-outline:x-mark</FuseSvgIcon>}
							sx={{
								height: 30,
								px: 1.25,
								borderRadius: '6px',
								textTransform: 'none',
								fontSize: '0.78rem',
								fontWeight: 600,
								color: 'text.secondary',
								'&:hover': {
									color: isDark ? '#f87171' : '#dc2626',
									bgcolor: isDark ? alpha('#f87171', 0.08) : '#fef2f2'
								}
							}}
						>
							Deshacer
						</Button>
					</Stack>
				</Stack>
			)}

			{/* Modal Dialog for Selecting Existing Batch */}
			<SelectExistingBatchDialog
				open={isExistingDialogOpen}
				onClose={() => setIsExistingDialogOpen(false)}
				onSelect={(activityId, newTargetBatchId) => {
					onDraftChange({ ...draft, activityId });
					onTargetBatchChange(newTargetBatchId);
					onModeChange('existing');
				}}
				currentActivityId={mode === 'existing' ? targetBatch?.activityId ?? draft.activityId : undefined}
				currentTargetBatchId={targetBatchId}
				activities={activities}
				candidateBatches={candidateBatches}
			/>

			{/* Modal Dialog for Configuring New Batch */}
			<ConfigureDestinationBatchDialog
				open={isNewDialogOpen}
				onClose={() => setIsNewDialogOpen(false)}
				onSave={(newDraft) => {
					onDraftChange(newDraft);
					onTargetBatchChange(undefined);
					onModeChange('new');
				}}
				draft={draft}
				activities={activities}
				batchTypes={batchTypes}
				isLoadingBatchTypes={isLoadingBatchTypes}
			/>
		</Paper>
	);
};

export default TransferDestinationBar;
