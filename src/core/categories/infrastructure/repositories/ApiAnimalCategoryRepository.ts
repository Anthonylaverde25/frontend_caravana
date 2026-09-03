import axiosInstance from '@/utils/axios';
import { AnimalCategory, AnimalSubcategory } from '../../domain/entities/AnimalCategory';
import { IAnimalCategoryRepository } from '../../domain/repositories/IAnimalCategoryRepository';

export class ApiAnimalCategoryRepository implements IAnimalCategoryRepository {
  async findAll(): Promise<AnimalCategory[]> {
    const response = await axiosInstance.get<{ data: AnimalCategory[] }>('/animal-categories');
    return response.data.data;
  }

  async findSubcategories(categoryId: number): Promise<AnimalSubcategory[]> {
    const response = await axiosInstance.get<{ data: AnimalSubcategory[] }>(`/animal-categories/${categoryId}/subcategories`);
    return response.data.data;
  }
}
