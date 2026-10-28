import { Partner } from '../entities/Partner';
import { PartnerContact, PartnerContactInput } from '../entities/PartnerContact';
import { PartnerFilter, PartnerRole } from '../entities/PartnerRole';

/** A new partner: identity, roles, origin farms and, optionally, its first (default) contact. */
export interface CreatePartnerInput {
  name: string;
  commercial_name?: string | null;
  cuit: string;
  location?: string | null;
  roles: PartnerRole[];
  farms?: { name: string; renspa?: string | null; location?: string | null }[];
  contact?: PartnerContactInput;
}

export type PartnerIdentity = Pick<CreatePartnerInput, 'name' | 'commercial_name' | 'cuit' | 'location'>;

export interface IPartnerRepository {
  /** The active company's partners; a filter narrows them by role or group (C3). */
  findAll(filter?: PartnerFilter): Promise<Partner[]>;
  findById(id: number): Promise<Partner | null>;
  create(input: CreatePartnerInput): Promise<Partner>;
  /** Identity only; the CUIT is kept by the backend once it has documents. */
  update(id: number, identity: PartnerIdentity): Promise<Partner>;
  /** Refused while something depends on a role being removed (C2). */
  updateRoles(id: number, roles: PartnerRole[]): Promise<Partner>;
  addContact(partnerId: number, contact: PartnerContactInput): Promise<PartnerContact>;
  updateContact(partnerId: number, contactId: number, contact: PartnerContactInput): Promise<PartnerContact>;
  setDefaultContact(partnerId: number, contactId: number): Promise<Partner>;
  removeContact(partnerId: number, contactId: number): Promise<void>;
}
