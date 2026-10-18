import { UnitOfMeasure } from '../../domain/entities/UnitOfMeasure';
import { IUnitOfMeasureRepository, UnitOfMeasurePayload } from '../../domain/repositories/IUnitOfMeasureRepository';

export class ListUnitsOfMeasureUseCase {
	constructor(private repository: IUnitOfMeasureRepository) {}

	execute(includeInactive: boolean): Promise<UnitOfMeasure[]> {
		return this.repository.findAll(includeInactive);
	}
}

export class SaveUnitOfMeasureUseCase {
	constructor(private repository: IUnitOfMeasureRepository) {}

	/**
	 * The code is set once, on creation. An update sends only what may change: a unit in use keeps
	 * its dimension and factor, so the screen leaves them out.
	 */
	execute(payload: Partial<UnitOfMeasurePayload>, id?: number): Promise<UnitOfMeasure> {
		if (id) {
			const { code: _code, ...changes } = payload;
			return this.repository.update(id, changes);
		}
		return this.repository.create({ ...(payload as UnitOfMeasurePayload), code: payload.code?.trim().toUpperCase() });
	}
}

export class SetUnitOfMeasureActiveUseCase {
	constructor(private repository: IUnitOfMeasureRepository) {}

	execute(id: number, active: boolean): Promise<UnitOfMeasure> {
		return this.repository.setActive(id, active);
	}
}
