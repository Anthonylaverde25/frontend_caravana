import { useMutation, useQueryClient } from '@tanstack/react-query';
import { veterinaryRepository } from '@/core/veterinary/infrastructure/repositories/ApiVeterinaryRepository';
import { DiagnosticProtocol, RegisterEvaluationSheetInput } from '@/core/veterinary/domain/VeterinaryTypes';

/**
 * A whole chute session in a single request.
 *
 * The previous implementation looped over the rows and issued one request per bull, which meant
 * a dropped connection halfway through left half a troop recorded and half not, and the sampling
 * checkboxes never reached the server at all. One call, one transaction, one extraction act.
 */
export function useRegisterEvaluationSheet() {
  const queryClient = useQueryClient();

  return useMutation<DiagnosticProtocol, unknown, RegisterEvaluationSheetInput>({
    mutationFn: (input) => veterinaryRepository.registerEvaluationSheet(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre-service-bulls'] });
      queryClient.invalidateQueries({ queryKey: ['diagnostic-protocols'] });
      queryClient.invalidateQueries({ queryKey: ['veterinary-portal-acts'] });
      queryClient.invalidateQueries({ queryKey: ['veterinary-portal-workspace'] });
    },
  });
}
