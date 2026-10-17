import { useQuery } from '@tanstack/react-query';
import { ApiWeighingTypeRepository } from '@/core/weighing/infrastructure/repositories/ApiWeighingTypeRepository';

const repository = new ApiWeighingTypeRepository();

/** The weighing purposes the farm offers in its forms, in the order of the productive cycle. */
export function useWeighingTypes(onlyActive = true) {
  return useQuery({
    queryKey: ['weighing-types', onlyActive],
    queryFn: () => repository.findAll(onlyActive),
    staleTime: 1000 * 60 * 10,
  });
}
