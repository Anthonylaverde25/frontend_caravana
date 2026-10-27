/** An AI client (Claude, Gemini...) connected over MCP on behalf of the user, in one company. */
export interface McpConnection {
	id: number;
	name: string;
	/** `manual`: token pasted into the client. `oauth`: the client was added as a connector. */
	source: 'manual' | 'oauth';
	createdAt: string | null;
	lastUsedAt: string | null;
	expiresAt: string;
	revokedAt: string | null;
}

export type McpConnectionStatus = 'active' | 'expired' | 'revoked';

/** Derived here, never sent by the API: revoked wins over expired. */
export function mcpConnectionStatus(connection: McpConnection, now: Date = new Date()): McpConnectionStatus {
	if (connection.revokedAt) return 'revoked';
	return new Date(connection.expiresAt) <= now ? 'expired' : 'active';
}

export const MCP_STATUS_LABEL: Record<McpConnectionStatus, string> = {
	active: 'Activa',
	expired: 'Vencida',
	revoked: 'Revocada'
};

export interface McpConnectionList {
	connections: McpConnection[];
	/** The MCP endpoint of this establishment: what a client is pointed to. */
	serverUrl: string;
}

export interface IssuedMcpConnection {
	connection: McpConnection;
	/** Shown once; only its hash is kept by the system. */
	plainTextToken: string;
	serverUrl: string;
}

/** The OAuth parameters an AI client sent, echoed back untouched on approval. */
export type McpAuthorizationParams = Record<string, string>;

export interface McpAuthorizationRequest {
	clientName: string;
	redirectHost: string;
	scope: string;
}

export const MCP_TTL_OPTIONS = [30, 90, 180] as const;
