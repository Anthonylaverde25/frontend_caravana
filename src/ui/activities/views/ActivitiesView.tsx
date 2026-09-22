import {
	Box,
	Typography,
	Stack,
	Button,
	Menu,
	MenuItem,
} from '@mui/material';
import { useMemo, useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'framer-motion';
import ViewLayout from '@/components/ViewLayout';
import { useNavigate } from 'react-router';

import { useCompany } from '@/contexts/CompanyContext';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { ActivityBatch } from '@/core/activities/domain/entities/Activity';
import ManageCompanyActivitiesDialog from '../dialogs/ManageCompanyActivitiesDialog';
import ChangeBatchManagementDialog from '../dialogs/ChangeBatchManagementDialog';
import BatchSheetRow from '../components/production-sheet/BatchSheetRow';
import ProductionSheetFilters, {
	ManagementFilter,
} from '../components/production-sheet/ProductionSheetFilters';
import { declaresManagementSystem } from '../components/production-sheet/managementSystem';

const STAGE_UI_CONFIG = {
	CRIA: { icon: 'heroicons-outline:home', color: '#4CAF50' },
	RECRIA: { icon: 'heroicons-outline:trending-up', color: '#2196F3' },
	INVERNADA: { icon: 'heroicons-outline:sun', color: '#FF9800' },
};

const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.1 },
	},
};

const itemVariants = {
	hidden: { y: 20, opacity: 0 },
	show: { y: 0, opacity: 1 },
};

/**
 * ActivitiesView Component
 * Production board showing livestock batches across different production stages.
 *
 * Moving livestock forward is done by TRANSFERRING the animals to another batch, not
 * by changing the activity of the batch: a batch is immutable in its (activity, type)
 * pair, and a batch that migrated stage could not be split into several specialised
 * child batches nor keep the individual traceability of each animal.
 */
