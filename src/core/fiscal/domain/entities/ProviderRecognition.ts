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
}
