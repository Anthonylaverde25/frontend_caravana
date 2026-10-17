/**
 * Contract of the Virtual Assistant (mirrors ai-agent `app/assistant/schemas.py`).
 *
 * The assistant answers with typed blocks. Every figure inside a table or KPI block was copied by
 * code from what the API returned; the model only chose what to show.
 */

export type AssistantRole = 'user' | 'assistant';

export interface AssistantHistoryMessage {
	role: AssistantRole;
	content: string;
}

export interface TextBlock {
	type: 'text';
	markdown: string;
}

export interface KpiItem {
	label: string;
	value: number | string | null;
	unit?: string | null;
	n?: number | null;
}

export interface KpisBlock {
	type: 'kpis';
	title?: string | null;
	items: KpiItem[];
}

export interface TableColumn {
	key: string;
	label: string;
}

export type TableCell = string | number | boolean | null;

export interface TableBlock {
	type: 'table';
	title?: string | null;
	columns: TableColumn[];
	rows: Record<string, TableCell>[];
	total_rows: number;
}

export type ChartKind = 'bar' | 'line' | 'pie' | 'scatter' | 'histogram';

export interface ChartBlock {
	type: 'chart';
	title: string;
	kind: ChartKind;
	x: string;
	y: string[];
	series_by?: string | null;
	x_label?: string | null;
	y_label?: string | null;
	unit?: string | null;
	/** Sample size behind the chart. */
	n?: number | null;
	rows: Record<string, TableCell>[];
}

export interface TimelineEvent {
	date: string;
	kind: string;
	label: string;
	detail?: string | null;
}

export interface TimelineBlock {
	type: 'timeline';
	title: string;
	events: TimelineEvent[];
}

export interface ActionBlock {
	type: 'action';
	label: string;
	route: string;
}

export type AssistantBlock = TextBlock | KpisBlock | TableBlock | ChartBlock | TimelineBlock | ActionBlock;

/** How much room a block has: the drawer column or the workspace canvas. */
export type BlockSize = 'compact' | 'full';

export interface AssistantResponse {
	blocks: AssistantBlock[];
	tools_used: string[];
	/** True when at least one data tool answered: the reply rests on the user's records. */
	grounded: boolean;
	model?: string | null;
}

/** One entry of the conversation as the drawer shows it. */
export type ConversationTurn =
	| { id: string; role: 'user'; text: string; at: string }
	| { id: string; role: 'assistant'; response: AssistantResponse; at: string }
	| { id: string; role: 'error'; message: string; at: string };
