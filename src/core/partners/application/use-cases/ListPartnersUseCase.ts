import { Partner } from '../../domain/entities/Partner';
import { PartnerFilter } from '../../domain/entities/PartnerRole';
import { IPartnerRepository } from '../../domain/repositories/IPartnerRepository';

export class ListPartnersUseCase {
  constructor(private partnerRepository: IPartnerRepository) {}

  async execute(filter?: PartnerFilter): Promise<Partner[]> {
    return this.partnerRepository.findAll(filter);
  }
}
