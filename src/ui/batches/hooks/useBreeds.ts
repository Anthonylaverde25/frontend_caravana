import { useQuery } from '@tanstack/react-query';
import { ApiBreedRepository } from '@/core/breeds/infrastructure/repositories/ApiBreedRepository';
import { ListBreedsUseCase } from '@/core/breeds/application/use-cases/ListBreedsUseCase';

const breedRepository = new ApiBreedRepository();
const listBreedsUseCase = new ListBreedsUseCase(breedRepository);

export function useBreeds() {
  return useQuery({
    queryKey: ['breeds'],
    queryFn: () => listBreedsUseCase.execute(),
    staleTime: 1000 * 60 * 60, // 1 hora de caché
  });
}
