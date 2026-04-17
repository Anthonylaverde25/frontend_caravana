import { useQuery } from '@tanstack/react-query';
import { ApiFarmRepository } from '@/core/suppliers/infrastructure/repositories/ApiFarmRepository';

const farmRepository = new ApiFarmRepository();

export function useFarms(providerId?: number) {
  return useQuery({
    queryKey: ['farms', providerId],
    queryFn: () => farmRepository.findAll(providerId),
  });
}
