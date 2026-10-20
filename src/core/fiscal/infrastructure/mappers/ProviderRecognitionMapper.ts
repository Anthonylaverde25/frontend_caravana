import { SupplierMapper } from '@/core/suppliers/infrastructure/mappers/SupplierMapper';
import { ProviderRecognition } from '../../domain/entities/ProviderRecognition';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ProviderRecognitionMapper {
	static toDomain(raw: any): ProviderRecognition {
		return {
			status: raw.status,
			reason: raw.reason ?? null,
			provider: raw.provider ? SupplierMapper.toDomain(raw.provider) : null,
			issuer: {
				cuit: raw.issuer?.cuit ?? null,
				source: raw.issuer?.source ?? null,
				discrepancyCuit: raw.issuer?.discrepancy_cuit ?? null,
				name: raw.issuer?.name ?? null,
				legalName: raw.issuer?.legal_name ?? null,
				address: raw.issuer?.address ?? null,
				vatCondition: raw.issuer?.vat_condition ?? null
			},
			suggestedCuit: raw.suggested_cuit ?? null,
			receiver: raw.receiver ?? null,
			receiverMismatch: Boolean(raw.receiver_mismatch),
			companyCuit: raw.company_cuit ?? null,
			companyCuitMissing: Boolean(raw.company_cuit_missing)
		};
	}
}
