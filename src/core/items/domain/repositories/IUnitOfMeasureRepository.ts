import { UnitDimension, UnitOfMeasure } from '../entities/UnitOfMeasure';

export interface UnitOfMeasurePayload {
	code?: string;
	name: string;
	symbol: string;
	dimension: UnitDimension;
	/** Null: not convertible. */
	factor_to_base: number | null;
}

export interface IUnitOfMeasureRepository {
	findAll(includeInactive: boolean): Promise<UnitOfMeasure[]>;
	create(payload: UnitOfMeasurePayload): Promise<UnitOfMeasure>;
	update(id: number, payload: Partial<UnitOfMeasurePayload>): Promise<UnitOfMeasure>;
	setActive(id: number, active: boolean): Promise<UnitOfMeasure>;
}
