import { Partner } from '../../domain/entities/Partner';
import { CreatePartnerInput, IPartnerRepository } from '../../domain/repositories/IPartnerRepository';

export class CreatePartnerUseCase {
  constructor(private repository: IPartnerRepository) {}

  async execute(input: CreatePartnerInput): Promise<Partner> {
    if (!input.name?.trim()) {
      throw new Error('Partner name cannot be empty');
    }

    return this.repository.create(input);
  }
}
