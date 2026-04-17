import { Supplier } from '../entities/Supplier';

export interface ISupplierRepository {
  findAll(): Promise<Supplier[]>;
  findById(id: number): Promise<Supplier | null>;
  save(supplier: Partial<Supplier>): Promise<Supplier>;
}
