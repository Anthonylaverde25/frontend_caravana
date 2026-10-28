import axiosInstance from '@/utils/axios';
import { cuitDigits } from '@/core/shared/domain/cuit';
import { Partner } from '../../domain/entities/Partner';
import { PartnerContact, PartnerContactInput } from '../../domain/entities/PartnerContact';
import { PartnerFilter, PartnerRole } from '../../domain/entities/PartnerRole';
import { CreatePartnerInput, IPartnerRepository, PartnerIdentity } from '../../domain/repositories/IPartnerRepository';
import { PartnerMapper } from '../mappers/PartnerMapper';

export class ApiPartnerRepository implements IPartnerRepository {
  async findAll(filter?: PartnerFilter): Promise<Partner[]> {
    const role = filter?.role === undefined ? undefined : ([] as PartnerRole[]).concat(filter.role);
    const response = await axiosInstance.get<any[]>('/partners', { params: { role, group: filter?.group } });
    return response.data.map(PartnerMapper.toDomain);
  }

  async findById(id: number): Promise<Partner | null> {
    const response = await axiosInstance.get<any>(`/partners/${id}`);
    return PartnerMapper.toDomain(response.data);
  }

  async create(input: CreatePartnerInput): Promise<Partner> {
    const response = await axiosInstance.post<any>('/partners', { ...input, cuit: cuitDigits(input.cuit) });
    return PartnerMapper.toDomain(response.data);
  }

  async update(id: number, identity: PartnerIdentity): Promise<Partner> {
    const response = await axiosInstance.put<any>(`/partners/${id}`, { ...identity, cuit: cuitDigits(identity.cuit) });
    return PartnerMapper.toDomain(response.data);
  }

  async updateRoles(id: number, roles: PartnerRole[]): Promise<Partner> {
    const response = await axiosInstance.patch<any>(`/partners/${id}/roles`, { roles });
    return PartnerMapper.toDomain(response.data);
  }

  async addContact(partnerId: number, contact: PartnerContactInput): Promise<PartnerContact> {
    const response = await axiosInstance.post<any>(`/partners/${partnerId}/contacts`, contact);
    return PartnerMapper.contactToDomain(response.data);
  }

  async updateContact(partnerId: number, contactId: number, contact: PartnerContactInput): Promise<PartnerContact> {
    const response = await axiosInstance.put<any>(`/partners/${partnerId}/contacts/${contactId}`, contact);
    return PartnerMapper.contactToDomain(response.data);
  }

  async setDefaultContact(partnerId: number, contactId: number): Promise<Partner> {
    const response = await axiosInstance.patch<any>(`/partners/${partnerId}/contacts/${contactId}/default`);
    return PartnerMapper.toDomain(response.data);
  }

  async removeContact(partnerId: number, contactId: number): Promise<void> {
    await axiosInstance.delete(`/partners/${partnerId}/contacts/${contactId}`);
  }
}
