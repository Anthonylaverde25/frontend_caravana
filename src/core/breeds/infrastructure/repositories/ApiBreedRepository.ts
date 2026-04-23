import axiosInstance from '@/lib/axiosInstance';
import { Breed } from '../../domain/entities/Breed';
import { IBreedRepository } from '../../domain/repositories/IBreedRepository';

export class ApiBreedRepository implements IBreedRepository {
  async findAll(): Promise<Breed[]> {
    // La respuesta del backend según el BreedController de Laravel es { data: [...] }
    const response = await axiosInstance.get<{ data: Breed[] }>('/breeds');
    return response.data.data;
  }
}
