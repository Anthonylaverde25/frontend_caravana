import axiosInstance from '@/lib/axiosInstance';
import { Supplier } from '../../domain/entities/Supplier';
import { ISupplierRepository } from '../../domain/repositories/ISupplierRepository';

export class ApiSupplierRepository implements ISupplierRepository {
  async findAll(): Promise<Supplier[]> {
    const response = await axiosInstance.get<Supplier[]>('/providers');
    return response.data;
  }

  async findById(id: number): Promise<Supplier | null> {
    const response = await axiosInstance.get<Supplier>(`/providers/${id}`);
    return response.data;
  }

  async save(supplier: Partial<Supplier>): Promise<Supplier> {
    if (supplier.id) {
      const response = await axiosInstance.put<Supplier>(`/providers/${supplier.id}`, supplier);
      return response.data;
    }
    const response = await axiosInstance.post<Supplier>('/providers', supplier);
    return response.data;
  }
}
