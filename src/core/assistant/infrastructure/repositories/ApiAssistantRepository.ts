import axiosInstance from '@/utils/axios';
import type { AssistantHistoryMessage, AssistantResponse } from '../../domain/AssistantTypes';
import type { IAssistantRepository } from '../../domain/IAssistantRepository';

/** A turn may chain several API reads; the global 30 s axios timeout is too short for it. */
const ASSISTANT_TIMEOUT_MS = 130_000;

/**
 * The drawer talks only to api-laravel, which authenticates the user and forwards the turn to
 * ai-agent. The token and X-Company-ID travel as global axios headers, like every other call.
 */
export class ApiAssistantRepository implements IAssistantRepository {
	async ask(messages: AssistantHistoryMessage[]): Promise<AssistantResponse> {
		const response = await axiosInstance.post<AssistantResponse>(
			'/assistant/chat',
			{ messages },
			{ timeout: ASSISTANT_TIMEOUT_MS }
		);

		return response.data;
	}
}

export const assistantRepository = new ApiAssistantRepository();
