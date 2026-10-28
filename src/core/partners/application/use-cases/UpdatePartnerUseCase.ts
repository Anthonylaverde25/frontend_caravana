import { Partner } from '../../domain/entities/Partner';
import { IPartnerRepository, PartnerIdentity } from '../../domain/repositories/IPartnerRepository';

/** Corrects a partner's identity; the backend keeps the CUIT once it has documents. */
export class UpdatePartnerUseCase {
  constructor(private repository: IPartnerRepository) {}

  async execute(id: number, identity: PartnerIdentity): Promise<Partner> {
    return this.repository.update(id, identity);
  }
}
