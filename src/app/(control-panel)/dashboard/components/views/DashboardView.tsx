'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { Box, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router';
import ViewLayout from 'src/components/ViewLayout';
import PendingSiresWidget from 'src/ui/dashboard/widgets/PendingSiresWidget';
import PendingLabProtocolsWidget from 'src/ui/dashboard/widgets/pending-lab-protocols/PendingLabProtocolsWidget';

import { FioriKpiFacets } from '../fiori/FioriKpiFacets';
import { FioriTabBar } from '../fiori/FioriTabBar';
import { FioriFooterBar } from '../fiori/FioriFooterBar';

import { CreateEditBoardDialog } from '../board-manager/CreateEditBoardDialog';
import { AddWidgetDialog } from '../board-manager/AddWidgetDialog';
import { DashboardBlankCanvas } from '../canvas/DashboardBlankCanvas';
import { DashboardBoard, DashboardWidget } from '../board-manager/types';
import { DashboardKPIs } from '../cards/DashboardSummaryCards';

import { DashboardGeneralPanel } from '../panels/DashboardGeneralPanel';
import {
	DashboardHealthPanel,
	QuarantineCaravan,
	ConsumptionCaravan,
	DeathCaravan
} from '../panels/DashboardHealthPanel';
import { DashboardReproductivePanel } from '../panels/DashboardReproductivePanel';
import { DashboardPasturePanel } from '../panels/DashboardPasturePanel';

const INITIAL_BOARDS: DashboardBoard[] = [
	{ id: 'b_general', name: 'Tablero General', icon: 'heroicons-outline:squares-2x2', templateType: 'GENERAL' },
	{ id: 'b_health', name: 'Sanidad Interna', icon: 'heroicons-outline:shield-check', templateType: 'HEALTH' },
	{ id: 'b_repro', name: 'Reproducción & Entore', icon: 'heroicons-outline:heart', templateType: 'REPRODUCTIVE' },
	{ id: 'b_pasture', name: 'Pasturas & Recursos', icon: 'heroicons-outline:sparkles', templateType: 'PASTURE' }
];

const MOCK_QUARANTINE_DATA: QuarantineCaravan[] = [
	{
		id: 'AR-10024',
		tag: '10024',
		entryDate: '2026-05-18',
		diagnosis: 'Fiebre extrema (41.2°C) y decaimiento agudo',
		severity: 'CRITICAL',
		daysIsolated: 3
	},
	{
		id: 'AR-09822',
		tag: '09822',
		entryDate: '2026-05-20',
		diagnosis: 'Sintomatología respiratoria, disnea y tos seca',
		severity: 'HIGH',
		daysIsolated: 1
	},
	{
		id: 'AR-10543',
		tag: '10543',
		entryDate: '2026-05-19',
		diagnosis: 'Cojera grado 4 en miembro posterior izquierdo',
		severity: 'MEDIUM',
		daysIsolated: 2
	},
	{
		id: 'AR-10901',
		tag: '10901',
		entryDate: '2026-05-21',
		diagnosis: 'Aislamiento preventivo post-parto distócico',
		severity: 'LOW',
		daysIsolated: 0
	}
];

const MOCK_CONSUMPTION_DATA: ConsumptionCaravan[] = [
	{
		id: 'AR-08240',
		tag: '08240',
		assignDate: '2026-05-10',
		weight: 415.5,
		destination: 'Personal de Campo (Sector Norte)',
		status: 'Listo para faena'
	},
	{
		id: 'AR-08912',
		tag: '08912',
		assignDate: '2026-05-12',
		weight: 398.2,
		destination: 'Casino Central de Empleados',
		status: 'Listo para faena'
	},
	{
		id: 'AR-09122',
		tag: '09122',
		assignDate: '2026-05-15',
		weight: 380.0,
		destination: 'Premio Especial de Fin de Mes',
		status: 'En engorde final'
	}
];

const MOCK_DEATH_DATA: DeathCaravan[] = [
	{
		id: 'AR-07412',
		tag: '07412',
		deathDate: '2026-05-02',
		cause: 'Timpanismo agudo espumoso',
		diagnosedBy: 'Vet. Carlos Gómez',
		status: 'Acta Firmada'
	},
	{
		id: 'AR-06991',
		tag: '06991',
		deathDate: '2026-05-08',
		cause: 'Traumatismo severo (caída en manga)',
		diagnosedBy: 'Vet. Carlos Gómez',
		status: 'Acta Firmada'
	},
	{
		id: 'AR-08815',
		tag: '08815',
		deathDate: '2026-05-15',
		cause: 'Neumonía enzoótica bovina',
		diagnosedBy: 'Vet. Carlos Gómez',
		status: 'Acta Pendiente'
	}
];

