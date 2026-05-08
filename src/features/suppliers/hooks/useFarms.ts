import { useQuery } from '@tanstack/react-query';
import { ApiFarmRepository } from '@/core/suppliers/infrastructure/repositories/ApiFarmRepository';

const farmRepository = new ApiFarmRepository();

export function useFarms(providerId?: number) {
  return useQuery({
    queryKey: ['farms', providerId],
    queryFn: () => farmRepository.findAll(providerId),
  });
}

export function useFarm(id: number | null | undefined) {
  return useQuery({
    queryKey: ['farms', id],
    queryFn: () => (id ? farmRepository.findById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}
