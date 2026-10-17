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
