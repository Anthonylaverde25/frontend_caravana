import { ISupplierRepository } from '../../domain/repositories/ISupplierRepository';
import { Supplier } from '../../domain/entities/Supplier';

export class CreateSupplierUseCase {
  constructor(private repository: ISupplierRepository) {}

  async execute(supplierData: Partial<Supplier>): Promise<Supplier> {
    return this.repository.save(supplierData);
  }
}
