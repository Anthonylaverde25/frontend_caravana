import type { Batch } from '@/core/batches/domain/entities/Batch';
import type { WeaningBatchOption } from './WeaningBatchSelectField';

/** Not a batch: the calves are weaned where they are. */
export const STAY_IN_PLACE_ID = -2;
export const STAY_IN_PLACE_LABEL = 'Quedan en su lote';

/** Batches that never receive weaned calves. */
const NOT_DESTINATIONS = ['INTERNAL_DEATH', 'INTERNAL_CONSUMPTION'];

/**
 * Where weaned calves may go: a weaning batch is the recommended destination, listed first; any
 * other own working batch is allowed too. External batches and death or consumption batches never.
 */
export function weaningDestinationOptions(batches: Batch[]): WeaningBatchOption[] {
	const own = batches.filter(
		(b) =>
			b.is_active &&
			b.farm_id == null &&
			b.provider_id == null &&
			!NOT_DESTINATIONS.includes(b.batch_type_code ?? '')
	);
	const toOption = (b: Batch, recommended: boolean): WeaningBatchOption => ({
		id: Number(b.id),
		name: b.name,
		caravans_count: b.caravans_count,
		is_confined: b.is_confined,
		group: recommended ? 'Lotes de destete (recomendado)' : 'Otros lotes propios'
	});

	return [
		...own.filter((b) => b.batch_type_code === 'WEANING').map((b) => toOption(b, true)),
		...own.filter((b) => b.batch_type_code !== 'WEANING').map((b) => toOption(b, false))
	];
}
