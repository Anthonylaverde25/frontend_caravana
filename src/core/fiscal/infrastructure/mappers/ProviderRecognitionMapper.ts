import { SupplierMapper } from '@/core/suppliers/infrastructure/mappers/SupplierMapper';
import { ProviderRecognition, ResolvedFiscalLine } from '../../domain/entities/ProviderRecognition';

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
			companyCuitMissing: Boolean(raw.company_cuit_missing),
			lines: (raw.lines ?? []).map(ProviderRecognitionMapper.lineToDomain)
		};
	}

	static lineToDomain(raw: any): ResolvedFiscalLine {
		return {
			position: raw.position,
			code: raw.code ?? null,
			description: raw.description,
			quantity: raw.quantity ?? null,
			unitPrice: raw.unit_price ?? null,
			vatRateCode: raw.vat_rate_code ?? null,
			vatTaxRateId: raw.vat_tax_rate_id ?? null,
			resolution: {
				source: raw.resolution?.source ?? 'NONE',
				level: raw.resolution?.level ?? 'NONE',
				itemId: raw.resolution?.item_id ?? null,
				reason: raw.resolution?.reason ?? null,
				suggestedItemId: raw.resolution?.suggested_item_id ?? null,
				note: raw.resolution?.note ?? null
			}
		};
	}
}
