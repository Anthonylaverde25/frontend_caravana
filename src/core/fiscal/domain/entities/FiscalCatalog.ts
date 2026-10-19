/** A row of the fixed catalog of provider document types (DS15). Behaviour comes from its flags. */
export interface FiscalDocumentType {
	id: number;
	code: string;
	name: string;
	kind: 'INVOICE' | 'CREDIT_NOTE' | 'TICKET' | 'DELIVERY_NOTE';
	letter: string | null;
	/** The code printed under the letter ("CÓD. 01"); null for papers without one. */
	afipCode: string | null;
	discriminatesVat: boolean;
	sign: 1 | 0 | -1;
	requiresNumber: boolean;
}

export interface TaxRate {
	id: number;
	code: string;
	name: string;
	rate: string;
}

/** A tax of the fixed catalog: per line (VAT, fuel, internal) or per document (perceptions). */
export interface Tax {
	id: number;
	code: string;
	name: string;
	kind: string;
	jurisdiction: string;
	appliesTo: 'LINE' | 'DOCUMENT';
	isRecoverable: boolean;
	rates: TaxRate[];
}

export const VAT_CODE = 'VAT';
export const DEFAULT_VAT_RATE_CODE = 'VAT_21';
