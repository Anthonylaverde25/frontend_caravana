import { Breed } from '../entities/Breed';

export interface IBreedRepository {
  findAll(): Promise<Breed[]>;
}
