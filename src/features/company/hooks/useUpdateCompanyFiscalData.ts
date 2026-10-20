import { useMutation } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import { ApiCompanyRepository } from '@/core/company/infrastructure/ApiCompanyRepository';

/** Saves the active company's CUIT and refreshes it in memory. */
export const useUpdateCompanyFiscalData = () => {
	const { patchCompany } = useCompany();
	const repository = new ApiCompanyRepository();

	return useMutation({
		mutationFn: (cuit: string | null) => repository.updateFiscalData(cuit),
		onSuccess: (company) => patchCompany(company)
	});
};
