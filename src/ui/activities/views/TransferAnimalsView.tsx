import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Box, Button, CircularProgress, Stack, Typography, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
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
import { useTransferPalette } from '../components/transfer/transferPalette';
import {
	TransferableCaravan,
	afterArriving,
	afterLeaving,
	figuresOfSelection,
	formatAverage,
	formatKg,
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
	const navigate = useNavigate();
	const palette = useTransferPalette();
	const { activeCompanyId } = useCompany();

	const sourceBatchId = Number(batchId);

	const { data: activities = [], isLoading: isLoadingActivities } = useActivities(activeCompanyId);
	const { data: batchTypes = [], isLoading: isLoadingBatchTypes } = useBatchTypes();
	const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(activeCompanyId, 'own');
	const { mutate: transfer, isPending } = useBulkTransferCaravans();

	const [mode, setMode] = useState<'existing' | 'new'>('new');
	const [targetBatchId, setTargetBatchId] = useState<number | undefined>(undefined);
	const [draft, setDraft] = useState<NewBatchDraft>(EMPTY_DRAFT);
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
	const destinationActivity = activities.find(
		(a) => Number(a.id) === Number(mode === 'new' ? draft.activityId : targetBatch?.activityId)
	);
	// The management system belongs to the batch, not to the stage: a destination batch
	// of any productive activity declares whether it is penned or grazing.
	const declaresManagement =
		Boolean(destinationActivity) && destinationActivity?.code !== 'INTERNAL';
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

	const isDestinationReady =
		mode === 'existing'
			? targetBatchId != null && targetBatch != null
			: Boolean(draft.activityId && draft.name.trim() && draft.batchTypeId && !isManagementMissing);

	const canSubmit = isDestinationReady && selectedIds.length > 0 && !isPending;



	const submit = () => {
		if (!canSubmit || !batch) return;

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

	// Creating a batch leaves a new entity on the sheet, so it gets a confirmation;
	// moving animals into an open batch does not.
	const handlePrimaryAction = () => {
		if (!canSubmit) return;

		if (mode === 'new') {
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
			actions={
				<Stack
					direction="row"
					spacing={1.5}
					alignItems="center"
				>
					{/* The same movement on paper, for whoever prefers to walk out to the
					    chute with a sheet instead of loading the batch from memory. This
					    screen's own logic is untouched by it. */}
					<Button
						variant="text"
						color="inherit"
						onClick={() => navigate(`/work-templates/CACT-01?sourceBatchId=${sourceBatchId}`)}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>}
						sx={{ fontWeight: 600, textTransform: 'none', borderRadius: '6px', px: 2 }}
					>
						Imprimir planilla CACT-01
					</Button>
					<Button
						variant="outlined"
						color="inherit"
						onClick={() => navigate('/activities')}
						sx={{ fontWeight: 600, textTransform: 'none', borderRadius: '6px', px: 2 }}
					>
						Cancelar
					</Button>
					<Button
						variant="contained"
						onClick={handlePrimaryAction}
						disabled={!canSubmit}
						startIcon={
							<FuseSvgIcon size={18}>
								{mode === 'new' ? 'heroicons-outline:check' : 'heroicons-outline:arrows-right-left'}
							</FuseSvgIcon>
						}
						sx={{
							fontWeight: 600,
							textTransform: 'none',
							borderRadius: '6px',
							px: 2.5,
							bgcolor: palette.sapGreen,
							color: '#ffffff',
							boxShadow: 'none',
							'&:hover': {
								bgcolor: palette.sapGreenHover,
								boxShadow: 'none'
							},
							'&.Mui-disabled': {
								bgcolor: palette.sapGreen,
								color: '#ffffff',
								opacity: 0.45
							}
						}}
					>
						{mode === 'new'
							? `Crear Lote y Transferir (${selectedIds.length})`
							: `Transferir (${selectedIds.length})`}
					</Button>
				</Stack>
			}
		>
			<Stack spacing={2.5}>
				{/* 4 KPI Ribbons */}
				<TransferSummaryCards
					sourceName={batch.name}
					destinationName={destinationName}
					isNewDestination={mode === 'new'}
					isDestinationChosen={mode === 'new' ? Boolean(draft.name.trim()) : Boolean(targetBatchId)}
					moved={moved}
					sourceBefore={sourceBefore}
					sourceAfter={sourceAfter}
					destinationBefore={destinationBefore}
					destinationAfter={destinationAfter}
				/>

				{/* Inline Destination Config Card */}
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

				{/* Main Workspace: Full-Width Datatable */}
				<TransferAnimalsTable
					caravans={batchCaravans}
					isLoading={isLoadingCaravans}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
				/>
			</Stack>

			<ConfirmNewBatchDialog
				open={isConfirmOpen}
				onClose={() => setIsConfirmOpen(false)}
				onConfirm={submit}
				isPending={isPending}
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
