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

/** Entities a table cell can open in a detail drawer (mirrors ai-agent `EntityKind`). */
export type EntityKind =
	| 'caravan'
	| 'batch'
	| 'service_order'
	| 'entry_order'
	| 'birth_order'
	| 'transfer_order'
	| 'weaning_order'
	| 'item'
	| 'item_document'
	| 'warehouse'
	| 'fiscal_document'
	| 'animal_category'
	| 'item_category';

/** Filter shared by a whole column, set by code: e.g. a category inside one batch's table. */
export interface EntityScope {
	batch_id?: number | null;
}

/** What a linked cell points at: the drawer to open and the record to load in it. */
export interface EntityRef {
	kind: EntityKind;
	id: number;
	/** The text of the clicked cell, shown while the record loads. */
	label?: string;
	scope?: EntityScope | null;
}

export interface TableColumn {
	key: string;
	label: string;
	/** Set when the cells of this column open an entity. */
	entity?: EntityKind | null;
	scope?: EntityScope | null;
}

export type TableCell = string | number | boolean | null;

export interface TableBlock {
	type: 'table';
	title?: string | null;
	columns: TableColumn[];
	rows: Record<string, TableCell>[];
	/** Aligned with rows: per row, the entity id behind each linked column. Absent in older answers. */
	refs?: Record<string, number>[] | null;
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
