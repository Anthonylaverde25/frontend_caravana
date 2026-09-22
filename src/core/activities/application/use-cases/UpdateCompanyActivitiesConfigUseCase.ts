import { CompanyActivityConfigPayload, IActivityRepository } from '../../domain/repositories/IActivityRepository';

export class UpdateCompanyActivitiesConfigUseCase {
  constructor(private repository: IActivityRepository) {}

  async execute(companyId: number, config: CompanyActivityConfigPayload[]): Promise<void> {
    return this.repository.updateConfig(companyId, config);
  }
}
