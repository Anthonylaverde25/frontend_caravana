import type { AssistantBlock, AssistantHistoryMessage, ConversationTurn } from '@/core/assistant/domain/AssistantTypes';

/**
 * The assistant conversation, kept outside React so the drawer and the workspace view share it and
 * it survives either unmounting while the user moves between screens. It is deliberately
 * ephemeral: a reload, a sign-out or a change of company starts a new one (nothing is persisted).
 */
interface ConversationState {
	companyId: number | null;
	turns: ConversationTurn[];
	pending: boolean;
	/** The answer the workspace canvas shows; the newest one unless the user picks another. */
	selectedAnswerId: string | null;
}

type Listener = () => void;

const EMPTY = { turns: [], pending: false, selectedAnswerId: null };

let state: ConversationState = { companyId: null, ...EMPTY };
const listeners = new Set<Listener>();

function emit(next: ConversationState): void {
	state = next;
	listeners.forEach((listener) => listener());
}

export const conversationStore = {
	subscribe(listener: Listener): () => void {
		listeners.add(listener);

		return () => listeners.delete(listener);
	},
	getSnapshot(): ConversationState {
		return state;
	},
	/** A different company means different data: the previous answers no longer apply. */
	bindCompany(companyId: number | null): void {
		if (state.companyId !== companyId) {
			emit({ companyId, ...EMPTY });
		}
	},
	append(turn: ConversationTurn): void {
		emit({
			...state,
			turns: [...state.turns, turn],
			selectedAnswerId: turn.role === 'assistant' ? turn.id : state.selectedAnswerId
		});
	},
	select(answerId: string): void {
		emit({ ...state, selectedAnswerId: answerId });
	},
	setPending(pending: boolean): void {
		emit({ ...state, pending });
	},
	reset(): void {
		emit({ ...state, ...EMPTY });
	}
};

/** Previous turns the model gets back, as text only: rows never travel back to it. */
const HISTORY_TURNS = 20;

function describeBlock(block: AssistantBlock): string | null {
	switch (block.type) {
		case 'text':
			return block.markdown;
		case 'table':
			return `[Se mostró la tabla "${block.title ?? 'sin título'}" con ${block.rows.length} de ${block.total_rows} filas]`;
		case 'kpis':
			return `[Se mostraron indicadores: ${block.items.map((item) => `${item.label} = ${item.value ?? '—'}${item.unit ? ` ${item.unit}` : ''}`).join('; ')}]`;
		case 'chart':
			return `[Se mostró el gráfico "${block.title}" (${block.kind}, ${block.rows.length} puntos${block.n != null ? `, n = ${block.n}` : ''})]`;
		case 'timeline':
			return `[Se mostró la línea de tiempo "${block.title}" con ${block.events.length} eventos]`;
		case 'action':
			return null;
		default:
			return null;
	}
}

export function toHistory(turns: ConversationTurn[]): AssistantHistoryMessage[] {
	return turns.slice(-HISTORY_TURNS).flatMap((turn): AssistantHistoryMessage[] => {
		if (turn.role === 'user') return [{ role: 'user', content: turn.text }];

		if (turn.role === 'assistant') {
			const content = turn.response.blocks.map(describeBlock).filter(Boolean).join('\n').slice(0, 4000);

			return content ? [{ role: 'assistant', content }] : [];
		}

		return [];
	});
}
