import { useQuery } from '@tanstack/react-query';
import { ApiBatchRepository } from '@/core/batches/infrastructure/repositories/ApiBatchRepository';
import { ListBatchesUseCase } from '@/core/batches/application/use-cases/ListBatchesUseCase';
import { useCompany } from '@/contexts/CompanyContext';

const batchRepository = new ApiBatchRepository();
const listBatchesUseCase = new ListBatchesUseCase(batchRepository);

export function useBatches(farmId?: number, batchType?: string, scope?: 'own' | 'external' | 'all') {
  const { activeCompanyId } = useCompany();

  return useQuery({
    queryKey: ['batches', activeCompanyId, farmId, batchType, scope],
    queryFn: () => listBatchesUseCase.execute(farmId, batchType, scope),
    enabled: activeCompanyId != null,
  });
}
