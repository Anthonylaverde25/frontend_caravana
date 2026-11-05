import React, { useState, useMemo } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { WidgetRenderProps } from '../../types/dashboard.types';
import { WidgetCard } from '../../components/primitives/WidgetCard';
import { useOperationalKpis } from '../../hooks/useOperationalKpis';
import { OperationalCategoryKey } from '../../types/operationalKpis.types';
import { OperationalOrdersTabs } from './components/OperationalOrdersTabs';
import { OperationalOrdersTable, DisplayOrderItem } from './components/OperationalOrdersTable';
import { formatNumber } from '../../theme/formatters';

export function OperationalOrdersWidget({ instance }: WidgetRenderProps) {
	const { categories, summary, isLoading, isError } = useOperationalKpis();
	const [activeTab, setActiveTab] = useState<OperationalCategoryKey | 'ALL'>('ALL');

	const counts = useMemo(() => {
		const entry = categories?.entry_orders?.total_pending ?? 0;
		const transfer = categories?.transfer_orders?.total_pending ?? 0;
		const weaning = categories?.weaning_orders?.total_pending ?? 0;
		const birth = categories?.birth_orders?.total_pending ?? 0;

		return {
			all: entry + transfer + weaning + birth,
			entry_orders: entry,
			transfer_orders: transfer,
			weaning_orders: weaning,
			birth_orders: birth
		};
	}, [categories]);

	const displayedItems = useMemo<DisplayOrderItem[]>(() => {
		if (!categories) return [];

		const allItems: DisplayOrderItem[] = [];
		const keys: OperationalCategoryKey[] = ['entry_orders', 'transfer_orders', 'weaning_orders', 'birth_orders'];

		keys.forEach((key) => {
			const cat = categories[key];
			if (!cat || !cat.items) return;

			cat.items.forEach((item) => {
				allItems.push({
					...item,
					categoryKey: key,
					categoryTitle: cat.title,
					templateCode: cat.template_code,
					color: cat.color
				});
			});
		});

		if (activeTab === 'ALL') {
			return allItems;
		}

		return allItems.filter((i) => i.categoryKey === activeTab);
	}, [categories, activeTab]);

	if (isLoading) {
		return (
			<WidgetCard
				title={instance.title ?? 'Bandeja de Órdenes Operativas'}
				subtitle="Tareas de manga y campo pendientes de registro y cierre"
			>
				<Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
					<CircularProgress size={24} />
					<Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
						Cargando órdenes operativas...
					</Typography>
				</Box>
			</WidgetCard>
		);
	}

	const totalPlannedHeads =
		(categories?.entry_orders?.total_planned_heads ?? 0) +
		(categories?.transfer_orders?.total_planned_heads ?? 0) +
		(categories?.weaning_orders?.total_planned_heads ?? 0) +
		(categories?.birth_orders?.total_planned_heads ?? 0);

	return (
		<WidgetCard
			title={instance.title ?? 'Bandeja de Órdenes Operativas'}
			subtitle="Tareas de manga y campo pendientes de registro y cierre"
			flush
			footnote={
				summary
					? `${counts.all} órdenes activas involucrando ${formatNumber(totalPlannedHeads)} cabezas de hacienda`
					: 'Sin órdenes activas'
			}
		>
			<OperationalOrdersTabs
				activeTab={activeTab}
				onSelectTab={setActiveTab}
				counts={counts}
			/>
			<OperationalOrdersTable items={displayedItems} />
		</WidgetCard>
	);
}
