import { Supplier, SupplierRole } from '../../domain/entities/Supplier';
import { ISupplierRepository } from '../../domain/repositories/ISupplierRepository';

export class ListSuppliersUseCase {
  constructor(private supplierRepository: ISupplierRepository) {}

  async execute(supplies?: SupplierRole): Promise<Supplier[]> {
    return this.supplierRepository.findAll(supplies);
  }
}
