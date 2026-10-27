import { useMutation, useQuery } from '@tanstack/react-query';
import { AnswerMcpAuthorizationUseCase, DescribeMcpAuthorizationUseCase } from '@/core/mcp/application/use-cases/McpConnectionUseCases';
import type { McpAuthorizationParams } from '@/core/mcp/domain/McpConnection';
import { mcpConnectionRepository } from '@/core/mcp/infrastructure/repositories/ApiMcpConnectionRepository';

/** What the AI client asks for; refused requests (unknown client, bad redirect) come back as errors. */
export const useMcpAuthorizationRequest = (params: McpAuthorizationParams, enabled: boolean) =>
	useQuery({
		queryKey: ['mcp-authorization-request', params],
		queryFn: () => new DescribeMcpAuthorizationUseCase(mcpConnectionRepository).execute(params),
		enabled,
		retry: false,
		staleTime: Infinity
	});

export const useAnswerMcpAuthorization = () =>
	useMutation({
		mutationFn: (v: { params: McpAuthorizationParams; companyId: number; approve: boolean }) =>
			new AnswerMcpAuthorizationUseCase(mcpConnectionRepository).execute(v.params, v.companyId, v.approve)
	});
