import axiosInstance from '@/utils/axios';
import { Company } from '@/contexts/CompanyContext';

/** The active company's own data (the X-Company-ID header names it). */
export class ApiCompanyRepository {
	async updateFiscalData(cuit: string | null): Promise<Company> {
		const response = await axiosInstance.patch<Company>('/company/fiscal-data', { cuit });

		return response.data;
	}
}
