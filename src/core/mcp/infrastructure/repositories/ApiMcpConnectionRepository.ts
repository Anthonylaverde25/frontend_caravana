import axiosInstance from '@/utils/axios';
import type { IMcpConnectionRepository } from '../../domain/IMcpConnectionRepository';
import type {
	IssuedMcpConnection,
	McpAuthorizationParams,
	McpAuthorizationRequest,
	McpConnection,
	McpConnectionList
} from '../../domain/McpConnection';

interface McpConnectionJson {
	id: number;
	name: string;
	source: 'manual' | 'oauth';
	created_at: string | null;
	last_used_at: string | null;
	expires_at: string;
	revoked_at: string | null;
}

const toConnection = (raw: McpConnectionJson): McpConnection => ({
	id: raw.id,
	name: raw.name,
	source: raw.source,
	createdAt: raw.created_at,
	lastUsedAt: raw.last_used_at,
	expiresAt: raw.expires_at,
	revokedAt: raw.revoked_at
});

/** AI client connections (MCP). Token and X-Company-ID travel as global axios headers. */
export class ApiMcpConnectionRepository implements IMcpConnectionRepository {
	async list(): Promise<McpConnectionList> {
		const { data } = await axiosInstance.get<{ data: McpConnectionJson[]; meta: { server_url: string } }>('/mcp/connections');
		return { connections: data.data.map(toConnection), serverUrl: data.meta.server_url };
	}

	async issue(input: { name: string; ttlDays: number }): Promise<IssuedMcpConnection> {
		const { data } = await axiosInstance.post<{ data: McpConnectionJson; meta: { plain_text_token: string; server_url: string } }>(
			'/mcp/connections',
			{ name: input.name, ttl_days: input.ttlDays }
		);
		return { connection: toConnection(data.data), plainTextToken: data.meta.plain_text_token, serverUrl: data.meta.server_url };
	}

	async revoke(id: number): Promise<void> {
		await axiosInstance.delete(`/mcp/connections/${id}`);
	}

	async describeAuthorization(params: McpAuthorizationParams): Promise<McpAuthorizationRequest> {
		const { data } = await axiosInstance.get<{ client_name: string; redirect_host: string; scope: string }>(
			'/mcp/oauth/authorization-request',
			{ params }
		);
		return { clientName: data.client_name, redirectHost: data.redirect_host, scope: data.scope };
	}

	async answerAuthorization(params: McpAuthorizationParams, companyId: number, approve: boolean): Promise<string> {
		// The chosen company travels as X-Company-ID: the API checks the user belongs to it.
		const { data } = await axiosInstance.post<{ redirect_url: string }>(
			'/mcp/oauth/authorize',
			{ ...params, decision: approve ? 'approve' : 'deny' },
			{ headers: { 'X-Company-ID': String(companyId) } }
		);
		return data.redirect_url;
	}
}

export const mcpConnectionRepository = new ApiMcpConnectionRepository();
