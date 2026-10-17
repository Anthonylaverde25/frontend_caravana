import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import type { AssistantResponse } from '@/core/assistant/domain/AssistantTypes';
import { assistantRepository } from '@/core/assistant/infrastructure/repositories/ApiAssistantRepository';
import { conversationStore, toHistory } from '../conversationStore';

const nowLabel = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function errorMessage(error: unknown): string {
	const response = (error as { response?: { status?: number; data?: { message?: string } } })?.response;
	const message = response?.data?.message;

	if (response?.status === 429) return 'Hiciste muchas consultas seguidas. Esperá un minuto y probá de nuevo.';

	if (typeof message === 'string' && message.trim() !== '') return message;

	if ((error as { code?: string })?.code === 'ECONNABORTED') {
		return 'La consulta tardó demasiado. Probá con una pregunta más acotada.';
	}

	return 'No pude comunicarme con el asistente. Probá de nuevo en un momento.';
}

/**
 * The conversation with the Virtual Assistant: its turns, whether an answer is on the way, and the
 * actions to ask, start over or (in development) play a simulated answer.
 */
export function useAssistantConversation() {
	const { activeCompanyId } = useCompany();
	const { turns, pending, selectedAnswerId } = useSyncExternalStore(
		conversationStore.subscribe,
		conversationStore.getSnapshot
	);

	useEffect(() => {
		conversationStore.bindCompany(activeCompanyId ?? null);
	}, [activeCompanyId]);

	const ask = useCallback(async (question: string) => {
		const text = question.trim();

		if (!text || conversationStore.getSnapshot().pending) return;

		conversationStore.append({ id: newId(), role: 'user', text, at: nowLabel() });
		conversationStore.setPending(true);

		try {
			const response = await assistantRepository.ask(toHistory(conversationStore.getSnapshot().turns));
			conversationStore.append({ id: newId(), role: 'assistant', response, at: nowLabel() });
		} catch (error) {
			conversationStore.append({ id: newId(), role: 'error', message: errorMessage(error), at: nowLabel() });
		} finally {
			conversationStore.setPending(false);
		}
	}, []);

	/** Development only: shows a canned answer without calling the API or the model. */
	const simulate = useCallback((question: string, response: AssistantResponse) => {
		conversationStore.append({ id: newId(), role: 'user', text: question, at: nowLabel() });
		conversationStore.append({ id: newId(), role: 'assistant', response, at: nowLabel() });
	}, []);

	return {
		turns,
		pending,
		selectedAnswerId,
		ask,
		simulate,
		select: conversationStore.select,
		reset: conversationStore.reset
	};
}
