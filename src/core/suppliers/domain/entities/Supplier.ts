import { Farm } from './Farm';

/** What a provider sells: livestock (origin of animals) or items (articles and services). */
export type SupplierRole = 'livestock' | 'items';

export interface SupplierDTO {
  id?: number;
  name: string;
  commercial_name: string | null;
  cuit: string;
  location: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  /** Sells livestock: shown in the origin selectors (entry orders, external batches). */
  supplies_livestock?: boolean;
  /** Sells articles or services. */
  supplies_items?: boolean;
  farms?: (Farm | any)[];
  created_at?: string;
}

export class Supplier {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly cuit: string,
    public readonly is_active: boolean,
    public readonly commercial_name: string | null,
    public readonly location: string | null,
    public readonly email: string | null,
    public readonly phone: string | null,
    public readonly farms?: (Farm | any)[],
    public readonly created_at?: string,
    public readonly supplies_livestock: boolean = true,
    public readonly supplies_items: boolean = false,
  ) {}

  public static create(dto: SupplierDTO): Supplier {
    if (!dto.name || dto.name.trim() === '') {
      throw new Error('Supplier name cannot be empty');
    }
    if (!dto.cuit || dto.cuit.trim() === '') {
      throw new Error('Supplier CUIT cannot be empty');
    }

    return new Supplier(
      dto.id ?? 0,
      dto.name,
      dto.cuit,
      dto.is_active ?? true,
      dto.commercial_name,
      dto.location,
      dto.email,
      dto.phone,
      dto.farms,
      dto.created_at,
      dto.supplies_livestock ?? true,
      dto.supplies_items ?? false
    );
  }

  // Domain Behaviors
  public hasFarms(): boolean {
    return this.farms !== undefined && this.farms.length > 0;
  }

  public getContactInfo(): string {
    return [this.email, this.phone].filter(Boolean).join(' | ') || 'Sin contacto';
  }

  public isActive(): boolean {
    return this.is_active;
  }
}
