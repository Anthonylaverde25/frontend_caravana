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
} from '../entities/Semen';

export interface SemenInventoryFilters {
	warehouseId?: number | null;
	withBalance?: boolean;
	includeInactive?: boolean;
}

export interface ISemenRepository {
	sires(search?: string, includeInactive?: boolean): Promise<SemenSire[]>;
	createSire(payload: SemenSirePayload): Promise<SemenSire>;
	updateSire(id: number, payload: SemenSirePayload): Promise<SemenSire>;
	setSireActive(id: number, active: boolean): Promise<SemenSire>;
	registerReceipt(payload: SemenReceiptPayload): Promise<ItemDocument>;
	inventory(filters: SemenInventoryFilters): Promise<SemenInventoryRow[]>;
	lots(itemId: number, warehouseId: number): Promise<SemenLotOption[]>;
	lot(id: number): Promise<SemenLotDetail>;
	unidentified(itemId?: number, warehouseId?: number): Promise<SemenUnidentifiedEntry[]>;
	identify(entryId: number, lots: SemenLotSharePayload[]): Promise<{ status: string; pendingQuantity: string }>;
	updateProfile(itemId: number, payload: SemenProfilePayload): Promise<SemenProfile | null>;
}
