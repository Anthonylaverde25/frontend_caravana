import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import ViewLayout from '@/components/ViewLayout';
import { useCompany } from '@/contexts/CompanyContext';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useBatchTypes } from '@/features/batch-types/hooks/useBatchTypes';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBulkTransferCaravans } from '@/features/caravans/hooks/useBulkTransferCaravans';
import TransferSummaryCards from '../components/transfer/TransferSummaryCards';
import TransferDestinationBar, {
	DestinationCandidate,
	NewBatchDraft
} from '../components/transfer/TransferDestinationBar';
import TransferAnimalsTable from '../components/transfer/TransferAnimalsTable';
import ConfirmNewBatchDialog from '../components/transfer/ConfirmNewBatchDialog';
import TransferDestinationHeader from '../components/transfer/TransferDestinationHeader';
import TransferPerAnimalDestinations from '../components/transfer/TransferPerAnimalDestinations';
import TransferDestinationActivityPicker from '../components/transfer/TransferDestinationActivityPicker';
import { useTransferDestinations, TransferDestinationMode } from '../hooks/useTransferDestinations';
import { useCact01ScanOptions } from '@/ui/work-templates/hooks/useCact01ScanOptions';
import { useCact01Submission } from '@/ui/work-templates/hooks/useCact01Submission';
import type { Cact01Destination } from '@/ui/work-templates/components/scan/types';
import type { TransferOrder } from '@/features/transfer-orders/types';
import TransferOrderBanner from '../components/transfer/TransferOrderBanner';
import { readTransferPrefill } from '../components/transfer/transferPrefill';
import TransferActionBar from '../components/transfer/TransferActionBar';
import { useTransferOrderSession } from '../hooks/useTransferOrderSession';
import { useTransferOrderDraft } from '../hooks/useTransferOrderDraft';
import { useTransferCategoryPlan } from '../hooks/useTransferCategoryPlan';
import TransferCategoryCard from '../components/transfer/TransferCategoryCard';
import TransferCategoryTargets from '../components/transfer/TransferCategoryTargets';
import ExecuteTransferOrderDialog from '../components/transfer/ExecuteTransferOrderDialog';
import type { ExecuteTransferOrderBody } from '@/features/transfer-orders/hooks/useTransferOrderMutations';
import { useAnimalCategories } from '@/features/categories/hooks/useAnimalCategories';
import { labelOfPair } from '@/features/categories/categoryLabels';
import {
	TransferableCaravan,
	afterArriving,
	afterLeaving,
	figuresOfSelection,
	resolveBatchFigures
} from '../components/transfer/transferMath';

const EMPTY_DRAFT: NewBatchDraft = { name: '' };

/**
 * Transferring animals from one batch to another, on a screen of its own.
 *
 * This is what advances livestock through production stages: a batch never changes its
 * (activity, type) pair, so moving its caravans IS the movement, and it is what makes it
 * possible to open one weaning batch into several specialised ones.
 *
 * It used to be a small dialog. Choosing which animals travel is a long sweep over a
 * list, and the effect on both batches is the part nobody could see before committing —
 * neither fits in a modal, so the destination sits as a band over the table and the
 * outcome keeps a column of its own.
 */
