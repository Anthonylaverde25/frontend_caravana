import { IActivityRepository } from '../../domain/repositories/IActivityRepository';

export class ToggleCompanyActivityUseCase {
  constructor(private repository: IActivityRepository) {}

  async execute(companyId: number, activityId: number, isEnabled: boolean): Promise<void> {
    return this.repository.toggle(companyId, activityId, isEnabled);
  }
}
