import { useRegisterDeathOnExitLine } from '@/features/exit-orders/hooks/useExitOrderMutations';
import type { ExitOrder, ExitOrderLine } from '@/features/exit-orders/types';
import RegisterDeathDialog from '@/ui/herd/components/death/RegisterDeathDialog';

interface ExitLineDeathDialogProps {
	order: ExitOrder;
	line: ExitOrderLine;
	onClose: () => void;
}

/**
 * "Registrar muerte" from a pending line (01 §5.1): the death dialog of the herd, sent through the
 * order so the line is skipped and the animal goes to the death batch in one step.
 */
export function ExitLineDeathDialog({ order, line, onClose }: ExitLineDeathDialogProps) {
	const death = useRegisterDeathOnExitLine();

	return (
		<RegisterDeathDialog
			open
			onClose={onClose}
			animals={[{ id: line.caravan_id, label: line.label }]}
			notice={`Sale de la orden ${order.code} y pasa al Lote de Muertes.`}
			submitter={{
				isPending: death.isPending,
				send: (payload, callbacks) =>
					death.mutate(
						{
							id: order.id,
							caravanId: line.caravan_id,
							payload: {
								death_date: payload.death_date,
								death_cause_id: payload.death_cause_id,
								observations: payload.observations ?? null,
								death_batch_id: payload.death_batch_id ?? null
							}
						},
						callbacks
					)
			}}
		/>
	);
}

export default ExitLineDeathDialog;
