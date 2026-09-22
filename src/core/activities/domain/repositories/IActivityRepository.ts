import { Activity } from '../entities/Activity';

export interface CompanyActivityConfigPayload {
  activity_id: number;
  is_enabled: boolean;
  is_initial: boolean;
  is_final: boolean;
  sort_order: number;
}

export interface IActivityRepository {
  findAll(companyId?: number): Promise<Activity[]>;
  toggle(companyId: number, activityId: number, isEnabled: boolean): Promise<void>;
  updateConfig(companyId: number, config: CompanyActivityConfigPayload[]): Promise<void>;
}
