import { useQuery } from '@tanstack/react-query';
import { ApiActivityRepository } from '@/core/activities/infrastructure/repositories/ApiActivityRepository';
import { ListActivitiesUseCase } from '@/core/activities/application/use-cases/ListActivitiesUseCase';

const activityRepository = new ApiActivityRepository();
const listActivitiesUseCase = new ListActivitiesUseCase(activityRepository);

export function useActivities(companyId: number | null | undefined) {
  return useQuery({
    queryKey: ['activities', companyId],
    queryFn: () => listActivitiesUseCase.execute(companyId || undefined),
    enabled: companyId != null,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
