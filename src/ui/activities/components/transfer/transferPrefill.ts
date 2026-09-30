/**
 * The destination a transfer screen opens with when it was pre-built from the "Nueva orden de
 * transferencia" dialog. It travels in the query string and is read once, when the screen mounts;
 * an order the screen resumes (a draft or an issued one) still overrides it.
 */
export type TransferPrefillDestination =
	| { kind: 'existing'; batchId: number }
	| { kind: 'new' }
	| { kind: 'per_animal' };

export interface TransferPrefill {
	destinationActivityId: number;
	destination: TransferPrefillDestination;
}

const ACTIVITY_PARAM = 'destinationActivityId';
const DESTINATION_PARAM = 'destination';
const BATCH_PARAM = 'targetBatchId';

export function buildTransferPrefillQuery({ destinationActivityId, destination }: TransferPrefill): string {
	const params = new URLSearchParams({
		[ACTIVITY_PARAM]: String(destinationActivityId),
		[DESTINATION_PARAM]: destination.kind
	});

	if (destination.kind === 'existing') params.set(BATCH_PARAM, String(destination.batchId));

	return params.toString();
}

export function readTransferPrefill(params: URLSearchParams): TransferPrefill | null {
	const destinationActivityId = Number(params.get(ACTIVITY_PARAM));

	if (!destinationActivityId) return null;

	switch (params.get(DESTINATION_PARAM)) {
		case 'existing': {
			const batchId = Number(params.get(BATCH_PARAM));

			return batchId ? { destinationActivityId, destination: { kind: 'existing', batchId } } : null;
		}
		case 'new':
			return { destinationActivityId, destination: { kind: 'new' } };
		case 'per_animal':
			return { destinationActivityId, destination: { kind: 'per_animal' } };
		default:
			return null;
	}
}
