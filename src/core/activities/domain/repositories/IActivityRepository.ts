import { Activity } from '../entities/Activity';

export interface IActivityRepository {
  findAll(companyId?: number): Promise<Activity[]>;
  toggle(companyId: number, activityId: number, isEnabled: boolean): Promise<void>;
}
