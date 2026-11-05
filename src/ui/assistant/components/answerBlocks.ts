import type { AssistantBlock, AssistantResponse } from '@/core/assistant/domain/AssistantTypes';

const VISUAL_TYPES = new Set<AssistantBlock['type']>(['chart', 'table', 'timeline', 'kpis']);

/** True when an answer has something worth seeing at full width. */
export const hasVisualBlocks = (response: AssistantResponse): boolean =>
	response.blocks.some((block) => VISUAL_TYPES.has(block.type));

const NOUNS: Partial<Record<AssistantBlock['type'], [string, string]>> = {
	chart: ['gráfico', 'gráficos'],
	table: ['tabla', 'tablas'],
	timeline: ['línea de tiempo', 'líneas de tiempo'],
	kpis: ['indicadores', 'indicadores']
};

/** "1 gráfico · 2 tablas": what an answer carries besides its text, for the workspace list. */
export function describeVisuals(response: AssistantResponse): string {
	const counts = new Map<AssistantBlock['type'], number>();
	response.blocks.forEach((block) => counts.set(block.type, (counts.get(block.type) ?? 0) + 1));

	return [...counts.entries()]
		.filter(([type]) => NOUNS[type])
		.map(([type, count]) => `${count} ${NOUNS[type]![count === 1 ? 0 : 1]}`)
		.join(' · ');
}

const BLOCK_ORDER_PRIORITY: Record<AssistantBlock['type'], number> = {
	text: 10,
	kpis: 20,
	chart: 30,
	timeline: 40,
	table: 50,
	action: 60
};

/**
 * Ensures blocks strictly follow the user's canonical presentation hierarchy:
 * 1. Agent textual analysis (text) - at the top
 * 2. Key performance indicator cards (kpis) - always below text and above tables
 * 3. Charts and timelines (chart, timeline)
 * 4. Detailed data tables (table) - always below KPIs
 * 5. Actions / navigation buttons (action) - at the bottom
 *
 * Uses stable sorting to preserve the relative order of blocks within the same category.
 */
export function canonicalizeBlocks(blocks: AssistantBlock[]): AssistantBlock[] {
	return [...blocks].sort((a, b) => {
		const orderA = BLOCK_ORDER_PRIORITY[a.type] ?? 99;
		const orderB = BLOCK_ORDER_PRIORITY[b.type] ?? 99;
		return orderA - orderB;
	});
}
