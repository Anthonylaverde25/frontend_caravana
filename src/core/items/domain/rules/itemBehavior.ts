/**
 * The three valid combinations of type and track_stock, as the operator chooses them (D11).
 * A service with stock cannot even be expressed.
 */
export type ItemBehavior = 'STOCKED_ARTICLE' | 'EXPENSE_ARTICLE' | 'SERVICE';

export interface ItemBehaviorInfo {
	value: ItemBehavior;
	label: string;
	/** On the list filter. */
	filterLabel: string;
	/** Under the tag in the list. */
	caption: string;
	description: string;
	color: 'primary' | 'warning' | 'info';
	/** Help for the unit field. */
	unitHint: string;
}

export const ITEM_BEHAVIORS: ItemBehaviorInfo[] = [
	{
		value: 'STOCKED_ARTICLE',
		label: 'Artículo con stock',
		filterLabel: 'Con stock',
		caption: 'con stock',
		description: 'Entra y sale del almacén',
		color: 'primary',
		unitHint: 'Si dudás entre ml y dosis: ml si la dosis depende del peso; dosis si es fija, como una vacuna.'
	},
	{
		value: 'EXPENSE_ARTICLE',
		label: 'Artículo sin stock',
		filterLabel: 'Sin stock',
		caption: 'sin stock',
		description: 'Se compra y se imputa como gasto',
		color: 'warning',
		unitHint: 'La unidad en la que lo comprás: unidad, metro, kilo…'
	},
	{
		value: 'SERVICE',
		label: 'Servicio',
		filterLabel: 'Servicios',
		caption: 'servicio',
		description: 'Se contrata y se usa en el acto',
		color: 'info',
		unitHint: 'Cómo se cobra: hora, jornada, cabeza, hectárea o servicio.'
	}
];

export function behaviorInfo(behavior: ItemBehavior): ItemBehaviorInfo {
	return ITEM_BEHAVIORS.find((b) => b.value === behavior) ?? ITEM_BEHAVIORS[0];
}
