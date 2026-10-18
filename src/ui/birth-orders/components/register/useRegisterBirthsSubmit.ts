import { toast } from 'sonner';
import { useRegisterBirths } from '@/features/birth-orders/hooks/useBirthOrderMutations';
import type { BirthRollFemale } from '../grid/birthRollTypes';
import { useBirthCellErrors } from '../grid/useBirthCellErrors';
import type { BirthRollState } from '../grid/useBirthRollState';
import { toRegisterPayload, type RegisterBirthsHeader } from './registerBirths';

interface UseRegisterBirthsSubmitArgs {
  females: BirthRollFemale[];
  roll: BirthRollState;
  header: RegisterBirthsHeader;
  onDone: (orderId: number) => void;
}

/**
 * "Registrar N parto(s)", validated on click: at least one result, and every row with a result
 * complete. The server's row errors come back on the cells, and leave each one as it is corrected:
 * the grid takes `state`, not the bare roll.
 */
export function useRegisterBirthsSubmit({ females, roll, header, onDone }: UseRegisterBirthsSubmitArgs) {
  const register = useRegisterBirths();
  const { errors, state } = useBirthCellErrors(register.error, females, roll);

  const submit = () => {
    if (roll.resolved.length === 0) {
      toast.warning('Marcá el resultado de al menos un vientre. Los que quedan sin resultado no se registran.');
      return;
    }

    if (roll.problems.length > 0) {
      toast.warning(`Revisá ${roll.problems.length} fila(s) antes de registrar: ${roll.problems[0]}`);
      return;
    }

    register.mutate(toRegisterPayload(header, roll), { onSuccess: (result) => onDone(result.order.id) });
  };

  return { submit, errors, state, isSaving: register.isPending, statedCount: roll.resolved.length };
}
