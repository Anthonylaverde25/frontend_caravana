import { AnimalCategory, AnimalSubcategory } from '../entities/AnimalCategory';

export interface IAnimalCategoryRepository {
  findAll(): Promise<AnimalCategory[]>;
  findSubcategories(categoryId: number): Promise<AnimalSubcategory[]>;
}
