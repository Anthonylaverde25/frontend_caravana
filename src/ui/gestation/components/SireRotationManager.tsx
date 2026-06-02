import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Alert, useTheme, CircularProgress, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useCreateServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { toast } from 'sonner';

import SireRotationFormFields from './sire-rotation/SireRotationFormFields';
import SireRotationMaleSelector from './sire-rotation/SireRotationMaleSelector';
import SireRotationFemaleSelector from './sire-rotation/SireRotationFemaleSelector';

/**
 * SireRotationManager Component
 * Re-designed in SAP Fiori style.
 * Uses strict rectangular layouts (borderRadius: 0), solid corporate colors, and zero gradients/shadows.
 * Features a flow starting from a "Nueva Orden de Servicio" button.
 */
function SireRotationManager() {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	// Helper to generate default service order code
	const generateDefaultCode = () => {
		const now = new Date();
		const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
		const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
		const randStr = Math.floor(1000 + Math.random() * 9000);
		return `SO-${dateStr}-${timeStr}-${randStr}`;
	};

	// 1. Fetch active company and load data from database (API)
	const { activeCompanyId } = useCompany();
	const { data: dbBatches = [], isLoading: isLoadingBatches } = useBatches();
	const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId);
	const createOrderMutation = useCreateServiceOrder();

	const navigate = useNavigate();

	const [selectedBatchId, setSelectedBatchId] = useState<number | 'all'>('all');
	const [orderCode, setOrderCode] = useState<string>(generateDefaultCode());
	const [observations, setObservations] = useState<string>('');
	const [serviceType, setServiceType] = useState<'single' | 'rotation' | 'multi'>('single');
	const [isControlledService, setIsControlledService] = useState<boolean>(false);
	const [femaleSireAssignments, setFemaleSireAssignments] = useState<Map<number, number>>(new Map());
	const [selectedSireIds, setSelectedSireIds] = useState<number[]>([]);
	const [selectedFemaleIds, setSelectedFemaleIds] = useState<number[]>([]);
	const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	// 3. Filter Male Caravans (available bulls) directly from database
	const availableBulls = useMemo(() => {
		return caravans
			.filter((c) => c.sex === 'M' && (c.category || '').toLowerCase() === 'toro')
			.sort((a, b) => a.identification.localeCompare(b.identification));
	}, [caravans]);

	// 4. Filter eligible female caravans from selected source batch (cows & heifers with no active gestation)
	const eligibleFemales = useMemo(() => {
		const list = caravans.filter((c) => {
			const matchBatch = selectedBatchId === 'all' ? true : c.batch_id === selectedBatchId;
			const isFemale = c.sex === 'H';
			const isCorrectCategory = ['vaca', 'vaquillona', 'vaca_vacia'].includes((c.category || '').toLowerCase());
			const hasNoActiveGestation = c.active_gestation === null;
			return matchBatch && isFemale && isCorrectCategory && hasNoActiveGestation;
		});

		return list.sort((a, b) => a.identification.localeCompare(b.identification));
	}, [caravans, selectedBatchId]);

	// Calculate live counts of eligible females by category
	const categoryCounts = useMemo(() => {
		const counts = { all: eligibleFemales.length, vaca: 0, vaquillona: 0, vaca_vacia: 0 };
		eligibleFemales.forEach((f) => {
			const cat = (f.category || '').toLowerCase();

			if (cat === 'vaca') counts.vaca++;
			else if (cat === 'vaquillona') counts.vaquillona++;
			else if (cat === 'vaca_vacia') counts.vaca_vacia++;
		});
		return counts;
	}, [eligibleFemales]);

	// Search & category filtered females
	const filteredFemales = useMemo(() => {
		return eligibleFemales.filter((f) => {
			const matchesSearch = f.identification.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory =
				selectedCategoryFilter === 'all'
					? true
					: (f.category || '').toLowerCase() === selectedCategoryFilter.toLowerCase();
			return matchesSearch && matchesCategory;
		});
	}, [eligibleFemales, searchQuery, selectedCategoryFilter]);

	// Auto-select eligible females when the source batch changes
	useEffect(() => {
		setSelectedFemaleIds(eligibleFemales.map((f) => f.id));
	}, [eligibleFemales]);

	// 7. Handlers
	const handleAddBull = (bullId: number) => {
		if (serviceType === 'single') {
			setSelectedSireIds([bullId]);
		} else {
			if (!selectedSireIds.includes(bullId)) {
				setSelectedSireIds([...selectedSireIds, bullId]);
			}
		}
	};

	const handleRemoveBull = (bullId: number) => {
		setSelectedSireIds(selectedSireIds.filter((id) => id !== bullId));
	};

	const handleSelectFemale = (id: number) => {
		if (selectedFemaleIds.includes(id)) {
			setSelectedFemaleIds(selectedFemaleIds.filter((fId) => fId !== id));
		} else {
			setSelectedFemaleIds([...selectedFemaleIds, id]);
		}
	};

	const handleSelectAllFemales = () => {
		if (selectedFemaleIds.length === filteredFemales.length) {
			setSelectedFemaleIds([]);
		} else {
			setSelectedFemaleIds(filteredFemales.map((f) => f.id));
		}
	};

	const handleDiscard = () => {
		setSelectedSireIds([]);
		setSelectedFemaleIds([]);
		setIsControlledService(false);
		setFemaleSireAssignments(new Map());
		setObservations('');
		setSelectedBatchId('all');
		setOrderCode(generateDefaultCode());
		setSearchQuery('');
		setSelectedCategoryFilter('all');
		setErrorMsg(null);
		navigate('/gestation');
	};

	const handleCreateOrder = async () => {
		if (selectedBatchId === 'all') {
			toast.error('Debe seleccionar un lote específico para generar la orden de servicio');
			return;
		}

		if (selectedSireIds.length === 0) {
			toast.error('Debe asignar al menos un toro reproductor');
			return;
		}

		if (selectedFemaleIds.length === 0) {
			toast.error('Debe seleccionar al menos un vientre apto');
			return;
		}

		if (!orderCode.trim()) {
			toast.error('Debe ingresar un código para la orden de servicio');
			return;
		}

		if (serviceType === 'multi' && isControlledService) {
			const missingAssignment = selectedFemaleIds.some((femaleId) => !femaleSireAssignments.has(femaleId));

			if (missingAssignment) {
				toast.error('Debe asignar un toro a cada vientre seleccionado en la modalidad controlada');
				return;
			}
		}

		setIsSubmitting(true);
		setErrorMsg(null);

		const assignments =
			serviceType === 'multi' && isControlledService
				? Array.from(femaleSireAssignments.entries())
						.filter(([femaleId]) => selectedFemaleIds.includes(femaleId))
						.map(([femaleId, assignedMaleId]) => ({
							female_caravan_id: femaleId,
							assigned_male_caravan_id: assignedMaleId
						}))
				: [];

		try {
			await createOrderMutation.mutateAsync({
				batch_id: selectedBatchId,
				code: orderCode.trim(),
				planned_start_date: startDate,
				observations: observations.trim() || null,
				male_caravan_ids: selectedSireIds,
				female_caravan_ids: selectedFemaleIds,
				service_type: serviceType,
				is_controlled_service: isControlledService,
				female_sire_assignments: assignments
			});

			toast.success('Orden de Servicio creada exitosamente en borrador');
			handleDiscard();
		} catch (e) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const error = e as any;
			const msg = error.response?.data?.message || error.message || 'Error desconocido';
			setErrorMsg(msg);
			toast.error(`Error al crear la orden: ${msg}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const borderStyle = isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.06)';
	const cardShadow = isDark ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.03)';

	const cellStyle = {
		px: 2,
		py: 1.25,
		borderRight: '1px solid',
		borderBottom: '1px solid',
		borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
		fontSize: '0.8rem',
		borderRadius: 0,
		backgroundColor: 'transparent',
		'&:last-child': { borderRight: 0 }
	};

	const tableHeaderStyle = {
		px: 2,
		py: 1.5,
		borderRight: '1px solid',
		borderBottom: '2px solid',
		borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
		fontSize: '0.78rem',
		fontWeight: 800,
		color: theme.palette.text.primary,
		backgroundColor: isDark ? theme.palette.background.default : '#f8f9fa',
		textTransform: 'uppercase',
		letterSpacing: '0.5px',
		borderRadius: 0,
		'&:last-child': { borderRight: 0 }
	};

	// Render loading state if data is fetching
	if (isLoadingBatches || isLoadingCaravans) {
		return (
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					p: 12,
					gap: 2.5,
					borderRadius: 0
				}}
			>
				<CircularProgress
					size={40}
					thickness={4}
					sx={{ borderRadius: 0 }}
				/>
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{ fontWeight: 600, letterSpacing: '0.2px' }}
				>
					Cargando configuración reproductiva...
				</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ width: '100%', pb: 2, borderRadius: 0 }}>
			{errorMsg && (
				<Alert
					severity="error"
					sx={{ mb: 4, borderRadius: 0, border: '1px solid', borderColor: 'error.light', boxShadow: 'none' }}
					onClose={() => setErrorMsg(null)}
				>
					{errorMsg}
				</Alert>
			)}

			{/* SINGLE-COLUMN LAYOUT */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					gap: 4,
					alignItems: 'stretch',
					borderRadius: 0,
					width: '100%'
				}}
			>
				{/* STEP 1: General Order Metadata */}
				<SireRotationFormFields
					dbBatches={dbBatches}
					selectedBatchId={selectedBatchId}
					setSelectedBatchId={setSelectedBatchId}
					orderCode={orderCode}
					setOrderCode={setOrderCode}
					startDate={startDate}
					setStartDate={setStartDate}
					serviceType={serviceType}
					setServiceType={setServiceType}
					isControlledService={isControlledService}
					setIsControlledService={setIsControlledService}
					observations={observations}
					setObservations={setObservations}
					setSelectedSireIds={setSelectedSireIds}
					setFemaleSireAssignments={setFemaleSireAssignments}
					borderStyle={borderStyle}
					isDark={isDark}
					cardShadow={cardShadow}
				/>

				{/* STEP 2: Sire Assignment (Bulls) */}
				<SireRotationMaleSelector
					availableBulls={availableBulls}
					selectedSireIds={selectedSireIds}
					handleAddBull={handleAddBull}
					handleRemoveBull={handleRemoveBull}
					borderStyle={borderStyle}
					isDark={isDark}
					cardShadow={cardShadow}
				/>

				{/* STEP 3: Vientres Disponibles (Eligible Females) */}
				<SireRotationFemaleSelector
					selectedBatchId={selectedBatchId}
					serviceType={serviceType}
					isControlledService={isControlledService}
					selectedFemaleIds={selectedFemaleIds}
					setSelectedFemaleIds={setSelectedFemaleIds}
					selectedSireIds={selectedSireIds}
					availableBulls={availableBulls}
					filteredFemales={filteredFemales}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					selectedCategoryFilter={selectedCategoryFilter}
					setSelectedCategoryFilter={setSelectedCategoryFilter}
					categoryCounts={categoryCounts}
					femaleSireAssignments={femaleSireAssignments}
					setFemaleSireAssignments={setFemaleSireAssignments}
					handleSelectFemale={handleSelectFemale}
					handleSelectAllFemales={handleSelectAllFemales}
					borderStyle={borderStyle}
					cellStyle={cellStyle}
					tableHeaderStyle={tableHeaderStyle}
					isDark={isDark}
					cardShadow={cardShadow}
				/>
			</Box>

			{/* PREMIUM ACTION BAR */}
			<Box
				sx={{
					mt: 5,
					p: 2,
					display: 'flex',
					justifyContent: 'flex-end',
					gap: 2,
					border: borderStyle,
					bgcolor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(239, 242, 245, 0.7)',
					backdropFilter: 'blur(10px)',
					borderRadius: '12px',
					boxShadow: cardShadow
				}}
			>
				<Button
					variant="text"
					sx={{
						textTransform: 'none',
						fontWeight: 700,
						color: 'text.secondary',
						py: 1,
						px: 3,
						fontSize: '0.825rem',
						borderRadius: '8px',
						'&:hover': {
							backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
						}
					}}
					onClick={handleDiscard}
					disabled={isSubmitting}
				>
					Descartar Borrador
				</Button>

				<Button
					variant="contained"
					disabled={
						isSubmitting ||
						selectedBatchId === 'all' ||
						selectedFemaleIds.length === 0 ||
						selectedSireIds.length === 0 ||
						!orderCode.trim()
					}
					onClick={handleCreateOrder}
					startIcon={
						isSubmitting ? (
							<CircularProgress
								size={16}
								color="inherit"
							/>
						) : (
							<FuseSvgIcon size={16}>heroicons-outline:document-plus</FuseSvgIcon>
						)
					}
					sx={{
						textTransform: 'none',
						fontWeight: 700,
						py: 1,
						px: 3.5,
						color: '#fff',
						borderRadius: '8px',
						fontSize: '0.85rem',
						boxShadow: 'none',
						bgcolor: isDark ? '#1a56db' : '#2563eb',
						'&:hover': {
							bgcolor: isDark ? '#1e429f' : '#1d4ed8',
							boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
						},
						'&:disabled': {
							background: isDark ? 'rgba(255,255,255,0.05)' : '#e5e9ec',
							color: 'text.disabled',
							boxShadow: 'none'
						}
					}}
				>
					{isSubmitting ? 'Creando Orden...' : 'Generar Orden de Servicio'}
				</Button>
			</Box>
		</Box>
	);
}

export default SireRotationManager;
