import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCompany } from '@/contexts/CompanyContext';
import {
	IssueMcpConnectionUseCase,
	ListMcpConnectionsUseCase,
	RevokeMcpConnectionUseCase
} from '@/core/mcp/application/use-cases/McpConnectionUseCases';
import { mcpConnectionRepository } from '@/core/mcp/infrastructure/repositories/ApiMcpConnectionRepository';

export const mcpKeys = {
	connections: (companyId: number | null) => ['mcp-connections', companyId] as const
};

export const useMcpConnections = () => {
	const { activeCompanyId } = useCompany();

	return useQuery({
		queryKey: mcpKeys.connections(activeCompanyId),
		queryFn: () => new ListMcpConnectionsUseCase(mcpConnectionRepository).execute(),
		enabled: !!activeCompanyId
	});
};

function useConnectionsMutation<V, R>(run: (v: V) => Promise<R>) {
	const queryClient = useQueryClient();
	const { activeCompanyId } = useCompany();

	return useMutation({
		mutationFn: run,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: mcpKeys.connections(activeCompanyId) })
	});
}

export const useIssueMcpConnection = () =>
	useConnectionsMutation((v: { name: string; ttlDays: number }) =>
		new IssueMcpConnectionUseCase(mcpConnectionRepository).execute(v.name, v.ttlDays)
	);

export const useRevokeMcpConnection = () =>
	useConnectionsMutation((id: number) => new RevokeMcpConnectionUseCase(mcpConnectionRepository).execute(id));
