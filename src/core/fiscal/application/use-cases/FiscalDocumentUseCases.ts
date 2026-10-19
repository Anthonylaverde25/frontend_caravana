import { FiscalDocumentType, Tax } from '../../domain/entities/FiscalCatalog';
import { FiscalDocumentDetail, FiscalDocumentFilters, FiscalDocumentPayload, FiscalRegisterPage } from '../../domain/entities/FiscalDocument';
import { IFiscalCatalogRepository, IFiscalDocumentRepository } from '../../domain/repositories/IFiscalDocumentRepository';

export class SearchFiscalDocumentsUseCase {
	constructor(private repository: IFiscalDocumentRepository) {}

	execute(filters: FiscalDocumentFilters): Promise<FiscalRegisterPage> {
		return this.repository.search(filters);
	}
}

export class FindFiscalDocumentUseCase {
	constructor(private repository: IFiscalDocumentRepository) {}

	execute(id: number): Promise<FiscalDocumentDetail> {
		return this.repository.findById(id);
	}
}

/** Registers the paper; its stocked lines enter (or leave) the warehouse in the same request. */
export class RegisterFiscalDocumentUseCase {
	constructor(private repository: IFiscalDocumentRepository) {}

	execute(payload: FiscalDocumentPayload): Promise<FiscalDocumentDetail> {
		return this.repository.register(payload);
	}
}

/** Voiding also reverses the stock operation; the same number can then be loaded again (DS20, DS21). */
export class VoidFiscalDocumentUseCase {
	constructor(private repository: IFiscalDocumentRepository) {}

	execute(id: number, reason: string): Promise<FiscalDocumentDetail> {
		return this.repository.void(id, reason.trim());
	}
}

export class GetFiscalCatalogUseCase {
	constructor(private repository: IFiscalCatalogRepository) {}

	async execute(): Promise<{ types: FiscalDocumentType[]; taxes: Tax[] }> {
		const [types, taxes] = await Promise.all([this.repository.documentTypes(), this.repository.taxes()]);
		return { types, taxes };
	}
}
