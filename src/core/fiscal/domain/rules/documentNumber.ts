/** "0001-00000123": the point of sale and number as ARCA prints them. */
export function formatDocumentNumber(pointOfSale: string | number | null, number: string | number | null): string {
	if (pointOfSale === null || pointOfSale === '' || number === null || number === '') return '';
	return `${String(pointOfSale).padStart(4, '0')}-${String(number).padStart(8, '0')}`;
}

/** Only digits, at most `length` of them, for the point-of-sale and number fields. */
export const digitsOnly = (value: string, length: number): string => value.replace(/\D/g, '').slice(0, length);

/** Pads with zeros on blur, as the paper shows it: "4" → "0004". */
export const padDigits = (value: string, length: number): string => (value === '' ? '' : value.padStart(length, '0'));
