import { ItemPresentation } from '@/core/items/domain/entities/Item';
import { UnitOfMeasure } from '@/core/items/domain/entities/UnitOfMeasure';
import { type Dec, dec, div, mul, round } from './decimal';

/** One choice of the "Unidad o presentación" cell, with how many item units one of it holds. */
export interface InputOption {
	/** "u:12" (a unit) or "p:5" (a presentation of the item). */
	value: string;
	label: string;
	kind: 'unit' | 'presentation';
	id: number;
	factor: Dec;
}

const toDec = (value: number | string): Dec => dec(String(value)) ?? 0n;

/**
 * What the paper may be written in (D16, I17): the item's own unit first, then its active
 * presentations, then the active units that convert to it (same dimension, both with a factor).
 */
export function inputOptions(itemUnitId: number | null | undefined, units: UnitOfMeasure[], presentations: ItemPresentation[]): InputOption[] {
	const itemUnit = units.find((u) => u.id === itemUnitId);
	if (!itemUnit) return [];

	const options: InputOption[] = [
		{ value: `u:${itemUnit.id}`, label: `${itemUnit.name} (${itemUnit.symbol})`, kind: 'unit', id: itemUnit.id, factor: toDec(1) }
	];
	presentations
		.filter((p) => p.isActive)
		.forEach((p) => options.push({ value: `p:${p.id}`, label: p.name, kind: 'presentation', id: p.id, factor: toDec(p.factorToItemUnit) }));

	if (itemUnit.factorToBase !== null) {
		units
			.filter((u) => u.id !== itemUnit.id && u.isActive && u.dimension === itemUnit.dimension && u.factorToBase !== null)
			.forEach((u) => {
				const factor = div(toDec(u.factorToBase as number), toDec(itemUnit.factorToBase as number));
				if (factor !== null) options.push({ value: `u:${u.id}`, label: `${u.name} (${u.symbol})`, kind: 'unit', id: u.id, factor });
			});
	}

	return options;
}

/** The quantity in the item's unit, as the backend will convert it (4 decimals). */
export function convertPreview(quantity: string, option: InputOption | undefined): Dec | null {
	const parsed = dec(quantity);
	return parsed === null || !option ? null : round(mul(parsed, option.factor), 4);
}

/** "u:12" → { input_unit_id: 12 }, "p:5" → { input_presentation_id: 5 }. */
export function inputSourcePayload(value: string): { input_unit_id: number | null; input_presentation_id: number | null } {
	const [kind, id] = value.split(':');
	return kind === 'p' ? { input_unit_id: null, input_presentation_id: Number(id) } : { input_unit_id: Number(id) || null, input_presentation_id: null };
}
