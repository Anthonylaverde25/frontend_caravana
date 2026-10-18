import { ItemCategory } from '../entities/ItemCategory';

export interface CategoryNode extends ItemCategory {
	depth: number;
	children: CategoryNode[];
}

const byOrder = (a: ItemCategory, b: ItemCategory) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name);

/** The tree from the flat list the API returns. Orphans (parent filtered out) become roots. */
export function buildTree(flat: ItemCategory[]): CategoryNode[] {
	const ids = new Set(flat.map((c) => c.id));
	const childrenOf = (parentId: number | null, depth: number): CategoryNode[] =>
		flat
			.filter((c) => (parentId === null ? c.parentId === null || !ids.has(c.parentId) : c.parentId === parentId))
			.sort(byOrder)
			.map((c) => ({ ...c, depth, children: childrenOf(c.id, depth + 1) }));

	return childrenOf(null, 0);
}

/** Depth-first, the order the tree grid and the indented selects show. */
export function flattenTree(nodes: CategoryNode[]): CategoryNode[] {
	return nodes.flatMap((n) => [n, ...flattenTree(n.children)]);
}

/** The category and every category under it. */
export function descendantIds(flat: ItemCategory[], id: number): Set<number> {
	const result = new Set<number>([id]);
	let grew = true;
	while (grew) {
		grew = false;
		flat.forEach((c) => {
			if (c.parentId !== null && result.has(c.parentId) && !result.has(c.id)) {
				result.add(c.id);
				grew = true;
			}
		});
	}
	return result;
}

/** "Sanidad › Antiparasitarios" */
export function pathOf(flat: ItemCategory[], id: number): string {
	const byId = new Map(flat.map((c) => [c.id, c]));
	const names: string[] = [];
	let cursor = byId.get(id);
	while (cursor && names.length <= flat.length) {
		names.unshift(cursor.name);
		cursor = cursor.parentId !== null ? byId.get(cursor.parentId) : undefined;
	}
	return names.join(' › ');
}
