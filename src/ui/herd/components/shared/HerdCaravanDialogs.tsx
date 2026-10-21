import { useState } from 'react';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import type { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { useUpsertCaravan } from '@/features/caravans/hooks/useUpsertCaravan';
import CaravanDetailDrawer from 'src/components/caravan/CaravanDetailDrawer';
import CaravanFormDialog from 'src/components/caravan/dialogs/CaravanFormDialog';
import BatchQuickTransferDialog from 'src/ui/batches/components/details/BatchQuickTransferDialog';
import { CaravanWeightDialog } from '@/ui/weighing/components/caravan-weight/CaravanWeightDialog';
import type { HerdCaravanDialogsState } from '../../hooks/useHerdCaravanDialogs';
import BreedingEligibilityDialog from './breeding-eligibility/BreedingEligibilityDialog';
import RegisterDeathDialog from '../death/RegisterDeathDialog';

interface HerdCaravanDialogsProps {
	dialogs: HerdCaravanDialogsState;
	ownBatches: Batch[];
}

/**
 * The caravan dialogs of the herd views: detail drawer (with weigh, move and edit), create/edit
 * form, weighing, transfer; plus the breeding eligibility of one or many caravans.
 */
export function HerdCaravanDialogs({ dialogs, ownBatches }: HerdCaravanDialogsProps) {
	const upsert = useUpsertCaravan();
	const [moving, setMoving] = useState<{ batch: Batch; caravanIds: number[] } | null>(null);

	const viewing = dialogs.viewing;
	const viewingBatch = viewing?.batch_id ? (ownBatches.find((b) => b.id === viewing.batch_id) ?? null) : null;

	return (
		<>
			<CaravanDetailDrawer
				open={viewing !== null}
				onClose={dialogs.closeView}
				caravanId={viewing?.id ?? null}
				caravanIdentification={viewing ? (viewing.identification ?? viewing.label) : null}
				onWeigh={viewing ? () => dialogs.openWeigh(viewing) : undefined}
				onEdit={viewing ? () => dialogs.openEdit(viewing) : undefined}
				onRegisterDeath={viewing && !viewing.is_dead ? () => dialogs.openDeath([viewing]) : undefined}
				// Moving goes from one own batch to another: a caravan in no batch is assigned elsewhere.
				onMove={
					viewing && viewingBatch
						? () => setMoving({ batch: viewingBatch, caravanIds: [viewing.id] })
						: undefined
				}
			/>

			<CaravanFormDialog
				open={dialogs.form !== null}
				mode={dialogs.form?.mode ?? 'create'}
				caravanData={dialogs.form?.caravan ?? null}
				defaultBatchId={dialogs.form?.defaultBatchId}
				ownBatches={ownBatches}
				onClose={dialogs.closeForm}
				onSubmit={(payload) => upsert.mutate(payload, { onSuccess: dialogs.closeForm })}
				isSubmitting={upsert.isPending}
			/>

			<CaravanWeightDialog
				open={dialogs.weighing !== null}
				onClose={dialogs.closeWeigh}
				// The dialog reads id, identification and current_weight, all present in the summary row.
				caravan={dialogs.weighing as unknown as Caravan | null}
			/>

			{moving && (
				<BatchQuickTransferDialog
					open
					onClose={() => setMoving(null)}
					batch={moving.batch}
					// Kept in state: a fresh array per render would reset the dialog's selection.
					initialSelectedIds={moving.caravanIds}
				/>
			)}

			{dialogs.dying && (
				<RegisterDeathDialog
					open
					onClose={dialogs.closeDeath}
					animals={dialogs.dying.caravans.map((c) => ({ id: c.id, label: c.is_tagged ? `#${c.identification}` : c.label }))}
					onDone={() => {
						dialogs.dying?.onDone?.();
						dialogs.closeView();
					}}
				/>
			)}

			<BreedingEligibilityDialog
				open={dialogs.breeding !== null}
				onClose={dialogs.closeBreeding}
				caravans={dialogs.breeding?.caravans ?? []}
				onSaved={dialogs.breeding?.onSaved}
			/>
		</>
	);
}

export default HerdCaravanDialogs;
