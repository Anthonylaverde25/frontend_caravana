import React from 'react';
import { Tabs, Tab, Box, Badge } from '@mui/material';
import { OperationalCategoryKey } from '../../../types/operationalKpis.types';

interface OperationalOrdersTabsProps {
	activeTab: OperationalCategoryKey | 'ALL';
	onSelectTab: (tab: OperationalCategoryKey | 'ALL') => void;
	counts: {
		all: number;
		entry_orders: number;
		transfer_orders: number;
		weaning_orders: number;
		birth_orders: number;
	};
}

export function OperationalOrdersTabs({
	activeTab,
	onSelectTab,
	counts
}: OperationalOrdersTabsProps) {
	return (
		<Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
			<Tabs
				value={activeTab}
				onChange={(_, value) => onSelectTab(value)}
				variant="scrollable"
				scrollButtons="auto"
				sx={{
					minHeight: 40,
					'& .MuiTab-root': {
						minHeight: 40,
						py: 1,
						px: 1.75,
						fontSize: '0.8125rem',
						fontWeight: 600,
						textTransform: 'none'
					}
				}}
			>
				<Tab
					value="ALL"
					label={`Todas (${counts.all})`}
				/>
				<Tab
					value="entry_orders"
					label={`Entradas (${counts.entry_orders})`}
				/>
				<Tab
					value="transfer_orders"
					label={`Traslados (${counts.transfer_orders})`}
				/>
				<Tab
					value="weaning_orders"
					label={`Destetes (${counts.weaning_orders})`}
				/>
				<Tab
					value="birth_orders"
					label={`Parición (${counts.birth_orders})`}
				/>
			</Tabs>
		</Box>
	);
}
