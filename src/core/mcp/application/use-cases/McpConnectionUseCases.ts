import type { IMcpConnectionRepository } from '../../domain/IMcpConnectionRepository';
import type { IssuedMcpConnection, McpAuthorizationParams, McpAuthorizationRequest, McpConnectionList } from '../../domain/McpConnection';

export class ListMcpConnectionsUseCase {
	constructor(private repository: IMcpConnectionRepository) {}

	execute(): Promise<McpConnectionList> {
		return this.repository.list();
	}
}

export class IssueMcpConnectionUseCase {
	constructor(private repository: IMcpConnectionRepository) {}

	execute(name: string, ttlDays: number): Promise<IssuedMcpConnection> {
		return this.repository.issue({ name: name.trim(), ttlDays });
	}
}

export class RevokeMcpConnectionUseCase {
	constructor(private repository: IMcpConnectionRepository) {}

	execute(id: number): Promise<void> {
		return this.repository.revoke(id);
	}
}

export class DescribeMcpAuthorizationUseCase {
	constructor(private repository: IMcpConnectionRepository) {}

	execute(params: McpAuthorizationParams): Promise<McpAuthorizationRequest> {
		return this.repository.describeAuthorization(params);
	}
}

export class AnswerMcpAuthorizationUseCase {
	constructor(private repository: IMcpConnectionRepository) {}

	execute(params: McpAuthorizationParams, companyId: number, approve: boolean): Promise<string> {
		return this.repository.answerAuthorization(params, companyId, approve);
	}
}