export function DashboardView() {
	const { enqueueSnackbar } = useSnackbar();
	const navigate = useNavigate();

	// Load custom boards from localStorage
	const [boards, setBoards] = useState<DashboardBoard[]>(() => {
		try {
			const saved = localStorage.getItem('rxna_dashboard_boards_v2');

			if (saved) return JSON.parse(saved);
		} catch {
			// ignore
		}
		return INITIAL_BOARDS;
	});

	const [activeBoardId, setActiveBoardId] = useState<string>(() => boards[0]?.id || 'b_general');
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [boardToEdit, setBoardToEdit] = useState<DashboardBoard | null>(null);
	const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);

	useEffect(() => {
		try {
			localStorage.setItem('rxna_dashboard_boards_v2', JSON.stringify(boards));
		} catch {
			// ignore
		}
	}, [boards]);

	const activeBoard = useMemo(() => boards.find((b) => b.id === activeBoardId) || boards[0], [boards, activeBoardId]);

	const kpis: DashboardKPIs = useMemo(
		() => ({
			quarantineCount: MOCK_QUARANTINE_DATA.length,
			quarantineCritical: MOCK_QUARANTINE_DATA.filter((q) => q.severity === 'CRITICAL').length,
			serviceBatchesCount: 3,
			serviceFemales: 185,
			serviceMales: 6,
			serviceRatio: 3.2,
			consumptionCount: MOCK_CONSUMPTION_DATA.length,
			consumptionKg: 1193.7,
			deathCount: MOCK_DEATH_DATA.length,
			deathRate: 1.2
		}),
		[]
	);

	const handleActionClick = (actionName: string, caravanTag: string) => {
		enqueueSnackbar(`Acción [${actionName}] ejecutada para Caravana #${caravanTag}`, {
			variant: 'success',
			autoHideDuration: 3000
		});
	};

	const handleSaveBoard = (data: Partial<DashboardBoard>) => {
		if (boardToEdit) {
			setBoards((prev) => prev.map((b) => (b.id === boardToEdit.id ? { ...b, ...data } : b)));
			enqueueSnackbar(`Tablero "${data.name}" actualizado con éxito`, { variant: 'success' });
		} else {
			const newBoard: DashboardBoard = {
				id: `b_${Date.now()}`,
				name: data.name || 'Nuevo Tablero',
				icon: data.icon || 'heroicons-outline:rectangle-group',
				templateType: data.templateType || 'BLANK',
				widgets: [],
				isCustom: true
			};
			setBoards((prev) => [...prev, newBoard]);
			setActiveBoardId(newBoard.id);
			enqueueSnackbar(`Tablero "${newBoard.name}" creado con éxito`, { variant: 'success' });
		}
	};

	const handleDeleteBoard = (boardId: string) => {
		const remaining = boards.filter((b) => b.id !== boardId);
		setBoards(remaining);

		if (activeBoardId === boardId && remaining.length > 0) {
			setActiveBoardId(remaining[0].id);
		}

		enqueueSnackbar('Tablero eliminado', { variant: 'info' });
	};

	const handleAddWidgetToActiveBoard = (widget: DashboardWidget) => {
		setBoards((prev) =>
			prev.map((b) => (b.id === activeBoardId ? { ...b, widgets: [...(b.widgets || []), widget] } : b))
		);
		enqueueSnackbar(`Widget "${widget.title}" agregado al tablero`, { variant: 'success' });
	};

	const handleRemoveWidget = (widgetId: string) => {
		setBoards((prev) =>
			prev.map((b) =>
				b.id === activeBoardId ? { ...b, widgets: (b.widgets || []).filter((w) => w.id !== widgetId) } : b
			)
		);
	};

	const handleExportReport = () => {
		enqueueSnackbar('Generando informe consolidado de la Campaña 2026/2027...', { variant: 'info' });
	};

	const handleNewLot = () => {
		navigate('/gestation/service-batches');
	};

	return (
		<ViewLayout
			title="Dashboard Ganadero Integral"
			subtitle="Monitoreo consolidado de sanidad, entore reproductivo, faena interna y disponibilidad de pasturas."
			className="p-0 sm:p-0"
			actions={
				<Stack
					direction="row"
					spacing={1.5}
					alignItems="center"
				>
					<Button
						variant="outlined"
						size="small"
						onClick={handleExportReport}
						sx={{
							textTransform: 'none',
							fontSize: '0.78rem',
							fontWeight: 600,
							color: 'text.primary',
							borderColor: 'divider',
							borderRadius: '6px',
							px: 2,
							py: 0.7,
							bgcolor: 'background.paper',
							'&:hover': { bgcolor: 'action.hover', borderColor: 'text.secondary' }
						}}
						startIcon={
							<svg
								style={{ width: 14, height: 14, color: '#64748b' }}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
								/>
							</svg>
						}
					>
						Exportar Informe
					</Button>
					<Button
						variant="contained"
						size="small"
						onClick={handleNewLot}
						sx={{
							textTransform: 'none',
							fontSize: '0.78rem',
							fontWeight: 600,
							color: '#ffffff',
							bgcolor: '#0a4d3c',
							borderRadius: '6px',
							px: 2,
							py: 0.7,
							boxShadow: 'none',
							'&:hover': { bgcolor: '#07382c', boxShadow: 'none' }
						}}
						startIcon={
							<svg
								style={{ width: 14, height: 14 }}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
								/>
							</svg>
						}
					>
						Nuevo Registro Lote
					</Button>
				</Stack>
			}
		>
			<Stack
				spacing={0}
				sx={{ width: '100%', bgcolor: '#f5f6f8' }}
			>
				{/* 1. SAP Fiori KPI Micro-Metrics Header Facets */}
				<FioriKpiFacets
					kpis={kpis}
					onServiceClick={() => navigate('/gestation/service-batches')}
					onQuarantineClick={() => setActiveBoardId('b_health')}
				/>

				{/* 2. SAP Fiori IconTabBar Navigation */}
				<FioriTabBar
					boards={boards}
					activeBoardId={activeBoardId}
					onSelectBoard={setActiveBoardId}
					onOpenCreateDialog={() => {
						setBoardToEdit(null);
						setIsCreateOpen(true);
					}}
					onOpenEditDialog={(board) => {
						setBoardToEdit(board);
						setIsCreateOpen(true);
					}}
					onToggleFilter={() => {
						enqueueSnackbar('Filtros analíticos avanzados aplicados al tablero', { variant: 'info' });
					}}
				/>

				{/* 3. Main Content Workbench */}
				<Box
					component="main"
					sx={{
						flex: '1 1 auto',
						p: { xs: 2, sm: 3 },
						maxWidth: 1900,
						width: '100%',
						mx: 'auto'
					}}
				>
					<Stack spacing={3}>
						<PendingSiresWidget />
						<PendingLabProtocolsWidget />

						{/* Active Tab Panel */}
						{activeBoard?.templateType === 'GENERAL' && (
							<DashboardGeneralPanel
								kpis={kpis}
								quarantineData={MOCK_QUARANTINE_DATA}
								consumptionData={MOCK_CONSUMPTION_DATA}
								deathData={MOCK_DEATH_DATA}
								onActionClick={handleActionClick}
							/>
						)}

						{activeBoard?.templateType === 'HEALTH' && (
							<DashboardHealthPanel
								quarantineData={MOCK_QUARANTINE_DATA}
								consumptionData={MOCK_CONSUMPTION_DATA}
								deathData={MOCK_DEATH_DATA}
								onActionClick={handleActionClick}
							/>
						)}

						{activeBoard?.templateType === 'REPRODUCTIVE' && <DashboardReproductivePanel />}

						{activeBoard?.templateType === 'PASTURE' && <DashboardPasturePanel />}

						{activeBoard?.templateType === 'BLANK' && (
							<DashboardBlankCanvas
								boardName={activeBoard.name}
								widgets={activeBoard.widgets}
								kpis={kpis}
								quarantineData={MOCK_QUARANTINE_DATA}
								consumptionData={MOCK_CONSUMPTION_DATA}
								deathData={MOCK_DEATH_DATA}
								onOpenAddWidget={() => setIsAddWidgetOpen(true)}
								onRemoveWidget={handleRemoveWidget}
								onActionClick={handleActionClick}
							/>
						)}
					</Stack>
				</Box>

				{/* 4. SAP Fiori Horizon Footer Status Toolbar */}
				<FioriFooterBar />
			</Stack>

			{/* Dialogs */}
			{isCreateOpen && (
				<CreateEditBoardDialog
					key={boardToEdit?.id || 'new_board'}
					open={isCreateOpen}
					onClose={() => setIsCreateOpen(false)}
					boardToEdit={boardToEdit}
					onSaveBoard={handleSaveBoard}
					onDeleteBoard={handleDeleteBoard}
				/>
			)}

			{isAddWidgetOpen && (
				<AddWidgetDialog
					open={isAddWidgetOpen}
					onClose={() => setIsAddWidgetOpen(false)}
					onAddWidget={handleAddWidgetToActiveBoard}
					existingWidgetIds={(activeBoard?.widgets || []).map((w) => w.id.split('_')[0])}
				/>
			)}
		</ViewLayout>
	);
}

export default DashboardView;
