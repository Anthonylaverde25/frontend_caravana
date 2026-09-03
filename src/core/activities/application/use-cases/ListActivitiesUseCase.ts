import { Activity } from '../../domain/entities/Activity';
import { IActivityRepository } from '../../domain/repositories/IActivityRepository';

export class ListActivitiesUseCase {
  constructor(private repository: IActivityRepository) {}

  async execute(companyId?: number): Promise<Activity[]> {
    return this.repository.findAll(companyId);
  }
}
