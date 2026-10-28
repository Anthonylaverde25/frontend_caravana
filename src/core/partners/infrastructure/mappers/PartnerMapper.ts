import { Partner } from '../../domain/entities/Partner';
import { PartnerContact } from '../../domain/entities/PartnerContact';
import { PartnerRole } from '../../domain/entities/PartnerRole';

export class PartnerMapper {
  public static toDomain(raw: any): Partner {
    return Partner.create({
      id: raw.id,
      name: raw.name,
      commercial_name: raw.commercial_name,
      cuit: raw.cuit,
      location: raw.location,
      is_active: raw.is_active !== undefined ? Boolean(raw.is_active) : true,
      roles: (raw.roles ?? []) as PartnerRole[],
      default_contact: raw.default_contact ? PartnerMapper.contactToDomain(raw.default_contact) : null,
      contacts: (raw.contacts ?? []).map(PartnerMapper.contactToDomain),
      farms: raw.farms,
      created_at: raw.created_at,
      cuit_locked: Boolean(raw.cuit_locked),
    });
  }

  public static contactToDomain(raw: any): PartnerContact {
    return {
      id: raw.id,
      name: raw.name,
      position: raw.position ?? null,
      phone: raw.phone,
      email: raw.email ?? null,
      notes: raw.notes ?? null,
      is_default: Boolean(raw.is_default),
    };
  }
}
