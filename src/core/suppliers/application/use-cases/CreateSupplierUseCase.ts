import { ISupplierRepository } from '../../domain/repositories/ISupplierRepository';
import { Supplier } from '../../domain/entities/Supplier';

export class CreateSupplierUseCase {
  constructor(private repository: ISupplierRepository) {}

  async execute(supplierData: any): Promise<Supplier> {
    // Domain Validation & Encapsulation
    const supplier = Supplier.create(supplierData);
    
    return this.repository.save(supplier);
  }
}
