import { Supplier, SupplierDTO } from '../../domain/entities/Supplier';

export class SupplierMapper {
  public static toDomain(raw: any): Supplier {
    const dto: SupplierDTO = {
      id: raw.id,
      name: raw.name,
      commercial_name: raw.commercial_name,
      cuit: raw.cuit,
      location: raw.location,
      email: raw.email,
      phone: raw.phone,
      is_active: raw.is_active !== undefined ? Boolean(raw.is_active) : true,
      farms: raw.farms, // In a real scenario, map these to Farm entities if needed using FarmMapper
      created_at: raw.created_at,
    };
    return Supplier.create(dto);
  }

  public static toDTO(entity: Supplier): SupplierDTO {
    return {
      id: entity.id,
      name: entity.name,
      commercial_name: entity.commercial_name,
      cuit: entity.cuit,
      location: entity.location,
      email: entity.email,
      phone: entity.phone,
      is_active: entity.is_active,
      farms: entity.farms,
      created_at: entity.created_at,
    };
  }
}
