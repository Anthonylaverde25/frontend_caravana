import { useMemo } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import {
	HerdCategoryBreakdown,
	HerdSexBreakdown,
	HerdVolumeHierarchy,
	EChartsTreeNode,
	EChartsSankeyNode,
	EChartsSankeyLink
} from '../types/herdGraph.types';

const FEMALE_PALETTE = ['#059669', '#10B981', '#34D399', '#D97706', '#047857'];
const MALE_PALETTE = ['#2563EB', '#3B82F6', '#60A5FA', '#6366F1', '#1D4ED8'];

export function useHerdVolumeData() {
	const { activeCompanyId } = useCompany();
	const { data: caravans = [], isLoading } = useCaravans(activeCompanyId, 'all');

	const hierarchy = useMemo<HerdVolumeHierarchy>(() => {
		const totalHeads = caravans.length;
		let femalesCount = 0;
			let malesCount = 0;
			let unassignedCount = 0;

			const femaleCatMap = new Map<string, number>();
			const maleCatMap = new Map<string, number>();

			caravans.forEach((c) => {
				const catName = c.category_name || c.category || 'Sin categoría';
				const sex = (c.sex || '').toUpperCase();

				if (sex === 'H') {
					femalesCount++;
					femaleCatMap.set(catName, (femaleCatMap.get(catName) || 0) + 1);
				} else if (sex === 'M') {
					malesCount++;
					maleCatMap.set(catName, (maleCatMap.get(catName) || 0) + 1);
				} else {
					unassignedCount++;
				}
			});

			const femaleCategories: HerdCategoryBreakdown[] = Array.from(femaleCatMap.entries())
				.sort((a, b) => b[1] - a[1])
				.map(([label, heads], index) => ({
					id: `f_cat_${index}`,
					label,
					code: label.toUpperCase().replace(/\s+/g, '_'),
					sex: 'H',
					heads,
					pctOfSex: femalesCount > 0 ? Number(((heads / femalesCount) * 100).toFixed(1)) : 0,
					pctOfTotal: totalHeads > 0 ? Number(((heads / totalHeads) * 100).toFixed(1)) : 0,
					color: FEMALE_PALETTE[index % FEMALE_PALETTE.length]
				}));

			const maleCategories: HerdCategoryBreakdown[] = Array.from(maleCatMap.entries())
				.sort((a, b) => b[1] - a[1])
				.map(([label, heads], index) => ({
					id: `m_cat_${index}`,
					label,
					code: label.toUpperCase().replace(/\s+/g, '_'),
					sex: 'M',
					heads,
					pctOfSex: malesCount > 0 ? Number(((heads / malesCount) * 100).toFixed(1)) : 0,
					pctOfTotal: totalHeads > 0 ? Number(((heads / totalHeads) * 100).toFixed(1)) : 0,
					color: MALE_PALETTE[index % MALE_PALETTE.length]
				}));

			const females: HerdSexBreakdown = {
				sex: 'H',
				label: 'Hembras (Vientres)',
				heads: femalesCount,
				pctOfTotal: totalHeads > 0 ? Number(((femalesCount / totalHeads) * 100).toFixed(1)) : 0,
				color: '#059669',
				categories: femaleCategories
			};

			const males: HerdSexBreakdown = {
				sex: 'M',
				label: 'Machos (Invernada & Toros)',
				heads: malesCount,
				pctOfTotal: totalHeads > 0 ? Number(((malesCount / totalHeads) * 100).toFixed(1)) : 0,
				color: '#2563EB',
				categories: maleCategories
			};

			const now = new Date();
			const asOf = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;

			return {
				totalHeads,
				asOf,
				females,
				males,
				unassignedCount,
				isLive: true
			};
	}, [caravans]);

	// Build Tree structure for Apache ECharts tree series
	const treeData = useMemo<EChartsTreeNode>(() => {
		const femalesChildren: EChartsTreeNode[] = hierarchy.females.categories.map((cat) => ({
			name: `${cat.label}\n${cat.heads.toLocaleString('es-AR')} cab. (${cat.pctOfSex}%)`,
			value: cat.heads,
			heads: cat.heads,
			pct: cat.pctOfSex,
			subtitle: `Rodeo: ${cat.pctOfTotal}%`,
			itemStyle: {
				color: cat.color,
				borderColor: '#ffffff',
				borderWidth: 2
			}
		}));

		const malesChildren: EChartsTreeNode[] = hierarchy.males.categories.map((cat) => ({
			name: `${cat.label}\n${cat.heads.toLocaleString('es-AR')} cab. (${cat.pctOfSex}%)`,
			value: cat.heads,
			heads: cat.heads,
			pct: cat.pctOfSex,
			subtitle: `Rodeo: ${cat.pctOfTotal}%`,
			itemStyle: {
				color: cat.color,
				borderColor: '#ffffff',
				borderWidth: 2
			}
		}));

		return {
			name: `RODEO TOTAL\n${hierarchy.totalHeads.toLocaleString('es-AR')} Cabezas`,
			value: hierarchy.totalHeads,
			heads: hierarchy.totalHeads,
			pct: 100,
			itemStyle: {
				color: '#1F5C45',
				borderColor: '#ffffff',
				borderWidth: 3
			},
			children: [
				{
					name: `HEMBRAS\n${hierarchy.females.heads.toLocaleString('es-AR')} cab. (${hierarchy.females.pctOfTotal}%)`,
					value: hierarchy.females.heads,
					heads: hierarchy.females.heads,
					pct: hierarchy.females.pctOfTotal,
					itemStyle: {
						color: hierarchy.females.color,
						borderColor: '#ffffff',
						borderWidth: 2
					},
					lineStyle: {
						color: '#059669',
						width: 3
					},
					children: femalesChildren
				},
				{
					name: `MACHOS\n${hierarchy.males.heads.toLocaleString('es-AR')} cab. (${hierarchy.males.pctOfTotal}%)`,
					value: hierarchy.males.heads,
					heads: hierarchy.males.heads,
					pct: hierarchy.males.pctOfTotal,
					itemStyle: {
						color: hierarchy.males.color,
						borderColor: '#ffffff',
						borderWidth: 2
					},
					lineStyle: {
						color: '#2563EB',
						width: 3
					},
					children: malesChildren
				}
			]
		};
	}, [hierarchy]);

	// Build Sankey structure for Apache ECharts sankey series
	const sankeyData = useMemo<{ nodes: EChartsSankeyNode[]; links: EChartsSankeyLink[] }>(() => {
		const rootLabel = `Rodeo Total (${hierarchy.totalHeads.toLocaleString('es-AR')})`;
		const femalesLabel = `Hembras (${hierarchy.females.heads.toLocaleString('es-AR')})`;
		const malesLabel = `Machos (${hierarchy.males.heads.toLocaleString('es-AR')})`;

		const nodes: EChartsSankeyNode[] = [
			{ name: rootLabel, itemStyle: { color: '#1F5C45' } },
			{ name: femalesLabel, itemStyle: { color: hierarchy.females.color } },
			{ name: malesLabel, itemStyle: { color: hierarchy.males.color } }
		];

		const links: EChartsSankeyLink[] = [
			{
				source: rootLabel,
				target: femalesLabel,
				value: hierarchy.females.heads,
				lineStyle: { color: 'rgba(5, 150, 105, 0.45)' }
			},
			{
				source: rootLabel,
				target: malesLabel,
				value: hierarchy.males.heads,
				lineStyle: { color: 'rgba(37, 99, 235, 0.45)' }
			}
		];

		hierarchy.females.categories.forEach((cat) => {
			const catLabel = `H: ${cat.label} (${cat.heads.toLocaleString('es-AR')})`;
			nodes.push({ name: catLabel, itemStyle: { color: cat.color } });
			links.push({
				source: femalesLabel,
				target: catLabel,
				value: cat.heads,
				lineStyle: { color: 'rgba(5, 150, 105, 0.25)' }
			});
		});

		hierarchy.males.categories.forEach((cat) => {
			const catLabel = `M: ${cat.label} (${cat.heads.toLocaleString('es-AR')})`;
			nodes.push({ name: catLabel, itemStyle: { color: cat.color } });
			links.push({
				source: malesLabel,
				target: catLabel,
				value: cat.heads,
				lineStyle: { color: 'rgba(37, 99, 235, 0.25)' }
			});
		});

		return { nodes, links };
	}, [hierarchy]);

	return {
		hierarchy,
		treeData,
		sankeyData,
		isLoading
	};
}
