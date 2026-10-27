/** Semen stock (semen S-A): sires, straw profiles, lots and straws without lot. */

export type SemenType = 'CONVENTIONAL' | 'SEXED_FEMALE' | 'SEXED_MALE';
export type SemenPreservation = 'FROZEN' | 'FRESH';
export type StrawSize = 'MICRO_0_1' | 'MINI_0_25' | 'MEDIUM_0_5';
export type StrawColor = 'TRANSPARENT' | 'WHITE' | 'YELLOW' | 'ORANGE' | 'RED' | 'PINK' | 'PURPLE' | 'BLUE' | 'GREEN' | 'GRAY' | 'BROWN' | 'BLACK';

export interface Labeled<T extends string> {
	value: T;
	label: string;
}

/** The bull a semen comes from: never a caravan; an own bull is linked to its caravan. */
export interface SemenSire {
	id: number;
	name: string;
	label: string;
	registryCode: string | null;
	breed: { id: number; name: string | null } | null;
	studName: string | null;
	caravan: { id: number; identification: string | null } | null;
	isOwnBull: boolean;
	notes: string | null;
	isActive: boolean;
	activeItems: number;
}

export interface SemenProfile {
	sire: Partial<SemenSire> & { id: number };
	semenType: Labeled<SemenType>;
	preservation: Labeled<SemenPreservation>;
	strawSize: Labeled<StrawSize> | null;
	strawColor: Labeled<StrawColor> | null;
	capColor: Labeled<StrawColor> | null;
}

export interface TankRef {
	id: number;
	code: string | null;
	name: string | null;
	kind?: string | null;
}

export interface SemenLotBalance {
	warehouse: TankRef;
	quantity: string;
}

export interface SemenInventoryLot {
	id: number;
	code: string;
	collectionDate: string | null;
	firstEntry: { occurredAt: string; provider: string | null } | null;
	balances: SemenLotBalance[];
}

export interface SemenUnidentifiedBalance {
	warehouse: TankRef;
	pendingIn: string;
	pendingOut: string;
}

/** One row of the semen tab: an item (sire + type) with its stock per tank, lots and straws without lot. */
export interface SemenInventoryRow {
	item: { id: number; code: string; name: string; isActive: boolean };
	sire: { id: number; name: string; registryCode: string | null; breed: string | null; studName: string | null; caravanTag: string | null };
	semenType: Labeled<SemenType>;
	preservation: Labeled<SemenPreservation>;
	strawSize: Labeled<StrawSize> | null;
	strawColor: Labeled<StrawColor> | null;
	capColor: Labeled<StrawColor> | null;
	stocks: { warehouse: TankRef; quantity: string; averageUnitCost: string; value: string }[];
	lots: SemenInventoryLot[];
	unidentified: SemenUnidentifiedBalance[];
}

/** A lot with what it holds in one tank, for the pickers. */
export interface SemenLotOption {
	id: number;
	code: string;
	collectionDate: string | null;
	quantity: string;
}

export interface SemenLotMovement {
	document: { id: number; number: number; type: string; typeLabel: string; occurredAt: string };
	warehouseCode: string | null;
	provider: string | null;
	direction: number;
	quantity: string;
	unitCost: string | null;
}

export interface SemenLotDetail {
	id: number;
	code: string;
	collectionDate: string | null;
	collectionCode: string | null;
	notes: string | null;
	item: { id: number; code: string; name: string };
	balances: SemenLotBalance[];
	movements: SemenLotMovement[];
	identifications: {
		quantity: string;
		direction: number;
		identifiedAt: string | null;
		identifiedBy: string | null;
		warehouseCode: string | null;
		document: { id: number; number: number; type: string; typeLabel: string };
	}[];
}

/** Straws that moved without lot, waiting to be identified (SU1). */
export interface SemenUnidentifiedEntry {
	id: number;
	item: { id: number; name: string };
	warehouse: TankRef;
	direction: number;
	quantity: string;
	pendingQuantity: string;
	stockIncidentId: number | null;
	document: { id: number; number: number; type: string; occurredAt: string };
}

export interface SemenSirePayload {
	name?: string | null;
	registry_code?: string | null;
	breed_id?: number | null;
	stud_name?: string | null;
	caravan_id?: number | null;
	notes?: string | null;
}

export interface SemenReceiptLinePayload {
	semen_sire_id: number | null;
	semen_type: SemenType | null;
	lot_code: string | null;
	collection_date: string | null;
	quantity: string;
	unit_cost: string;
}

export interface SemenReceiptPayload {
	occurred_at: string;
	warehouse_id: number | null;
	provider_id: number | null;
	notes: string | null;
	idempotency_key: string;
	lines: SemenReceiptLinePayload[];
}

export interface SemenLotSharePayload {
	semen_lot_id?: number | null;
	lot_code?: string | null;
	collection_date?: string | null;
	quantity: string;
}

export interface SemenProfilePayload {
	preservation: SemenPreservation;
	straw_size: StrawSize | null;
	straw_color: StrawColor | null;
	cap_color: StrawColor | null;
}
