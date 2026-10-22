import { Supplier } from '@/core/suppliers/domain/entities/Supplier';

/** Who issued the document in the image, against the company's portfolio (Delivery F). */
export type RecognitionStatus = 'MATCHED' | 'ROLE_MISSING' | 'NEW' | 'UNREADABLE';

export type RecognitionReason =
	| 'NO_CUIT'
	| 'ISSUER_BLOCK_UNCERTAIN'
	| 'INVALID_CHECK_DIGIT'
	| 'SAME_AS_RECEIVER'
	| 'ISSUED_BY_OWN_COMPANY'
	| 'ISSUER_IS_OWN_COMPANY';

/** Where the issuer's CUIT came from: the ARCA QR (no interpretation) or the vision model. */
export type CuitSource = 'qr' | 'vision';

export interface IssuerRead {
	cuit: string | null;
	source: CuitSource | null;
	/** The model read another issuer CUIT than the QR; the QR's is used. */
	discrepancyCuit: string | null;
	name: string | null;
	legalName: string | null;
	address: string | null;
	vatCondition: string | null;
}

/** How the item of a read line was found (Delivery G): EXACT by name, AI (level HIGH) or not at all. */
export type LineResolutionSource = 'EXACT' | 'AI' | 'NONE';

export type LineMatchLevel = 'EXACT' | 'HIGH' | 'MEDIUM' | 'NONE';

/** A line read from the paper, with the item it was resolved to. Quantity and prices as API decimals. */
export interface ResolvedFiscalLine {
	position: number;
	code: string | null;
	description: string;
	quantity: string | null;
	unitPrice: string | null;
	vatRateCode: string | null;
	vatTaxRateId: number | null;
	resolution: {
		source: LineResolutionSource;
		level: LineMatchLevel;
		itemId: number | null;
		reason: string | null;
		/** MEDIUM: the candidate the link dialog offers first; not set on the line. */
		suggestedItemId: number | null;
		note: 'MATCHER_UNAVAILABLE' | null;
	};
}

export interface ProviderRecognition {
	status: RecognitionStatus;
	reason: RecognitionReason | null;
	provider: Supplier | null;
	issuer: IssuerRead;
	/** ISSUER_IS_OWN_COMPANY: the other CUIT on the paper, probably the real issuer. */
	suggestedCuit: string | null;
	/** Null when the document names no receiver CUIT (final consumer, delivery note): not an error. */
	receiver: { cuit: string; source: CuitSource } | null;
	receiverMismatch: boolean;
	companyCuit: string | null;
	companyCuitMissing: boolean;
	lines: ResolvedFiscalLine[];
}
