import type { IssuedMcpConnection, McpAuthorizationParams, McpAuthorizationRequest, McpConnectionList } from './McpConnection';

export interface IMcpConnectionRepository {
	list(): Promise<McpConnectionList>;
	issue(input: { name: string; ttlDays: number }): Promise<IssuedMcpConnection>;
	revoke(id: number): Promise<void>;
	describeAuthorization(params: McpAuthorizationParams): Promise<McpAuthorizationRequest>;
	/** Returns the URL the browser must open next (back to the AI client). */
	answerAuthorization(params: McpAuthorizationParams, companyId: number, approve: boolean): Promise<string>;
}
