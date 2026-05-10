import { Activity } from '../entities/Activity';
import { IActivityRepository } from '../repositories/IActivityRepository';

export class ListActivitiesUseCase {
  constructor(private repository: IActivityRepository) {}

  async execute(companyId?: number): Promise<Activity[]> {
    return this.repository.findAll(companyId);
  }
}
