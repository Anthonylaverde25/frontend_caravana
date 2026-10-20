import { ISupplierRepository } from '../../domain/repositories/ISupplierRepository';
import { Supplier, SupplierDTO } from '../../domain/entities/Supplier';

/** Corrects a provider's identity and contact; the backend keeps the CUIT once it has documents. */
export class UpdateSupplierUseCase {
  constructor(private repository: ISupplierRepository) {}

  async execute(current: Supplier, changes: Pick<SupplierDTO, 'name' | 'commercial_name' | 'cuit' | 'location' | 'email' | 'phone'>): Promise<Supplier> {
    const supplier = Supplier.create({ ...current, ...changes });

    return this.repository.save(supplier);
  }
}
