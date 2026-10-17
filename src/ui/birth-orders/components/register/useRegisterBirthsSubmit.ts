import { useMemo } from 'react';
import { toast } from 'sonner';
import { useRegisterBirths } from '@/features/birth-orders/hooks/useBirthOrderMutations';
import { birthRowErrors } from '@/features/birth-orders/types';
import { cellErrorsByFemale, type BirthRollFemale } from '../grid/birthRollTypes';
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
 * complete. The server's row errors come back on the cells.
 */
export function useRegisterBirthsSubmit({ females, roll, header, onDone }: UseRegisterBirthsSubmitArgs) {
  const register = useRegisterBirths();
  const errors = useMemo(() => cellErrorsByFemale(birthRowErrors(register.error), females), [register.error, females]);

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

  return { submit, errors, isSaving: register.isPending, statedCount: roll.resolved.length };
}
