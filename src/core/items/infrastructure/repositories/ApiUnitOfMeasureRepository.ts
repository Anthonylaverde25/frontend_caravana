import axiosInstance from '@/utils/axios';
import { UnitOfMeasure } from '../../domain/entities/UnitOfMeasure';
import { IUnitOfMeasureRepository, UnitOfMeasurePayload } from '../../domain/repositories/IUnitOfMeasureRepository';
import { UnitOfMeasureMapper } from '../mappers/UnitOfMeasureMapper';

export class ApiUnitOfMeasureRepository implements IUnitOfMeasureRepository {
	async findAll(includeInactive: boolean): Promise<UnitOfMeasure[]> {
		const response = await axiosInstance.get<any[]>('/units-of-measure', { params: includeInactive ? { include_inactive: 1 } : undefined });
		return response.data.map(UnitOfMeasureMapper.toDomain);
	}

	async create(payload: UnitOfMeasurePayload): Promise<UnitOfMeasure> {
		const response = await axiosInstance.post<any>('/units-of-measure', payload);
		return UnitOfMeasureMapper.toDomain(response.data);
	}

	async update(id: number, payload: Partial<UnitOfMeasurePayload>): Promise<UnitOfMeasure> {
		const response = await axiosInstance.patch<any>(`/units-of-measure/${id}`, payload);
		return UnitOfMeasureMapper.toDomain(response.data);
	}

	async setActive(id: number, active: boolean): Promise<UnitOfMeasure> {
		const response = await axiosInstance.patch<any>(`/units-of-measure/${id}/active`, { is_active: active });
		return UnitOfMeasureMapper.toDomain(response.data);
	}
}
