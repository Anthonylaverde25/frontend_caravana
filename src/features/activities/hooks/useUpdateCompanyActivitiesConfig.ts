import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiActivityRepository } from '@/core/activities/infrastructure/repositories/ApiActivityRepository';
import { UpdateCompanyActivitiesConfigUseCase } from '@/core/activities/application/use-cases/UpdateCompanyActivitiesConfigUseCase';
import { CompanyActivityConfigPayload } from '@/core/activities/domain/repositories/IActivityRepository';
import { toast } from 'sonner';

const repository = new ApiActivityRepository();
const updateConfigUseCase = new UpdateCompanyActivitiesConfigUseCase(repository);

export function useUpdateCompanyActivitiesConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, config }: { companyId: number; config: CompanyActivityConfigPayload[] }) =>
      updateConfigUseCase.execute(companyId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Flujo de actividades actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el flujo de actividades');
    }
  });
}
