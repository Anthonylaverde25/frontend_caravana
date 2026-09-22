import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiActivityRepository } from '@/core/activities/infrastructure/repositories/ApiActivityRepository';
import { ToggleCompanyActivityUseCase } from '@/core/activities/application/use-cases/ToggleCompanyActivityUseCase';
import { toast } from 'sonner';

const repository = new ApiActivityRepository();
const toggleUseCase = new ToggleCompanyActivityUseCase(repository);

export function useToggleCompanyActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, activityId, isEnabled }: { companyId: number; activityId: number; isEnabled: boolean }) =>
      toggleUseCase.execute(companyId, activityId, isEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Estado de la actividad actualizado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al cambiar estado de la actividad');
    }
  });
}
