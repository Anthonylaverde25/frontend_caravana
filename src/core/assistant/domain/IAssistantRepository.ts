import type { AssistantHistoryMessage, AssistantResponse } from './AssistantTypes';

export interface IAssistantRepository {
	/** One chat turn: the previous turns as text plus the new question, oldest first. */
	ask(messages: AssistantHistoryMessage[]): Promise<AssistantResponse>;
}
