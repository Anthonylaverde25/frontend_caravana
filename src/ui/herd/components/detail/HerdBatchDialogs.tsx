import type { Batch } from '@/core/batches/domain/entities/Batch';
import AddCaravansDialog from 'src/ui/batches/components/AddCaravansDialog';
import StartBatchServiceDialog from 'src/ui/batches/components/dialogs/StartBatchServiceDialog';
import BatchQuickTransferDialog from 'src/ui/batches/components/details/BatchQuickTransferDialog';
import { BatchWeighingDialog } from '@/ui/weighing/components/batch-weighing/BatchWeighingDialog';
import ConsumptionDialog from '@/ui/stock/components/consumption/ConsumptionDialog';
import ChangeBatchManagementDialog from '@/ui/activities/dialogs/ChangeBatchManagementDialog';
import TagCalvesDialog from '../tag-calves/TagCalvesDialog';
import CastrationDialog from '../castration/CastrationDialog';

export type HerdBatchDialog =
	| { kind: 'add' | 'weigh' | 'service' | 'consume' | 'tag' | 'management' | 'castrate' }
	/** Without ids the transfer opens with nothing ticked; with them, those caravans ticked. */
	| { kind: 'transfer'; caravanIds: number[] | undefined }
	| null;

interface HerdBatchDialogsProps {
	batch: Batch;
	dialog: HerdBatchDialog;
	onClose: () => void;
}

/**
 * The dialogs of the batch page. Mounted only while open: they derive state from queries that are
 * idle when closed.
 */
export function HerdBatchDialogs({ batch, dialog, onClose }: HerdBatchDialogsProps) {
	switch (dialog?.kind) {
		case 'add':
			return (
				<AddCaravansDialog
					open
					onClose={onClose}
					batch={batch}
				/>
			);
		case 'transfer':
			return (
				<BatchQuickTransferDialog
					open
					onClose={onClose}
					batch={batch}
					initialSelectedIds={dialog.caravanIds}
				/>
			);
		case 'weigh':
			return (
				<BatchWeighingDialog
					open
					onClose={onClose}
					batch={batch}
				/>
			);
		case 'consume':
			return (
				<ConsumptionDialog
					open
					onClose={onClose}
					batch={batch}
				/>
			);
		case 'tag':
			return (
				<TagCalvesDialog
					open
					onClose={onClose}
					batch={batch}
				/>
			);
		case 'castrate':
			return (
				<CastrationDialog
					open
					onClose={onClose}
					batch={{ id: batch.id as number, name: batch.name }}
				/>
			);
		case 'service':
			return (
				<StartBatchServiceDialog
					open
					onClose={onClose}
					batch={batch}
				/>
			);
		case 'management':
			return (
				<ChangeBatchManagementDialog
					open
					onClose={onClose}
					batch={{
						id: batch.id as number,
						name: batch.name,
						farmName: batch.farm_name ?? '',
						count: batch.caravans_count ?? 0,
						isConfined: batch.is_confined ?? null,
						batchTypeName: batch.batch_type_name ?? null,
						wasEmptied: false,
						activityCode: batch.activity_code
					}}
				/>
			);
		default:
			return null;
	}
}

export default HerdBatchDialogs;
