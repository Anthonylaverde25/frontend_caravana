import { ItemDocument, ItemDocumentLine, Page, StockIncident } from '../../domain/entities/ItemDocument';
import { BatchConsumptionHistory, ItemStockView, KardexRow } from '../../domain/entities/ItemStock';

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
			unitCost: raw.unit_cost ?? null,
			totalCost: raw.total_cost,
			unvaluedQuantity: raw.unvalued_quantity ?? '0.0000',
			unabsorbedCost: raw.unabsorbed_cost ?? null,
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
				warehouse: { id: w.warehouse.id, name: w.warehouse.name ?? null },
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
