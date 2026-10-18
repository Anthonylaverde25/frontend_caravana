import { Supplier, SupplierRole } from '../entities/Supplier';

export interface ISupplierRepository {
  /** The active company's providers; with a role, only those that sell it. */
  findAll(supplies?: SupplierRole): Promise<Supplier[]>;
  findById(id: number): Promise<Supplier | null>;
  save(supplier: Supplier): Promise<Supplier>;
  /** What the provider sells; refused while something depends on the role being removed. */
  updateRoles(id: number, roles: { supplies_livestock: boolean; supplies_items: boolean }): Promise<Supplier>;
}
