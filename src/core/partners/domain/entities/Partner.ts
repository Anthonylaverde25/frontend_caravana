import { Farm } from './Farm';
import { PartnerContact } from './PartnerContact';
import { CUSTOMER_ROLES, PartnerRole, SUPPLIER_ROLES, sortRoles } from './PartnerRole';

export interface PartnerDTO {
  id?: number;
  name: string;
  commercial_name: string | null;
  cuit: string;
  location: string | null;
  is_active: boolean;
  roles: PartnerRole[];
  /** The contact lists, exports and the assistant use; null while it has none. */
  default_contact: PartnerContact | null;
  /** All of them, the default first. */
  contacts: PartnerContact[];
  farms?: (Farm | any)[];
  created_at?: string;
  /** It already issued fiscal documents: the CUIT is what they say and no longer changes. */
  cuit_locked?: boolean;
}

/** A supplier, a customer or both ("Clientes y proveedores"). */
export class Partner {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly cuit: string,
    public readonly is_active: boolean,
    public readonly commercial_name: string | null,
    public readonly location: string | null,
    public readonly roles: PartnerRole[],
    public readonly default_contact: PartnerContact | null,
    public readonly contacts: PartnerContact[],
    public readonly farms?: (Farm | any)[],
    public readonly created_at?: string,
    public readonly cuit_locked: boolean = false,
  ) {}

  public static create(dto: PartnerDTO): Partner {
    if (!dto.name || dto.name.trim() === '') {
      throw new Error('Partner name cannot be empty');
    }
    if (!dto.cuit || dto.cuit.trim() === '') {
      throw new Error('Partner CUIT cannot be empty');
    }

    return new Partner(
      dto.id ?? 0,
      dto.name,
      dto.cuit,
      dto.is_active ?? true,
      dto.commercial_name,
      dto.location,
      sortRoles(dto.roles ?? []),
      dto.default_contact ?? null,
      dto.contacts ?? [],
      dto.farms,
      dto.created_at,
      dto.cuit_locked ?? false
    );
  }

  public hasRole(role: PartnerRole): boolean {
    return this.roles.includes(role);
  }

  public isSupplier(): boolean {
    return this.roles.some((role) => SUPPLIER_ROLES.includes(role));
  }

  public isCustomer(): boolean {
    return this.roles.some((role) => CUSTOMER_ROLES.includes(role));
  }

  public hasFarms(): boolean {
    return this.farms !== undefined && this.farms.length > 0;
  }

  /** The default contact in one line: name, phone and email. */
  public getContactInfo(): string {
    const contact = this.default_contact;

    return contact ? [contact.name, contact.phone, contact.email].filter(Boolean).join(' · ') : 'Sin contacto';
  }

  public isActive(): boolean {
    return this.is_active;
  }
}
