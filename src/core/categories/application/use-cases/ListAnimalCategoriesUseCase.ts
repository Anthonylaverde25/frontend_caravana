import { AnimalCategory } from '../../domain/entities/AnimalCategory';
import { IAnimalCategoryRepository } from '../../domain/repositories/IAnimalCategoryRepository';

export class ListAnimalCategoriesUseCase {
  constructor(private readonly categoryRepository: IAnimalCategoryRepository) {}

  async execute(): Promise<AnimalCategory[]> {
    return this.categoryRepository.findAll();
  }
}
