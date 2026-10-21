import { useCallback } from 'react';
import { useFuseDialogContext } from '@fuse/core/FuseDialog/contexts/FuseDialogContext/useFuseDialogContext';
import type { WeaningType } from '@/features/weaning-orders/types';
import SeparationWeaningDialogContent from './SeparationWeaningDialogContent';
import { separationMessage } from './separationError';

const DIALOG_ID = 'mother-calf-separation';

/**
 * Turns the "this movement parts mothers from their calves" answer into a question: the kind of
 * weaning. Resolves with the kind chosen (send the movement again with it), or null when the error
 * was another one or the user cancelled.
 */
export function useSeparationWeaning() {
	const { openDialog, closeDialog } = useFuseDialogContext();

	return useCallback(
		(error: unknown): Promise<WeaningType | null> => {
			const message = separationMessage(error);

			if (message === null) return Promise.resolve(null);

			return new Promise((resolve) => {
				const finish = (type: WeaningType | null) => {
					closeDialog(DIALOG_ID);
					resolve(type);
				};

				openDialog({
					id: DIALOG_ID,
					content: () => (
						<SeparationWeaningDialogContent
							message={message}
							onConfirm={finish}
							onCancel={() => finish(null)}
						/>
					)
				});
			});
		},
		[openDialog, closeDialog]
	);
}
