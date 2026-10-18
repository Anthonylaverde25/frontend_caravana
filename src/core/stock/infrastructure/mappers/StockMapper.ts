import { ItemDocument, ItemDocumentLine, Page, StockIncident } from '../../domain/entities/ItemDocument';
import { ItemStockView, KardexRow } from '../../domain/entities/ItemStock';

export const StockMapper = {
	incident(raw: any): StockIncident {
		return {
			id: raw.id,
			type: raw.type,
			typeLabel: raw.type_label,
			resolvesItself: !!raw.resolves_itself,
			item: { id: raw.item?.id, name: raw.item?.name ?? null },
			warehouse: { id: raw.warehouse?.id, name: raw.warehouse?.name ?? null },
			detail: raw.detail,
			status: raw.status,
			resolution: raw.resolution ?? null,
			resolvedBy: raw.resolved_by ?? null,
			resolvedAt: raw.resolved_at ?? null,
			createdAt: raw.created_at ?? null
		};
	},

	line(raw: any): ItemDocumentLine {
		return {
			id: raw.id,
			position: raw.position,
			item: { id: raw.item.id, name: raw.item.name ?? '', unitSymbol: raw.item.unit_symbol ?? null },
			inputQuantity: raw.input_quantity,
			inputLabel: raw.input_label ?? null,
			quantity: raw.quantity,
			inputUnitPrice: raw.input_unit_price ?? null,
			unitCost: raw.unit_cost,
			totalCost: raw.total_cost,
			countedQuantity: raw.counted_quantity ?? null,
			movement: raw.movement
				? {
						id: raw.movement.id,
						direction: raw.movement.direction,
						quantity: raw.movement.quantity,
						balanceAfter: raw.movement.balance_after,
						averageCostAfter: raw.movement.average_cost_after
					}
				: null
		};
	},

	document(raw: any): ItemDocument {
		return {
			id: raw.id,
			number: raw.number,
			type: raw.type,
			typeLabel: raw.type_label,
			occurredAt: raw.occurred_at,
			warehouse: { id: raw.warehouse?.id, name: raw.warehouse?.name ?? null },
			fiscalDocument: raw.fiscal_document ?? null,
			batch: raw.batch ?? null,
			headsTreated: raw.heads_treated ?? null,
			reverses: raw.reverses ?? null,
			reversedBy: raw.reversed_by ?? null,
			canReverse: !!raw.can_reverse,
			reversalRefusal: raw.reversal_refusal ?? null,
			reason: raw.reason ?? null,
			notes: raw.notes ?? null,
			totalCost: raw.total_cost,
			createdBy: raw.created_by ?? null,
			createdAt: raw.created_at ?? null,
			lines: (raw.lines ?? []).map(StockMapper.line),
			incidentsRaised: (raw.incidents_raised ?? []).map(StockMapper.incident)
		};
	},

	page<T>(raw: any, map: (row: any) => T): Page<T> {
		return { data: (raw.data ?? []).map(map), total: raw.total ?? 0, page: raw.page ?? 1, perPage: raw.per_page ?? 25 };
	},

	stockView(raw: any): ItemStockView {
		return {
			item: { id: raw.item.id, name: raw.item.name, unitSymbol: raw.item.unit_symbol ?? null, trackStock: !!raw.item.track_stock },
			warehouses: (raw.warehouses ?? []).map((w: any) => ({
				warehouse: { id: w.warehouse.id, name: w.warehouse.name ?? null },
				quantity: w.quantity,
				averageUnitCost: w.average_unit_cost,
				value: w.value,
				criticalStock: w.critical_stock ?? null,
				isBelowCritical: !!w.is_below_critical
			})),
			openIncidents: (raw.open_incidents ?? []).map(StockMapper.incident)
		};
	},

	kardexRow(raw: any): KardexRow {
		return {
			id: raw.id,
			occurredAt: raw.occurred_at,
			warehouse: raw.warehouse,
			documentId: raw.document_id,
			documentNumber: raw.document_number,
			documentType: raw.document_type,
			documentTypeLabel: raw.document_type_label,
			batch: raw.batch ?? null,
			fiscalDocument: raw.fiscal_document ?? null,
			direction: raw.direction,
			quantity: raw.quantity,
			unitCost: raw.unit_cost,
			totalCost: raw.total_cost,
			balanceAfter: raw.balance_after,
			averageCostAfter: raw.average_cost_after
		};
	}
};
