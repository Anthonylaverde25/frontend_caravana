import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import { useCompany } from '@/contexts/CompanyContext';
import { OperationalKpisResponse } from '../types/operationalKpis.types';

export const OPERATIONAL_KPIS_QUERY_KEY = 'dashboard-operational-kpis';

export function useOperationalKpis() {
	const { activeCompanyId } = useCompany();

	const query = useQuery({
		queryKey: [OPERATIONAL_KPIS_QUERY_KEY, activeCompanyId],
		queryFn: async (): Promise<OperationalKpisResponse> => {
			const res = await axiosInstance.get<OperationalKpisResponse>('/dashboard/operational-kpis');
			return res.data;
		},
		enabled: Boolean(activeCompanyId),
		staleTime: 60_000,
		refetchOnWindowFocus: true
	});

	const categories = query.data?.categories;
	const summary = query.data?.summary;

	return {
		data: query.data,
		summary,
		categories,
		isLoading: query.isLoading,
		isError: query.isError,
		refetch: query.refetch
	};
}
