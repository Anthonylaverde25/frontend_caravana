import React from 'react';
import { Badge, Tab, Tabs } from '@mui/material';
import { SelectedBatchState } from '../types';

interface LotTabsProps {
	lots: SelectedBatchState[];
	value: number;
	onChange: (batchId: number) => void;
	/** Batches that still need something, or that the server objected to. */
	flagged?: (batchId: number) => boolean;
}

/** One tab per batch of the sheet, when what follows is declared batch by batch. */
export const LotTabs: React.FC<LotTabsProps> = ({ lots, value, onChange, flagged }) => (
	<Tabs
		value={value}
		onChange={(_, batchId: number) => onChange(batchId)}
		variant="scrollable"
		scrollButtons="auto"
		sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 40 }}
	>
		{lots.map((lot) => (
			<Tab
				key={lot.batchId}
				value={lot.batchId}
				label={
					<Badge
						color="warning"
						variant="dot"
						invisible={!flagged?.(lot.batchId)}
						sx={{ pr: 1 }}
					>
						{lot.batchName}
					</Badge>
				}
				sx={{ textTransform: 'none', fontWeight: 700, minHeight: 40 }}
			/>
		))}
	</Tabs>
);

export default LotTabs;
