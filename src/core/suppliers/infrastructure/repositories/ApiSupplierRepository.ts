import axiosInstance from '@/utils/axios';
import { Supplier, SupplierRole } from '../../domain/entities/Supplier';
import { ISupplierRepository } from '../../domain/repositories/ISupplierRepository';
import { SupplierMapper } from '../mappers/SupplierMapper';

export class ApiSupplierRepository implements ISupplierRepository {
  async findAll(supplies?: SupplierRole): Promise<Supplier[]> {
    const response = await axiosInstance.get<any[]>('/providers', { params: supplies ? { supplies } : undefined });
    return response.data.map(SupplierMapper.toDomain);
  }

  async findById(id: number): Promise<Supplier | null> {
    const response = await axiosInstance.get<any>(`/providers/${id}`);
    return SupplierMapper.toDomain(response.data);
  }

  async save(supplier: Supplier): Promise<Supplier> {
    const dto = SupplierMapper.toDTO(supplier);
    
    if (supplier.id && supplier.id > 0) {
      const response = await axiosInstance.put<any>(`/providers/${supplier.id}`, dto);
      return SupplierMapper.toDomain(response.data);
    }
    
    const response = await axiosInstance.post<any>('/providers', dto);
    return SupplierMapper.toDomain(response.data);
  }

  async updateRoles(id: number, roles: { supplies_livestock: boolean; supplies_items: boolean }): Promise<Supplier> {
    const response = await axiosInstance.patch<any>(`/providers/${id}/roles`, roles);
    return SupplierMapper.toDomain(response.data);
  }
}
