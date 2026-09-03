import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Alert, CircularProgress } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useCreateServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { toast } from 'sonner';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { simulateMating } from '@/core/caravans/domain/services/pedigreeAnalysis';

import SireRotationFormFields from './sire-rotation/SireRotationFormFields';
import SireRotationMaleSelector from './sire-rotation/SireRotationMaleSelector';
import SireRotationFemaleSelector from './sire-rotation/SireRotationFemaleSelector';
import SireRotationInbreedingDialog, { RiskyFemalePair } from './sire-rotation/SireRotationInbreedingDialog';
import MatingAdvisorDialog from './pedigree/MatingAdvisorDialog';

/**
 * SireRotationManager Component
 * Orchestrates Service Order / Entore creation with live Wright Fx inbreeding audit,
 * bull battery kinship detection, and assisted/optional exclusion of risky crossbreeds.
 */
function SireRotationManager() {
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
	const { data: dbBatches = [], isLoading: isLoadingBatches } = useBatches(undefined, undefined, 'own');
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

	// Dialog States
	const [isMatingAdvisorOpen, setIsMatingAdvisorOpen] = useState<boolean>(false);
	const [matingAdvisorDamId, setMatingAdvisorDamId] = useState<number | null>(null);
	const [matingAdvisorSireId, setMatingAdvisorSireId] = useState<number | null>(null);

	const [isInbreedingDialogOpen, setIsInbreedingDialogOpen] = useState<boolean>(false);
	const [riskyFemalesForDialog, setRiskyFemalesForDialog] = useState<RiskyFemalePair[]>([]);

	// 2. Index caravans map in memory for ultra-fast pedigree and inbreeding lookups (< 5ms)
	const caravansMap = useMemo(() => {
		const map = new Map<number, Caravan>();
		caravans.forEach((c) => map.set(c.id, c));
		return map;
	}, [caravans]);

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

	const handleOpenMatingAdvisor = (damId?: number, sireId?: number) => {
		setMatingAdvisorDamId(damId || null);
		setMatingAdvisorSireId(sireId || null);
		setIsMatingAdvisorOpen(true);
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

	// 8. Core execution of Service Order creation
	const executeOrderCreation = async (femaleIdsToSubmit: number[]) => {
		setIsSubmitting(true);
		setErrorMsg(null);

		const assignments =
			serviceType === 'multi' && isControlledService
				? Array.from(femaleSireAssignments.entries())
						.filter(([femaleId]) => femaleIdsToSubmit.includes(femaleId))
						.map(([femaleId, assignedMaleId]) => ({
							female_caravan_id: femaleId,
							assigned_male_caravan_id: assignedMaleId
						}))
				: [];

		try {
			await createOrderMutation.mutateAsync({
				batch_id: selectedBatchId as number,
				code: orderCode.trim(),
				planned_start_date: startDate,
				observations: observations.trim() || null,
				male_caravan_ids: selectedSireIds,
				female_caravan_ids: femaleIdsToSubmit,
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

	// 9. Validation Gate with Assisted Inbreeding Audit before creation
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

		// Audit inbreeding among selected females
		const riskyList: RiskyFemalePair[] = [];

		selectedFemaleIds.forEach((fId) => {
			const female = caravansMap.get(fId);
			if (!female) return;

			if (serviceType === 'single') {
				const sireId = selectedSireIds[0];
				const sim = simulateMating(fId, sireId, caravansMap);
				if (sim && sim.projectedInbreeding >= 6.25) {
					const sObj = caravansMap.get(sireId);
					riskyList.push({
						female,
						fx: sim.projectedInbreeding,
						risk: sim.risk,
						sireDesc: `Toro #${sObj?.identification || sireId}`,
						commonAncestors: sim.commonAncestors
					});
				}
			} else if (serviceType === 'multi' && isControlledService) {
				const assignedSireId = femaleSireAssignments.get(fId);
				if (assignedSireId) {
					const sim = simulateMating(fId, assignedSireId, caravansMap);
					if (sim && sim.projectedInbreeding >= 6.25) {
						const sObj = caravansMap.get(assignedSireId);
						riskyList.push({
							female,
							fx: sim.projectedInbreeding,
							risk: sim.risk,
							sireDesc: `Toro #${sObj?.identification || assignedSireId} (Asignado)`,
							commonAncestors: sim.commonAncestors
						});
					}
				}
			} else {
				// Multi-sire collective / rotation: check highest inbreeding against any selected bull
				let maxSim = simulateMating(fId, selectedSireIds[0], caravansMap);
				selectedSireIds.forEach((sId) => {
					const sim = simulateMating(fId, sId, caravansMap);
					if (sim && maxSim && sim.projectedInbreeding > maxSim.projectedInbreeding) {
						maxSim = sim;
					}
				});

				if (maxSim && maxSim.projectedInbreeding >= 6.25) {
					riskyList.push({
						female,
						fx: maxSim.projectedInbreeding,
						risk: maxSim.risk,
						sireDesc: `Batería de toros (Riesgo máximo con Toro #${maxSim.sire.identification})`,
						commonAncestors: maxSim.commonAncestors
					});
				}
			}
		});

		// If risky crossbreeds exist, prompt the user with non-blocking assisted choices
		if (riskyList.length > 0) {
			setRiskyFemalesForDialog(riskyList);
			setIsInbreedingDialogOpen(true);
			return;
		}

		// If no risky pairings, proceed directly
		await executeOrderCreation(selectedFemaleIds);
	};

	// Dialog Action: User accepts the risk and proceeds with all females
	const handleConfirmWithAll = async () => {
		setIsInbreedingDialogOpen(false);
		await executeOrderCreation(selectedFemaleIds);
	};

	// Dialog Action: User chooses to exclude risky females and proceed with the rest
	const handleExcludeAndConfirm = async () => {
		const riskyIds = new Set(riskyFemalesForDialog.map((r) => r.female.id));
		const safeIds = selectedFemaleIds.filter((id) => !riskyIds.has(id));

		setSelectedFemaleIds(safeIds);
		setIsInbreedingDialogOpen(false);

		if (safeIds.length === 0) {
			toast.error('Todos los vientres seleccionados presentaban consanguinidad. Seleccione otros vientres antes de continuar.');
			return;
		}

		await executeOrderCreation(safeIds);
	};

	// Render loading state if data is fetching
	if (isLoadingBatches || isLoadingCaravans) {
		return (
			<div className="flex flex-col justify-center items-center py-24 gap-3">
				<CircularProgress size={36} thickness={4} />
				<p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
					Cargando configuración reproductiva...
				</p>
			</div>
		);
	}

	const isGenerateDisabled =
		isSubmitting ||
		selectedBatchId === 'all' ||
		selectedFemaleIds.length === 0 ||
		selectedSireIds.length === 0 ||
		!orderCode.trim();

	return (
		<div className="w-full flex flex-col gap-6 relative">
			{errorMsg && (
				<Alert
					severity="error"
					className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
					onClose={() => setErrorMsg(null)}
				>
					{errorMsg}
				</Alert>
			)}

			{/* Order Form (single unified sheet) */}
			<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden pb-8">
				{/* Order Information */}
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
				/>

				{/* Sires (Bulls) */}
				<div className="border-t border-gray-200 dark:border-gray-800">
					<SireRotationMaleSelector
						availableBulls={availableBulls}
						selectedSireIds={selectedSireIds}
						handleAddBull={handleAddBull}
						handleRemoveBull={handleRemoveBull}
						caravansMap={caravansMap}
						eligibleFemales={eligibleFemales}
						onOpenMatingAdvisor={handleOpenMatingAdvisor}
					/>
				</div>

				{/* Eligible Females */}
				<div className="border-t border-gray-200 dark:border-gray-800">
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
						caravansMap={caravansMap}
						onOpenMatingAdvisor={handleOpenMatingAdvisor}
					/>
				</div>
			</div>

			{/* Sticky Action Bar */}
			<footer className="sticky bottom-0 z-20 mt-6 -mx-4 -mb-4 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2 flex-wrap text-xs">
					<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
						<FuseSvgIcon size={14}>heroicons-outline:map-pin</FuseSvgIcon>
						{selectedBatchId === 'all'
							? 'Sin lote seleccionado'
							: `Lote: ${dbBatches.find((b) => b.id === selectedBatchId)?.name ?? `#${selectedBatchId}`}`}
					</span>
					<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
						<FuseSvgIcon size={14}>heroicons-outline:shield-check</FuseSvgIcon>
						{selectedSireIds.length} {selectedSireIds.length === 1 ? 'toro' : 'toros'}
					</span>
					<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
						<FuseSvgIcon size={14}>heroicons-outline:users</FuseSvgIcon>
						{selectedFemaleIds.length} {selectedFemaleIds.length === 1 ? 'vientre' : 'vientres'}
					</span>
				</div>

				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={handleDiscard}
						disabled={isSubmitting}
						className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors disabled:opacity-50"
					>
						Descartar Borrador
					</button>
					<button
						type="button"
						onClick={handleCreateOrder}
						disabled={isGenerateDisabled}
						className={`px-5 py-2 text-sm font-semibold text-white rounded-md flex items-center gap-2 transition-colors ${
							isGenerateDisabled
								? 'bg-gray-350 dark:bg-gray-850 text-gray-400 dark:text-gray-600 cursor-not-allowed'
								: 'bg-[#0a6ed1] hover:bg-[#0854a0]'
						}`}
					>
						{isSubmitting ? (
							<CircularProgress size={16} color="inherit" />
						) : (
							<FuseSvgIcon size={16}>heroicons-outline:document-text</FuseSvgIcon>
						)}
						{isSubmitting ? 'Creando Orden...' : 'Generar Orden de Servicio'}
					</button>
				</div>
			</footer>

			{/* Preventative Inbreeding Confirmation Modal */}
			<SireRotationInbreedingDialog
				open={isInbreedingDialogOpen}
				onClose={() => setIsInbreedingDialogOpen(false)}
				riskyFemales={riskyFemalesForDialog}
				onConfirmWithAll={handleConfirmWithAll}
				onExcludeAndConfirm={handleExcludeAndConfirm}
				isSubmitting={isSubmitting}
			/>

			{/* Mating Advisor Simulation Modal */}
			<MatingAdvisorDialog
				open={isMatingAdvisorOpen}
				onClose={() => setIsMatingAdvisorOpen(false)}
				caravans={caravans}
				initialDamId={matingAdvisorDamId}
				initialSireId={matingAdvisorSireId}
			/>
		</div>
	);
}

export default SireRotationManager;

