import {
	SemenInventoryRow,
	SemenLotDetail,
	SemenLotOption,
	SemenProfile,
	SemenSire,
	SemenUnidentifiedEntry,
	TankRef
} from '../../domain/entities/Semen';

const tank = (raw: any): TankRef => ({ id: raw?.id, code: raw?.code ?? null, name: raw?.name ?? null, kind: raw?.kind ?? null });

export const SemenMapper = {
	sire(raw: any): SemenSire {
		return {
			id: raw.id,
			name: raw.name,
			label: raw.label ?? raw.name,
			registryCode: raw.registry_code ?? null,
			breed: raw.breed ?? null,
			studName: raw.stud_name ?? null,
			caravan: raw.caravan ?? null,
			isOwnBull: !!raw.is_own_bull,
			notes: raw.notes ?? null,
			isActive: !!raw.is_active,
			activeItems: raw.active_items ?? 0
		};
	},

	profile(raw: any): SemenProfile | null {
		if (!raw) return null;
		return {
			sire: raw.sire?.name ? SemenMapper.sire(raw.sire) : { id: raw.sire?.id },
			semenType: raw.semen_type,
			preservation: raw.preservation,
			strawSize: raw.straw_size ?? null,
			strawColor: raw.straw_color ?? null,
			capColor: raw.cap_color ?? null
		};
	},

	inventoryRow(raw: any): SemenInventoryRow {
		return {
			item: { id: raw.item.id, code: raw.item.code, name: raw.item.name, isActive: !!raw.item.is_active },
			sire: {
				id: raw.sire.id,
				name: raw.sire.name,
				registryCode: raw.sire.registry_code ?? null,
				breed: raw.sire.breed ?? null,
				studName: raw.sire.stud_name ?? null,
				caravanTag: raw.sire.caravan_tag ?? null
			},
			semenType: raw.semen_type,
			preservation: raw.preservation,
			strawSize: raw.straw_size ?? null,
			strawColor: raw.straw_color ?? null,
			capColor: raw.cap_color ?? null,
			stocks: (raw.stocks ?? []).map((s: any) => ({ warehouse: tank(s.warehouse), quantity: s.quantity, averageUnitCost: s.average_unit_cost, value: s.value })),
			lots: (raw.lots ?? []).map((l: any) => ({
				id: l.id,
				code: l.code,
				collectionDate: l.collection_date ?? null,
				firstEntry: l.first_entry ? { occurredAt: l.first_entry.occurred_at, provider: l.first_entry.provider ?? null } : null,
				balances: (l.balances ?? []).map((b: any) => ({ warehouse: tank(b.warehouse), quantity: b.quantity }))
			})),
			unidentified: (raw.unidentified ?? []).map((u: any) => ({ warehouse: tank(u.warehouse), pendingIn: u.pending_in, pendingOut: u.pending_out }))
		};
	},

	lotOption(raw: any): SemenLotOption {
		return { id: raw.id, code: raw.code, collectionDate: raw.collection_date ?? null, quantity: raw.quantity };
	},

	lotDetail(raw: any): SemenLotDetail {
		return {
			id: raw.id,
			code: raw.code,
			collectionDate: raw.collection_date ?? null,
			collectionCode: raw.collection_code ?? null,
			notes: raw.notes ?? null,
			item: raw.item,
			balances: (raw.balances ?? []).map((b: any) => ({ warehouse: tank(b.warehouse), quantity: b.quantity })),
			movements: (raw.movements ?? []).map((m: any) => ({
				document: { id: m.document.id, number: m.document.number, type: m.document.type, typeLabel: m.document.type_label, occurredAt: m.document.occurred_at },
				warehouseCode: m.warehouse_code ?? null,
				provider: m.provider ?? null,
				direction: m.direction,
				quantity: m.quantity,
				unitCost: m.unit_cost ?? null
			})),
			identifications: (raw.identifications ?? []).map((i: any) => ({
				quantity: i.quantity,
				direction: i.direction,
				identifiedAt: i.identified_at ?? null,
				identifiedBy: i.identified_by ?? null,
				warehouseCode: i.warehouse_code ?? null,
				document: { id: i.document.id, number: i.document.number, type: i.document.type, typeLabel: i.document.type_label }
			}))
		};
	},

	unidentified(raw: any): SemenUnidentifiedEntry {
		return {
			id: raw.id,
			item: raw.item,
			warehouse: tank(raw.warehouse),
			direction: raw.direction,
			quantity: raw.quantity,
			pendingQuantity: raw.pending_quantity,
			stockIncidentId: raw.stock_incident_id ?? null,
			document: { id: raw.document.id, number: raw.document.number, type: raw.document.type, occurredAt: raw.document.occurred_at }
		};
	}
};