export const TransferAnimalsView: React.FC = () => {
	const { batchId } = useParams();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { activeCompanyId } = useCompany();

	const sourceBatchId = Number(batchId);

	const { data: activities = [], isLoading: isLoadingActivities } = useActivities(activeCompanyId);
	const { data: batchTypes = [], isLoading: isLoadingBatchTypes } = useBatchTypes();
	const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId, 'own');
	const { mutate: transfer, isPending } = useBulkTransferCaravans();

	// The destination pre-built in "Nueva orden de transferencia", read once as the initial state.
	// An order the screen resumes is applied afterwards and overrides it.
	const [prefill] = useState(() => readTransferPrefill(searchParams));
	const prefilled = prefill?.destination;

	const [mode, setMode] = useState<'existing' | 'new'>(prefilled?.kind === 'existing' ? 'existing' : 'new');
	const [targetBatchId, setTargetBatchId] = useState<number | undefined>(
		prefilled?.kind === 'existing' ? prefilled.batchId : undefined
	);
	const [draft, setDraft] = useState<NewBatchDraft>(
		prefilled?.kind === 'new' ? { ...EMPTY_DRAFT, activityId: prefill?.destinationActivityId } : EMPTY_DRAFT
	);
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [isExecuteOpen, setIsExecuteOpen] = useState(false);
	const [destinationMode, setDestinationMode] = useState<TransferDestinationMode>(
		prefilled?.kind === 'per_animal' ? 'per_animal' : 'single'
	);
	/**
	 * The destination activity when the destination is per animal.
	 *
	 * With a single destination the activity is already implied by the batch chosen in the
	 * destination bar, which asks for the stage first. With one destination per animal nobody
	 * was asking, so the batches came from a flat list of the whole company: that is the gap
	 * this declaration closes.
	 *
	 * The activity is one fact of the movement, whatever way the destination gets decided: the one
	 * declared in "Nueva orden de transferencia" is taken here too, not only when that dialog
	 * already asked for per-animal destinations.
	 */
	const [perAnimalActivityId, setPerAnimalActivityId] = useState<number | null>(
		prefill?.destinationActivityId ?? null
	);
	/** Where that activity was already declared, so it is shown as a fact instead of asked again. */
	const [activityDeclaredIn, setActivityDeclaredIn] = useState<string | null>(
		prefill ? '«Nueva orden de transferencia»' : null
	);

	const sourceActivity = useMemo(
		() => activities.find((activity) => activity.batches?.some((b) => b.id === sourceBatchId)),
		[activities, sourceBatchId]
	);
	const batch = sourceActivity?.batches.find((b) => b.id === sourceBatchId) ?? null;

	const batchCaravans = useMemo(
		() => (caravans as unknown as TransferableCaravan[]).filter((caravan) => caravan.batch_id === sourceBatchId),
		[caravans, sourceBatchId]
	);

	// Every animal of the batch starts selected: moving the whole batch is the usual
	// case and the partial transfer is the exception. Only once, though: a background
	// refetch must not undo the animals the operator just unticked.
	const didPreselect = useRef(false);

	useEffect(() => {
		if (didPreselect.current || batchCaravans.length === 0) return;

		setSelectedIds(batchCaravans.map((c) => c.id));
		didPreselect.current = true;
	}, [batchCaravans]);

	// Same gap as the source batch: the sheet does not always publish the mass, and the
	// weights of every own animal are already in hand.
	const kgByBatch = useMemo(() => {
		const map = new Map<number, number>();

		(caravans as unknown as TransferableCaravan[]).forEach((caravan) => {
			if (caravan.batch_id == null || caravan.current_weight == null) return;

			map.set(caravan.batch_id, (map.get(caravan.batch_id) ?? 0) + Number(caravan.current_weight));
		});

		return map;
	}, [caravans]);

	const candidateBatches: DestinationCandidate[] = useMemo(
		() =>
			activities
				.filter((activity) => activity.isEnabled !== false)
				.flatMap((activity) =>
					activity.batches.map((b) => ({
						id: b.id,
						name: b.name,
						activityId: activity.id,
						activityName: activity.name,
						batchTypeId: b.batchTypeId ?? null,
						batchTypeName: b.batchTypeName ?? null,
						count: b.count,
						totalWeight: b.total_weight ?? kgByBatch.get(b.id) ?? null,
						isConfined: b.isConfined
					}))
				)
				.filter((b) => b.id !== sourceBatchId),
		[activities, kgByBatch, sourceBatchId]
	);

	const targetBatch = candidateBatches.find((b) => Number(b.id) === Number(targetBatchId));
	const targetBatchEntity = activities.flatMap((a) => a.batches).find((b) => Number(b.id) === Number(targetBatchId));

	// Per-animal destinations, and the CACT-01 channel that can record a movement with more
	// than one of them. bulk-transfer resolves exactly ONE target batch, so it simply cannot
	// carry this case — which is why the sheet and its endpoint exist.
	const perAnimal = destinationMode === 'per_animal';

	/**
	 * The destination activity of the movement, whichever way the destination was decided.
	 *
	 * One per movement, and therefore one per printed sheet however many pages it runs to.
	 * With a single destination it comes from the batch; with one per animal it is declared.
	 */
	const destinationActivityId = perAnimal
		? perAnimalActivityId
		: (mode === 'new' ? draft.activityId : targetBatch?.activityId) ?? null;
	const destinationActivity = activities.find((a) => Number(a.id) === Number(destinationActivityId));

	/**
	 * Switching to one destination per animal keeps the stage already declared — by the batch
	 * chosen, by the new batch, or by the dialog that opened the screen — instead of asking for it
	 * again. It can still be changed in the picker.
	 */
	const changeDestinationMode = (next: TransferDestinationMode) => {
		if (next === 'per_animal' && perAnimalActivityId == null) {
			const declared = (mode === 'new' ? draft.activityId : targetBatch?.activityId) ?? prefill?.destinationActivityId ?? null;

			if (declared != null) {
				setPerAnimalActivityId(Number(declared));
				setActivityDeclaredIn(prefill ? '«Nueva orden de transferencia»' : 'el destino elegido');
			}
		}

		setDestinationMode(next);
	};
	// The management system belongs to the batch, not to the stage: a destination batch
	// of any productive activity declares whether it is penned or grazing.
	const declaresManagement =
		Boolean(destinationActivity) && destinationActivity?.code !== 'INTERNAL';

	const cact01Options = useCact01ScanOptions();
	// No default management in per-animal mode: the draft belongs to the single-destination
	// bar, which is not even mounted here, and each destination declares its own.
	const perAnimalDestinations = useTransferDestinations(null, perAnimalActivityId);
	const cact01Submission = useCact01Submission();

	const unassignedCount = perAnimalDestinations.unassignedCount(selectedIds);
	const perAnimalIssues = perAnimal ? perAnimalDestinations.issuesFor(selectedIds) : [];

	/**
	 * Leaving animals unassigned is a deliberate choice, not a missing value: it means the
	 * batch of each one gets decided at the chute. What it costs is this screen's own
	 * execution, because a movement cannot be recorded against a destination nobody named.
	 * Printing stays available either way.
	 */
	const perAnimalBlockedReason = !perAnimal
		? null
		: perAnimalActivityId == null
			? 'Declará la actividad de destino del movimiento.'
			: selectedIds.length === 0
			? 'Elegí al menos un animal.'
			: unassignedCount > 0
				? `${unassignedCount} animal(es) sin destino asignado: el movimiento se registra al escanear la planilla.`
				: perAnimalIssues[0] ?? null;
	const isManagementMissing =
		mode === 'new' && declaresManagement && draft.isConfined !== true && draft.isConfined !== false;

	const draftType = batchTypes.find((t) => Number(t.id) === Number(draft.batchTypeId));

	const targetCaravans = useMemo(
		() =>
			targetBatchId == null
				? []
				: (caravans as unknown as TransferableCaravan[]).filter(
						(caravan) => Number(caravan.batch_id) === Number(targetBatchId)
					),
		[caravans, targetBatchId]
	);

	const moved = figuresOfSelection(batchCaravans, selectedIds);
	const sourceBefore = resolveBatchFigures(batch, batchCaravans);
	const sourceAfter = afterLeaving(sourceBefore, moved);
	const destinationBefore =
		mode === 'existing' && targetBatchEntity ? resolveBatchFigures(targetBatchEntity, targetCaravans) : null;
	const destinationAfter = afterArriving(destinationBefore, moved);

	const destinationName =
		mode === 'existing' ? (targetBatch?.name ?? null) : draft.name.trim() ? draft.name.trim() : null;

	/**
	 * The management system of the destination, for the box printed in the header.
	 *
	 * It comes from the batch that receives the animals. With an existing batch that is what
	 * the batch already declares — reading it off the new-batch draft instead is how the box
	 * used to print with both options unticked over a batch that had it perfectly declared.
	 * With one destination per animal there is no single answer: the letter goes in the M
	 * column of each row.
	 */
	const destinationIsConfined = perAnimal
		? null
		: mode === 'existing'
			? (targetBatch?.isConfined ?? null)
			: (draft.isConfined ?? null);

	const isDestinationReady =
		mode === 'existing'
			? targetBatchId != null && targetBatch != null
			: Boolean(draft.activityId && draft.name.trim() && draft.batchTypeId && !isManagementMissing);

	// Whether the animals change category, and to which: declared with the order, printed on the sheet.
	const categoryPlan = useTransferCategoryPlan(batchCaravans, selectedIds);
	const { categories } = useAnimalCategories();

	const orderDraft = useTransferOrderDraft({
		sourceBatchId,
		destinationMode,
		destinationActivityId,
		selectedIds,
		mode,
		targetBatch: targetBatch ? { id: Number(targetBatch.id), name: targetBatch.name } : null,
		draft,
		isManagementMissing,
		perAnimal: perAnimalDestinations,
		categoryMode: categoryPlan.mode,
		categoryTargets: categoryPlan.targets
	});

	// The order the screen is bound to: a draft keeps it editable, an issued one freezes it.
	const orderSession = useTransferOrderSession(
		sourceBatchId,
		Number(searchParams.get('orderId')) || null,
		orderDraft.payload
	);
	const order = orderSession.order;
	const isLocked = orderSession.isLocked;

	/** The transfer without an order, exactly as it worked before orders existed. */
	/**
	 * A category that changes only travels through an order or a sheet. Decided at the chute, it
	 * is not known yet; declared with one destination, the direct transfer (bulk-transfer) has no
	 * way to carry it, and moving the animals without it would drop it without a word.
	 */
	const categoryBlockedReason =
		categoryPlan.mode === 'AT_CHUTE'
			? 'La categoría se decide en la manga: el movimiento se registra al escanear la planilla.'
			: categoryPlan.mode === 'DECLARED' && !perAnimal
				? 'Con la categoría declarada, el movimiento se registra emitiendo y ejecutando la orden.'
				: null;

	const canTransfer =
		categoryBlockedReason === null &&
		(perAnimal
			? perAnimalBlockedReason === null && !isPending
			: isDestinationReady && selectedIds.length > 0 && !isPending);

	/**
	 * Fills the screen in from an order it did not build — a draft saved earlier or an issued
	 * order, found again when coming back to this batch. A draft is filled in and stays
	 * editable; an issued order is filled in and frozen.
	 */
	const applyOrderToScreen = (source: TransferOrder) => {
		const activityId = source.destination_activity.id;

		setDestinationMode(source.destination_mode);
		setSelectedIds(source.animals.filter((a) => a.status === 'PENDING').map((a) => a.caravan_id));
		didPreselect.current = true;
		categoryPlan.load(source);

		if (source.destination_mode === 'single') {
			const only = source.destinations[0];
			const existingId = only?.resolved_batch_id ?? only?.target_batch_id ?? null;

			if (existingId != null) {
				setMode('existing');
				setTargetBatchId(existingId);
			} else if (only) {
				setMode('new');
				setDraft({
					name: only.new_batch_name ?? only.label,
					activityId,
					batchTypeId: only.new_batch_type_id ?? undefined,
					isConfined: only.is_confined ?? undefined
				});
			}

			return;
		}

		setPerAnimalActivityId(activityId);
		setActivityDeclaredIn(`la orden ${source.code}`);
		perAnimalDestinations.load(
			source.destinations.map<Cact01Destination>((d) => {
				const existingId = d.resolved_batch_id ?? d.target_batch_id;

				return {
					key: d.key,
					label: d.label,
					mode: existingId != null ? 'existing' : 'new',
					batchId: existingId,
					name: d.label,
					activityId,
					batchTypeId: d.new_batch_type_id,
					isConfined: d.is_confined,
					touched: true
				};
			}),
			Object.fromEntries(
				source.animals
					.filter((a) => a.status === 'PENDING' && a.destination_key)
					.map((a) => [a.caravan_id, a.destination_key as string])
			)
		);
	};

	useEffect(() => {
		if (!order || !orderSession.shouldHydrate(order)) return;

		orderSession.markHydrated(order.id);
		applyOrderToScreen(order);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [order]);




	/**
	 * A per-animal movement goes through the CACT-01 channel, which closes the source once,
	 * moves to N destinations and recalculates once per batch. No weights travel: nobody was
	 * weighed here, so the source curve gets its closing point and its MOVEMENT_OUT and NO
	 * weighing point — which is exactly what the backend already does with an unweighed sheet.
	 */
	const submitPerAnimal = async () => {
		if (!canTransfer || !batch) return;

		const result = await cact01Submission.submit(
			{
				actividad_origen: sourceActivity?.name ?? '',
				actividad_destino_id: destinationActivityId,
				actividad_destino: destinationActivity?.name ?? '',
				lote_origen: batch.name,
				lote_destino: '',
				fecha_movimiento: new Date().toISOString().slice(0, 10),
				// Nothing to declare at header level: with one destination per animal, each
				// batch carries its own management system.
				sistema_manejo: '',
				total_cabezas: String(selectedIds.length),
				peso_total: '',
				responsable: '',
				observaciones: `Orden de trabajo generada desde la transferencia del lote ${batch.name}.`,
				// Without an order: a screen transfer that nobody ordered is still a valid movement.
				orden_transferencia: ''
			},
			sourceBatchId,
			perAnimalDestinations.usedDestinations,
			selectedIds.map((id) => {
				const caravan = batchCaravans.find((c) => c.id === id);

				return {
					id: String(id),
					pageKey: 'manual',
					caravana: caravan?.identification ?? '',
					peso_actual: '',
					sexo: '',
					categoria: '',
					dientes: '',
					destination_key: perAnimalDestinations.assignments[id] ?? '',
					// Redundante en este camino —el destino ya lo lleva— pero se manda para que la
					// fila diga lo mismo que habría dicho la celda M del papel.
					manejo: perAnimalDestinations.assignmentOf(perAnimalDestinations.assignments[id])?.manejo ?? '',
					// Without an order the category travels as the C/S the sheet would carry, and the
					// backend resolves it by the same rule.
					cs_nueva:
						categoryPlan.mode === 'DECLARED' && categoryPlan.targets[id]
							? (labelOfPair(
									categories,
									categoryPlan.targets[id]!.categoryId,
									categoryPlan.targets[id]!.subcategoryId
								) ?? '')
							: '',
					observations: ''
				};
			}),
			'SCREEN'
		);

		if (result) {
			navigate('/activities');
		}
	};

	/**
	 * Opening the sheet never creates anything: a draft opens as a preview that cannot be
	 * printed, an issued order opens ready to print. The view asks the order by id, so the URL
	 * alone reprints it from another computer.
	 */
	const openSheet = () => {
		if (order) navigate(`/work-templates/CACT-01?transferOrderId=${order.id}`);
	};

	const submit = async () => {
		if (!batch) return;

		// Against the order: what moves is what was committed, not what the screen shows. When it
		// happened and the category of each animal are declared in the dialog first.
		if (isLocked) {
			setIsExecuteOpen(true);

			return;
		}

		if (!canTransfer) return;

		if (perAnimal) {
			submitPerAnimal();
			return;
		}

		transfer(
			{
				caravanIds: selectedIds,
				targetBatchId: mode === 'existing' ? targetBatchId : null,
				newBatch:
					mode === 'new'
						? {
								name: draft.name.trim(),
								activity_id: draft.activityId,
								batch_type_id: draft.batchTypeId,
								// Sent only when answered: an unanswered question leaves the new
								// batch with its management system undeclared.
								...(draft.isConfined === true || draft.isConfined === false
									? { is_confined: draft.isConfined }
									: {})
							}
						: null,
				reason: `Transferencia desde el lote: ${batch.name}`
			},
			{
				onSuccess: () => {
					setIsConfirmOpen(false);
					navigate('/activities');
				}
			}
		);
	};

	const executeOrder = async (body: ExecuteTransferOrderBody) => {
		if (await orderSession.execute(body)) {
			setIsExecuteOpen(false);
			navigate('/activities');
		}
	};

	// Creating a batch leaves a new entity on the sheet, so it gets a confirmation;
	// moving animals into an open batch does not.
	const handlePrimaryAction = () => {
		if (!isLocked && !perAnimal && mode === 'new') {
			setIsConfirmOpen(true);
			return;
		}

		submit();
	};



	if (isLoadingActivities && !batch) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (!batch) {
		return (
			<Stack
				spacing={2}
				alignItems="center"
				sx={{ py: 10 }}
			>
				<Typography
					variant="h6"
					sx={{ fontWeight: 700 }}
				>
					No encontramos ese lote
				</Typography>
				<Typography
					variant="body2"
					color="text.secondary"
				>
					Puede que haya cambiado de nombre o que ya no esté en la planilla.
				</Typography>
				<Button
					variant="outlined"
					onClick={() => navigate('/activities')}
					sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '6px' }}
				>
					Volver a la planilla
				</Button>
			</Stack>
		);
	}

	return (
		<ViewLayout
			title="Transferencia de Hacienda y Creación de Lote"
			subtitle={`Lote de origen: ${batch.name}. Los pesos viajan con los animales seleccionados; ningún valor histórico se altera.`}
			// "Cancelar" is the back arrow of the view: one control less competing with the order.
			showBackButton
			backUrl="/activities"
			actions={
				<TransferActionBar
					session={orderSession}
					orderBlockedReason={orderDraft.blockedReason}
					transferLabel={
						perAnimal
							? `Transferir a ${perAnimalDestinations.usedDestinations.length} lote(s) (${selectedIds.length})`
							: mode === 'new'
								? `Crear lote y transferir (${selectedIds.length})`
								: `Transferir (${selectedIds.length})`
					}
					canTransfer={canTransfer}
					transferBlockedReason={categoryBlockedReason ?? perAnimalBlockedReason}
					onTransfer={handlePrimaryAction}
					isTransferring={isPending}
					onPrint={openSheet}
					onViewInList={() => order && navigate(`/transfer-orders?orderId=${order.id}`)}
				/>
			}
		>
			<Stack spacing={2.5}>
				{order && (
					<TransferOrderBanner
						order={order}
						isDirty={orderSession.isDirty}
						otherOpenCount={orderSession.otherOpenCount}
					/>
				)}

				{/* 4 KPI Ribbons */}
				<TransferSummaryCards
					sourceName={batch.name}
					destinationName={perAnimal ? null : destinationName}
					isNewDestination={!perAnimal && mode === 'new'}
					isDestinationChosen={
						perAnimal
							? perAnimalDestinations.usedDestinations.length > 0
							: mode === 'new'
								? Boolean(draft.name.trim())
								: Boolean(targetBatchId)
					}
					destinationCount={perAnimal ? perAnimalDestinations.usedDestinations.length : 1}
					moved={moved}
					sourceBefore={sourceBefore}
					sourceAfter={sourceAfter}
					destinationBefore={destinationBefore}
					destinationAfter={destinationAfter}
				/>

				{/* Un destino para todos, o uno por animal. Decide qué se imprime en la hoja
				    y, con ello, si el movimiento puede registrarse desde esta pantalla.
				    Con destino por animal, la misma tarjeta sigue con la etapa destino: es la
				    consecuencia de esa elección, no una decisión aparte. */}
				{/* An issued order freezes the destination: it is read, not edited. `inert` keeps
				    it visible and takes it out of reach, controls and keyboard alike. */}
				<Box inert={isLocked}>
				<TransferDestinationHeader
					mode={destinationMode}
					onModeChange={changeDestinationMode}
				>
					{perAnimal && (
						<TransferDestinationActivityPicker
							value={perAnimalActivityId}
							onChange={setPerAnimalActivityId}
							activities={cact01Options.activities}
							sourceActivityName={sourceActivity?.name ?? null}
							declaredCount={perAnimalDestinations.destinations.length}
							onDiscardDestinations={perAnimalDestinations.reset}
							declaredIn={activityDeclaredIn}
						/>
					)}
				</TransferDestinationHeader>
				</Box>

				{/* Los destinos sólo tienen sentido con la etapa ya declarada, que es lo que
				    acota los lotes que cada animal puede recibir. */}
				{perAnimal && perAnimalActivityId != null && (
					<TransferPerAnimalDestinations
						state={perAnimalDestinations}
						caravanIds={selectedIds}
						batches={cact01Options.batches}
						activities={cact01Options.activities}
						batchTypes={cact01Options.batchTypes}
						destinationActivityId={perAnimalActivityId}
						readOnly={isLocked}
					/>
				)}

				{/* Inline Destination Config Card */}
				{!perAnimal && (
				<Box inert={isLocked}>
				<TransferDestinationBar
					mode={mode}
					onModeChange={setMode}
					activities={activities}
					batchTypes={batchTypes}
					isLoadingBatchTypes={isLoadingBatchTypes}
					candidateBatches={candidateBatches}
					targetBatchId={targetBatchId}
					onTargetBatchChange={setTargetBatchId}
					draft={draft}
					onDraftChange={setDraft}
					isManagementMissing={isManagementMissing}
					movedCount={moved.count}
				/>
				</Box>
				)}

				{/* Whether the category changes: decides how the category columns of the sheet print. */}
				<Box inert={isLocked}>
					<TransferCategoryCard
						mode={categoryPlan.mode}
						onModeChange={categoryPlan.setMode}
					>
						{categoryPlan.mode === 'DECLARED' && (
							<TransferCategoryTargets
								plan={categoryPlan}
								caravans={batchCaravans}
								selectedIds={selectedIds}
								readOnly={isLocked}
								destinationActivityCode={destinationActivity?.code ?? null}
							/>
						)}
					</TransferCategoryCard>
				</Box>

				{/* Main Workspace: Full-Width Datatable */}
				<TransferAnimalsTable
					caravans={batchCaravans}
					isLoading={isLoadingCaravans}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
					destinations={perAnimal ? perAnimalDestinations.destinations : undefined}
					assignments={perAnimalDestinations.assignments}
					onAssign={perAnimal ? perAnimalDestinations.assign : undefined}
					readOnly={isLocked}
				/>
			</Stack>

			{order && isLocked && (
				<ExecuteTransferOrderDialog
					open={isExecuteOpen}
					order={order}
					caravans={batchCaravans}
					destinationActivityCode={destinationActivity?.code ?? null}
					isPending={orderSession.isExecuting}
					onClose={() => setIsExecuteOpen(false)}
					onConfirm={executeOrder}
				/>
			)}

			<ConfirmNewBatchDialog
				open={isConfirmOpen}
				onClose={() => setIsConfirmOpen(false)}
				onConfirm={submit}
				isPending={isPending || orderSession.isExecuting}
				name={draft.name.trim()}
				typeName={draftType?.name ?? null}
				typeColor={draftType?.color}
				activityName={destinationActivity?.name ?? null}
				isConfined={draft.isConfined ?? null}
				sourceName={batch.name}
				moved={moved}
				sourceAfter={sourceAfter}
			/>
		</ViewLayout>
	);
};

export default TransferAnimalsView;
