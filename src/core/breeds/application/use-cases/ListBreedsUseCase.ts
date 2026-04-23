import { IBreedRepository } from '../../domain/repositories/IBreedRepository';
import { Breed } from '../../domain/entities/Breed';

export class ListBreedsUseCase {
  constructor(private breedRepository: IBreedRepository) {}

  async execute(): Promise<Breed[]> {
    return this.breedRepository.findAll();
  }
}
