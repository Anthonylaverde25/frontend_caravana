import type { ComponentType } from 'react';
import type { EntityKind, EntityRef } from '@/core/assistant/domain/AssistantTypes';
import CaravanDetailDrawer from 'src/components/caravan/CaravanDetailDrawer';
import AnimalCategoryEntityDrawer from './entities/AnimalCategoryEntityDrawer';
import BatchEntityDrawer from './entities/BatchEntityDrawer';
import BirthOrderEntityDrawer from './entities/BirthOrderEntityDrawer';
import EntryOrderEntityDrawer from './entities/EntryOrderEntityDrawer';
import FiscalDocumentEntityDrawer from './entities/FiscalDocumentEntityDrawer';
import ItemCategoryEntityDrawer from './entities/ItemCategoryEntityDrawer';
import ItemDocumentEntityDrawer from './entities/ItemDocumentEntityDrawer';
import ItemEntityDrawer from './entities/ItemEntityDrawer';
import SemenLotEntityDrawer from './entities/SemenLotEntityDrawer';
import ServiceOrderEntityDrawer from './entities/ServiceOrderEntityDrawer';
import TransferOrderEntityDrawer from './entities/TransferOrderEntityDrawer';
import WarehouseEntityDrawer from './entities/WarehouseEntityDrawer';
import WeaningOrderEntityDrawer from './entities/WeaningOrderEntityDrawer';
import type { EntityDrawerProps } from './entities/entityDrawerProps';

/** The caravan reuses the app's drawer; with no action passed, it only reads. */
function CaravanEntityDrawer({ id, label, open, onClose }: EntityDrawerProps) {
	return (
		<CaravanDetailDrawer
			open={open}
			onClose={onClose}
			caravanId={id}
			caravanIdentification={label ?? null}
		/>
	);
}

const DRAWERS: Record<EntityKind, ComponentType<EntityDrawerProps>> = {
	caravan: CaravanEntityDrawer,
	batch: BatchEntityDrawer,
	service_order: ServiceOrderEntityDrawer,
	entry_order: EntryOrderEntityDrawer,
	birth_order: BirthOrderEntityDrawer,
	transfer_order: TransferOrderEntityDrawer,
	weaning_order: WeaningOrderEntityDrawer,
	item: ItemEntityDrawer,
	item_document: ItemDocumentEntityDrawer,
	warehouse: WarehouseEntityDrawer,
	fiscal_document: FiscalDocumentEntityDrawer,
	animal_category: AnimalCategoryEntityDrawer,
	item_category: ItemCategoryEntityDrawer,
	semen_lot: SemenLotEntityDrawer
};

export interface EntityDrawerEntry {
	key: number;
	entity: EntityRef;
	/** False while it slides out. */
	open: boolean;
}

interface EntityDrawerHostProps {
	stack: EntityDrawerEntry[];
	/** Closes the drawer at this position and every one opened on top of it. */
	onClose: (index: number) => void;
	onNavigate: () => void;
}

/** Mounts one drawer per opened record, in order: MUI stacks the later ones on top. */
export function EntityDrawerHost({ stack, onClose, onNavigate }: EntityDrawerHostProps) {
	return (
		<>
			{stack.map(({ key, entity, open }, index) => {
				const Drawer = DRAWERS[entity.kind];

				if (!Drawer) return null;

				return (
					<Drawer
						key={key}
						id={entity.id}
						label={entity.label}
						scope={entity.scope}
						open={open}
						onClose={() => onClose(index)}
						onNavigate={onNavigate}
					/>
				);
			})}
		</>
	);
}

export default EntityDrawerHost;
