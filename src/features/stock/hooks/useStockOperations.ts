import { useMutation, useQuery } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import {
	GetBatchConsumptionHistoryUseCase,
	RegisterConsumptionUseCase,
	RegisterStockCountUseCase,
	ResolveStockIncidentUseCase
} from '@/core/stock/application/use-cases/StockUseCases';
import { ConsumptionPayload, StockCountPayload } from '@/core/stock/domain/entities/ItemDocument';
import { ApiItemDocumentRepository } from '@/core/stock/infrastructure/repositories/ApiItemDocumentRepository';
import { ApiItemStockRepository } from '@/core/stock/infrastructure/repositories/ApiItemStockRepository';
import { useInvalidateStock } from './useInvalidateStock';

const documents = new ApiItemDocumentRepository();
const stocks = new ApiItemStockRepository();

export const useRegisterConsumption = () => {
	const invalidate = useInvalidateStock();

	return useMutation({
		mutationFn: (payload: ConsumptionPayload) => new RegisterConsumptionUseCase(documents).execute(payload),
		onSuccess: invalidate
	});
};

export const useRegisterStockCount = () => {
	const invalidate = useInvalidateStock();

	return useMutation({
		mutationFn: (payload: StockCountPayload) => new RegisterStockCountUseCase(documents).execute(payload),
		onSuccess: invalidate
	});
};

export const useResolveStockIncident = () => {
	const invalidate = useInvalidateStock();

	return useMutation({
		mutationFn: (v: { id: number; resolution: string }) => new ResolveStockIncidentUseCase(stocks).execute(v.id, v.resolution),
		onSuccess: invalidate
	});
};

/** What a batch received and what it cost (/herd, "Consumos y servicios"). */
export const useBatchConsumptionHistory = (batchId: number | null | undefined) => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: ['batches', activeCompanyId, 'consumption-history', batchId ?? 0],
		queryFn: () => new GetBatchConsumptionHistoryUseCase(stocks).execute(batchId as number),
		enabled: !!activeCompanyId && !!batchId
	});
};
