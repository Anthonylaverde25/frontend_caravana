import { ItemDocument } from '@/core/stock/domain/entities/ItemDocument';
import {
	SemenInventoryRow,
	SemenLotDetail,
	SemenLotOption,
	SemenLotSharePayload,
	SemenProfile,
	SemenProfilePayload,
	SemenReceiptPayload,
	SemenSire,
	SemenSirePayload,
	SemenUnidentifiedEntry
} from '../../domain/entities/Semen';
import { ISemenRepository, SemenInventoryFilters } from '../../domain/repositories/ISemenRepository';

export class ListSemenSiresUseCase {
	constructor(private readonly repository: ISemenRepository) {}

	execute(search?: string, includeInactive = false): Promise<SemenSire[]> {
		return this.repository.sires(search?.trim(), includeInactive);
	}
}

export class SaveSemenSireUseCase {
	constructor(private readonly repository: ISemenRepository) {}

	execute(id: number | null, payload: SemenSirePayload): Promise<SemenSire> {
		return id === null ? this.repository.createSire(payload) : this.repository.updateSire(id, payload);
	}
}

export class RegisterSemenReceiptUseCase {
	constructor(private readonly repository: ISemenRepository) {}

	execute(payload: SemenReceiptPayload): Promise<ItemDocument> {
		return this.repository.registerReceipt(payload);
	}
}

export class GetSemenInventoryUseCase {
	constructor(private readonly repository: ISemenRepository) {}

	execute(filters: SemenInventoryFilters): Promise<SemenInventoryRow[]> {
		return this.repository.inventory(filters);
	}
}

export class ListSemenLotsUseCase {
	constructor(private readonly repository: ISemenRepository) {}

	execute(itemId: number, warehouseId: number): Promise<SemenLotOption[]> {
		return this.repository.lots(itemId, warehouseId);
	}
}

export class GetSemenLotUseCase {
	constructor(private readonly repository: ISemenRepository) {}

	execute(id: number): Promise<SemenLotDetail> {
		return this.repository.lot(id);
	}
}

export class ListSemenUnidentifiedUseCase {
	constructor(private readonly repository: ISemenRepository) {}

	execute(itemId?: number, warehouseId?: number): Promise<SemenUnidentifiedEntry[]> {
		return this.repository.unidentified(itemId, warehouseId);
	}
}

export class IdentifySemenLotUseCase {
	constructor(private readonly repository: ISemenRepository) {}

	execute(entryId: number, lots: SemenLotSharePayload[]) {
		return this.repository.identify(entryId, lots);
	}
}

export class UpdateSemenProfileUseCase {
	constructor(private readonly repository: ISemenRepository) {}

	execute(itemId: number, payload: SemenProfilePayload): Promise<SemenProfile | null> {
		return this.repository.updateProfile(itemId, payload);
	}
}
