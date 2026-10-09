export type HerdGraphViewMode = 'tree' | 'sankey';

export interface HerdCategoryBreakdown {
	id: string;
	label: string;
	code: string;
	sex: 'H' | 'M';
	heads: number;
	pctOfSex: number;
	pctOfTotal: number;
	color: string;
	description?: string;
}

export interface HerdSexBreakdown {
	sex: 'H' | 'M';
	label: string;
	heads: number;
	pctOfTotal: number;
	color: string;
	categories: HerdCategoryBreakdown[];
}

export interface HerdVolumeHierarchy {
	totalHeads: number;
	asOf: string;
	females: HerdSexBreakdown;
	males: HerdSexBreakdown;
	unassignedCount: number;
	isLive: boolean;
}

/** ECharts Tree Node representation */
export interface EChartsTreeNode {
	name: string;
	value?: number;
	heads?: number;
	pct?: number;
	subtitle?: string;
	itemStyle?: {
		color?: string;
		borderColor?: string;
		borderWidth?: number;
	};
	lineStyle?: {
		color?: string;
		width?: number;
	};
	label?: Record<string, unknown>;
	children?: EChartsTreeNode[];
}

/** ECharts Sankey Node & Link representations */
export interface EChartsSankeyNode {
	name: string;
	value?: number;
	itemStyle?: {
		color?: string;
		borderColor?: string;
	};
	label?: Record<string, unknown>;
}

export interface EChartsSankeyLink {
	source: string;
	target: string;
	value: number;
	lineStyle?: {
		color?: string;
		opacity?: number;
	};
}
