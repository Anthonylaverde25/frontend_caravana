import axiosInstance from '@/utils/axios';
import { Activity } from '../../domain/entities/Activity';
import { IActivityRepository } from '../../domain/repositories/IActivityRepository';
import { ActivityMapper } from '../mappers/ActivityMapper';

export class ApiActivityRepository implements IActivityRepository {
  async findAll(companyId?: number): Promise<Activity[]> {
    const headers: Record<string, string> = {};
    if (companyId) {
      headers['X-Company-ID'] = companyId.toString();
    }
    const response = await axiosInstance.get<any[]>('activities', { headers });
    return response.data.map(ActivityMapper.toDomain);
  }

  async toggle(companyId: number, activityId: number, isEnabled: boolean): Promise<void> {
    const headers = { 'X-Company-ID': companyId.toString() };
    await axiosInstance.post(`/activities/${activityId}/toggle`, { is_enabled: isEnabled }, { headers });
  }
}