export default function ActivitiesView() {
	const navigate = useNavigate();
	const { activeCompanyId } = useCompany();
	const { data: activities, isLoading } = useActivities(activeCompanyId);

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedBatch, setSelectedBatch] = useState<
		(ActivityBatch & { activityName?: string; activityCode?: string }) | null
	>(null);
	const [isFlowDialogOpen, setIsFlowDialogOpen] = useState(false);
	const [isManagementDialogOpen, setIsManagementDialogOpen] = useState(false);

	const [managementFilter, setManagementFilter] = useState<ManagementFilter>('ALL');
	const [hideEmptyBatches, setHideEmptyBatches] = useState(false);

	const handleOpenMenu = (
		event: React.MouseEvent<HTMLElement>,
		batch: ActivityBatch,
		stage: { name: string; code: string },
	) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
		setSelectedBatch({ ...batch, activityName: stage.name, activityCode: stage.code });
	};

	const handleCloseMenu = () => {
		setAnchorEl(null);
	};

	const handleOpenMovementSheet = (stage: { id: number }) => {
		navigate(`/activities/sheet/${stage.id}`);
	};

	const handleTransfer = () => {
		if (selectedBatch) {
			navigate(`/activities/batches/${selectedBatch.id}/transfer`);
		}

		handleCloseMenu();
	};

	// The same movement, on paper. Whoever prefers to walk out to the chute with a sheet
	// instead of loading the batch from memory starts here.
	const handlePrintCact01 = () => {
		if (selectedBatch) {
			navigate(`/work-templates/CACT-01?sourceBatchId=${selectedBatch.id}`);
		}

		handleCloseMenu();
	};

	const handleChangeManagement = () => {
		setIsManagementDialogOpen(true);
		handleCloseMenu();
	};

	// Filter only enabled activities and sort by sortOrder
	const stages = useMemo(
		() =>
			activities
				?.filter((a) => a.isEnabled)
				.sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
				.map((a) => ({
					...a,
					batches: (a.batches || []).filter((batch) => {
						if (hideEmptyBatches && !batch.count) return false;

						if (managementFilter === 'ALL') return true;

						// A batch that never declared its management system is not an answer
						// to "penned or grazing", so it is left out of both instead of being
						// counted as extensive on the strength of a default nobody stated.
						// It has its own option now, which is what turns the gap into a list
						// of batches somebody still has to ask about.
						const declared = declaresManagementSystem(batch);

						if (managementFilter === 'UNDECLARED') return !declared;

						if (!declared) return false;

						return managementFilter === 'CONFINED' ? batch.isConfined : !batch.isConfined;
					}),
					icon: STAGE_UI_CONFIG[a.code]?.icon || 'heroicons-outline:collection',
					color: STAGE_UI_CONFIG[a.code]?.color || '#999',
					tag: a.isFinal ? 'Último Destino' : a.isInitial ? 'Origen / Entrada' : null,
				})) || [],
		[activities, hideEmptyBatches, managementFilter],
	);

	if (isLoading) {
		return (
			<Box className="p-24">
				<Typography>Cargando actividades...</Typography>
			</Box>
		);
	}

	return (
		<ViewLayout
			title="Planilla de Producción"
			subtitle="Control de existencias y movimientos por etapa productiva."
			actions={
				<Stack
					direction="row"
					spacing={2}
					alignItems="center"
				>
					<ProductionSheetFilters
						managementFilter={managementFilter}
						onManagementFilterChange={setManagementFilter}
						hideEmptyBatches={hideEmptyBatches}
						onHideEmptyBatchesChange={setHideEmptyBatches}
					/>
					<Button
						variant="outlined"
						size="small"
						onClick={() => setIsFlowDialogOpen(true)}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:check-circle</FuseSvgIcon>}
						sx={{
							textTransform: 'none',
							fontWeight: 700,
							borderRadius: '4px',
							bgcolor: 'white',
							borderColor: '#c6c6c6',
							color: 'text.primary',
							'&:hover': { bgcolor: '#f5f5f5' },
						}}
					>
						Activar Actividades
					</Button>
					<Button
						variant="contained"
						color="primary"
						size="small"
						onClick={() => setIsFlowDialogOpen(true)}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:arrows-right-left</FuseSvgIcon>}
						sx={{
							textTransform: 'none',
							fontWeight: 700,
							borderRadius: '4px',
							boxShadow: 'none',
							'&:hover': { boxShadow: 'none' },
						}}
					>
						Definir Flujo
					</Button>
				</Stack>
			}
		>
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: { lg: 'repeat(3, 1fr)', md: 'repeat(2, 1fr)', xs: '1fr' },
					gap: 3,
					flexGrow: 1,
				}}
				component={motion.div}
				variants={containerVariants}
				initial="hidden"
				animate="show"
			>
				{stages.map((stage) => (
					<Box
						key={stage.id}
						component={motion.div}
						variants={itemVariants}
						sx={{
							bgcolor: 'white',
							borderRadius: '4px',
							border: '1px solid #c6c6c6',
							display: 'flex',
							flexDirection: 'column',
							overflow: 'hidden',
							minHeight: 500,
							boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
						}}
					>
						{/* Header de la Hoja */}
						<Box
							sx={{
								p: 1.5,
								bgcolor: '#f3f3f3',
								borderBottom: '2px solid #c6c6c6',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<Stack
								direction="row"
								spacing={1}
								alignItems="center"
							>
								<Box
									sx={{
										width: 24,
										height: 24,
										borderRadius: '4px',
										bgcolor: stage.color,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										color: 'white',
									}}
								>
									<FuseSvgIcon size={16}>{stage.icon}</FuseSvgIcon>
								</Box>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 800,
										color: '#444',
										textTransform: 'uppercase',
										letterSpacing: 1,
									}}
								>
									{stage.name}
								</Typography>
								{stage.tag && (
									<Typography
										variant="caption"
										sx={{
											bgcolor: stage.isInitial ? '#10b981' : stage.isFinal ? '#f59e0b' : stage.color,
											color: 'white',
											px: 1,
											py: 0.2,
											borderRadius: '4px',
											fontSize: '0.62rem',
											fontWeight: 900,
											letterSpacing: 0.5,
										}}
									>
										{stage.tag.toUpperCase()}
									</Typography>
								)}
							</Stack>
							<Stack
								direction="row"
								spacing={1}
							>
								<Button
									variant="outlined"
									size="small"
									onClick={() => handleOpenMovementSheet(stage)}
									startIcon={<FuseSvgIcon size={14}>heroicons-outline:document-text</FuseSvgIcon>}
									sx={{
										textTransform: 'none',
										fontSize: '0.7rem',
										fontWeight: 700,
										borderRadius: '2px',
										py: 0.2,
										borderColor: '#c6c6c6',
										color: '#555',
										bgcolor: 'white',
										'&:hover': { bgcolor: '#f8f9fa', borderColor: stage.color },
									}}
								>
									Planilla
								</Button>
								<Button
									variant="outlined"
									size="small"
									startIcon={<FuseSvgIcon size={14}>heroicons-outline:plus</FuseSvgIcon>}
									sx={{
										textTransform: 'none',
										fontSize: '0.7rem',
										fontWeight: 700,
										borderRadius: '2px',
										py: 0.2,
										borderColor: '#c6c6c6',
										color: '#555',
										bgcolor: 'white',
										'&:hover': { bgcolor: '#f8f9fa', borderColor: stage.color },
									}}
								>
									Cargar
								</Button>
							</Stack>
						</Box>

						{/* Content */}
						<Box sx={{ flexGrow: 1, overflowX: 'auto' }}>
							<Box sx={{ minWidth: 350 }}>
								{/* Columns Header */}
								<Box
									sx={{
										display: 'grid',
										gridTemplateColumns: '1.5fr 1fr 0.8fr 0.4fr',
										bgcolor: '#f8f9fa',
										borderBottom: '1px solid #c6c6c6',
									}}
								>
									{['LOTE / GRANJA', 'CABEZAS', 'PESO PROMEDIO', 'MOVER'].map((col) => (
										<Box
											key={col}
											sx={{
												p: 1,
												borderRight: '1px solid #e0e0e0',
												'&:last-child': { borderRight: 0 },
												display: 'flex',
												justifyContent: col === 'LOTE / GRANJA' ? 'flex-start' : 'center',
											}}
										>
											<Typography
												variant="caption"
												sx={{ fontWeight: 900, color: '#777', fontSize: '0.65rem' }}
											>
												{col}
											</Typography>
										</Box>
									))}
								</Box>

								{/* Rows */}
								{(stage.batches || []).map((batch) => (
									<BatchSheetRow
										key={batch.id}
										batch={batch}
										stageColor={stage.color}
										showManagementSystem={declaresManagementSystem(batch)}
										onOpenMenu={(e, b) => handleOpenMenu(e, b, stage)}
									/>
								))}

								{/* Empty Rows */}
								{Array.from({ length: Math.max(0, 8 - (stage.batches || []).length) }).map((_, i) => (
									<Box
										key={`empty-${i}`}
										sx={{
											display: 'grid',
											gridTemplateColumns: '1.5fr 1fr 0.8fr 0.4fr',
											borderBottom: '1px solid #f0f0f0',
											height: 40,
										}}
									>
										<Box sx={{ borderRight: '1px solid #f0f0f0' }} />
										<Box sx={{ borderRight: '1px solid #f0f0f0' }} />
										<Box sx={{ borderRight: '1px solid #f0f0f0' }} />
										<Box />
									</Box>
								))}
							</Box>
						</Box>

						{/* Footer */}
						<Box
							sx={{
								p: 1,
								bgcolor: '#f8f9fa',
								borderTop: '1px solid #c6c6c6',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<Typography
								variant="caption"
								sx={{ fontWeight: 900, color: '#555', fontSize: '0.65rem' }}
							>
								TOTAL {stage.name.toUpperCase()}
							</Typography>
							<Typography
								variant="caption"
								sx={{ fontWeight: 900, color: stage.color, fontSize: '0.75rem' }}
							>
								{(stage.batches || []).reduce((acc, curr) => acc + curr.count, 0)} Cabezas
							</Typography>
						</Box>
					</Box>
				))}
			</Box>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleCloseMenu}
				PaperProps={{
					sx: {
						boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
						border: '1px solid #e0e0e0',
						minWidth: 240,
						borderRadius: '8px',
					},
				}}
			>
				<Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0', mb: 1 }}>
					<Typography
						variant="caption"
						sx={{ fontWeight: 900, color: '#999', textTransform: 'uppercase', fontSize: '0.65rem' }}
					>
						{selectedBatch?.name}
					</Typography>
				</Box>

				<MenuItem
					onClick={handleTransfer}
					sx={{ fontSize: '0.8rem', fontWeight: 700, py: 1.2, px: 2, gap: 1.5 }}
				>
					<FuseSvgIcon size={18}>heroicons-outline:arrows-right-left</FuseSvgIcon>
					Transferir animales
				</MenuItem>

				<MenuItem
					onClick={handlePrintCact01}
					sx={{ fontSize: '0.8rem', fontWeight: 700, py: 1.2, px: 2, gap: 1.5 }}
				>
					<FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>
					Imprimir Planilla CACT-01
				</MenuItem>

				<MenuItem
					onClick={handleChangeManagement}
					sx={{ fontSize: '0.8rem', fontWeight: 700, py: 1.2, px: 2, gap: 1.5 }}
				>
					<FuseSvgIcon size={18}>
						{selectedBatch?.isConfined === true ? 'heroicons-outline:sun' : 'heroicons-outline:home'}
					</FuseSvgIcon>
					Cambiar sistema de manejo
				</MenuItem>
			</Menu>

			<ChangeBatchManagementDialog
				open={isManagementDialogOpen}
				onClose={() => setIsManagementDialogOpen(false)}
				batch={selectedBatch}
			/>

			<ManageCompanyActivitiesDialog
				open={isFlowDialogOpen}
				onClose={() => setIsFlowDialogOpen(false)}
			/>
		</ViewLayout>
	);
}