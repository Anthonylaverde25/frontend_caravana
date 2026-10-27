import { SemenPreservation, SemenType, StrawColor, StrawSize } from '../entities/Semen';

export const SEMEN_TYPE_LABEL: Record<SemenType, string> = {
	CONVENTIONAL: 'Convencional',
	SEXED_FEMALE: 'Sexado hembra',
	SEXED_MALE: 'Sexado macho'
};

export const PRESERVATION_LABEL: Record<SemenPreservation, string> = { FROZEN: 'Congelado', FRESH: 'Fresco' };

export const STRAW_SIZE_LABEL: Record<StrawSize, string> = { MICRO_0_1: 'Micro 0,1 ml', MINI_0_25: 'Mini 0,25 ml', MEDIUM_0_5: 'Media 0,5 ml' };

export const STRAW_COLOR_LABEL: Record<StrawColor, string> = {
	TRANSPARENT: 'Transparente',
	WHITE: 'Blanco',
	YELLOW: 'Amarillo',
	ORANGE: 'Naranja',
	RED: 'Rojo',
	PINK: 'Rosa',
	PURPLE: 'Violeta',
	BLUE: 'Azul',
	GREEN: 'Verde',
	GRAY: 'Gris',
	BROWN: 'Marrón',
	BLACK: 'Negro'
};

/** Normalised as the backend stores it (DA3), to tell an existing lot while typing. */
export const normalizeLotCode = (code: string): string => code.trim().replace(/\s+/g, ' ').toUpperCase();

/** "12" → "12 paj." */
export const straws = (quantity: string | number): string => {
	const n = Number(quantity);
	return `${Number.isInteger(n) ? n : n.toLocaleString('es-AR')} paj.`;
};
