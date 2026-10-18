import { StockIncident } from './ItemDocument';

/** An item's balance in one warehouse. */
export interface WarehouseStock {
	warehouse: { id: number; name: string | null };
	quantity: string;
	averageUnitCost: string;
	value: string;
	criticalStock: string | null;
	isBelowCritical: boolean;
}

export interface ItemStockView {
	item: { id: number; name: string; unitSymbol: string | null; trackStock: boolean };
	warehouses: WarehouseStock[];
	openIncidents: StockIncident[];
}

export interface KardexRow {
	id: number;
	occurredAt: string;
	warehouse: string;
	documentId: number;
	documentNumber: number;
	documentType: string;
	documentTypeLabel: string;
	batch: string | null;
	fiscalDocument: { id: number; label: string; provider: string | null } | null;
	direction: 1 | -1;
	quantity: string;
	unitCost: string;
	totalCost: string;
	balanceAfter: string;
	averageCostAfter: string;
}

export interface KardexFilters {
	from?: string;
	to?: string;
	page?: number;
}

export interface Warehouse {
	id: number;
	code: string;
	name: string;
	isDefault: boolean;
}
