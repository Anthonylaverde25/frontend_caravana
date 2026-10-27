import { ItemDocument, ItemDocumentLine, Page, StockIncident, WarehouseRef } from '../../domain/entities/ItemDocument';
import { BatchConsumptionHistory, ItemStockView, KardexRow, Warehouse, WarehouseStockView } from '../../domain/entities/ItemStock';

export const StockMapper = {
	incident(raw: any): StockIncident {
		return {
			id: raw.id,
			type: raw.type,
			typeLabel: raw.type_label,
			resolvesItself: !!raw.resolves_itself,
			resolvesByIdentification: !!raw.resolves_by_identification,
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
			unitCost: raw.unit_cost ?? null,
			totalCost: raw.total_cost,
			unvaluedQuantity: raw.unvalued_quantity ?? '0.0000',
			unabsorbedCost: raw.unabsorbed_cost ?? null,
			countedQuantity: raw.counted_quantity ?? null,
			semenLot: raw.semen_lot ?? null,
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
			warehouse: StockMapper.warehouseRef(raw.warehouse),
			provider: raw.provider ?? null,
			serviceOrder: raw.service_order ?? null,
			paired: raw.paired
				? { id: raw.paired.id, number: raw.paired.number, type: raw.paired.type, warehouse: StockMapper.warehouseRef(raw.paired.warehouse) }
				: null,
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

	warehouseRef(raw: any): WarehouseRef {
		return { id: raw?.id, code: raw?.code ?? null, name: raw?.name ?? null };
	},

	warehouseStock(raw: any): WarehouseStockView {
		return {
			warehouse: StockMapper.warehouse(raw.warehouse),
			items: (raw.items ?? []).map((row: any) => ({
				itemId: row.item_id,
				code: row.code,
				name: row.name,
				unitSymbol: row.unit_symbol ?? null,
				quantity: row.quantity,
				unvaluedQuantity: row.unvalued_quantity,
				averageUnitCost: row.average_unit_cost,
				value: row.value,
				isNegative: !!row.is_negative,
				isBelowCritical: !!row.is_below_critical
			}))
		};
	},

	warehouse(raw: any): Warehouse {
		const s = raw.summary;
		return {
			id: raw.id,
			code: raw.code,
			name: raw.name,
			kind: raw.kind === 'CRYO_TANK' ? 'CRYO_TANK' : 'GENERAL',
			isDefault: !!raw.is_default,
			isActive: !!raw.is_active,
			summary: s
				? {
						itemsWithBalance: s.items_with_balance ?? 0,
						valuedValue: s.valued_value ?? '0.0000',
						itemsWithUnvalued: s.items_with_unvalued ?? 0,
						pendingLots: s.pending_lots ?? 0,
						negativeItems: s.negative_items ?? 0,
						openIncidents: s.open_incidents ?? 0
					}
				: null
		};
	},

	page<T>(raw: any, map: (row: any) => T): Page<T> {
		return {
			data: (raw.data ?? []).map(map),
			total: raw.total ?? 0,
			page: raw.page ?? 1,
			perPage: raw.per_page ?? 25
		};
	},

	stockView(raw: any): ItemStockView {
		return {
			item: {
				id: raw.item.id,
				name: raw.item.name,
				unitSymbol: raw.item.unit_symbol ?? null,
				trackStock: !!raw.item.track_stock
			},
			warehouses: (raw.warehouses ?? []).map((w: any) => ({
				warehouse: { id: w.warehouse.id, code: w.warehouse.code ?? null, name: w.warehouse.name ?? null, isActive: w.warehouse.is_active ?? true },
				quantity: w.quantity,
				unvaluedQuantity: w.unvalued_quantity ?? '0.0000',
				valuedQuantity: w.valued_quantity ?? w.quantity,
				averageUnitCost: w.average_unit_cost,
				value: w.value,
				criticalStock: w.critical_stock ?? null,
				isBelowCritical: !!w.is_below_critical
			})),
			openIncidents: (raw.open_incidents ?? []).map(StockMapper.incident),
			pendingLots: (raw.pending_lots ?? []).map((l: any) => ({
				warehouseId: l.warehouse_id,
				deliveryNoteId: l.delivery_note_id,
				deliveryNoteLabel: l.delivery_note_label,
				issuedAt: l.issued_at,
				quantity: l.quantity,
				remainingQuantity: l.remaining_quantity,
				consumedQuantity: l.consumed_quantity
			}))
		};
	},

	batchHistory(raw: any): BatchConsumptionHistory {
		return {
			rows: (raw.rows ?? []).map((r: any) => ({
				source: r.source,
				lineId: r.line_id,
				occurredAt: r.occurred_at,
				itemName: r.item_name,
				behavior: r.behavior,
				category: r.category ?? null,
				quantity: r.quantity,
				unitSymbol: r.unit_symbol,
				headsTreated: r.heads_treated,
				cost: r.cost,
				pendingCostQuantity: r.pending_cost_quantity ?? '0.0000',
				costPerHead: r.cost_per_head ?? null,
				reference: r.reference,
				voided: r.voided ?? null
			})),
			totalCost: raw.total_cost,
			costPerHead: raw.cost_per_head,
			byCategory: raw.by_category ?? [],
			hasPendingCost: !!raw.has_pending_cost
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
			transfer: raw.transfer ?? null,
			semenLot: raw.semen_lot ?? null,
			fiscalDocument: raw.fiscal_document ?? null,
			direction: raw.direction,
			quantity: raw.quantity,
			unitCost: raw.unit_cost ?? null,
			totalCost: raw.total_cost,
			balanceAfter: raw.balance_after,
			averageCostAfter: raw.average_cost_after,
			unvaluedQuantity: raw.unvalued_quantity ?? '0.0000',
			unvaluedBalanceAfter: raw.unvalued_balance_after ?? '0.0000'
		};
	}
};
