import { Box, Button, Tab, Tabs } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DashboardBoard } from '../../types/dashboard.types';

interface BoardTabsProps {
	boards: DashboardBoard[];
	activeBoardId: string;
	disabled: boolean;
	onSelect: (id: string) => void;
	onCreate: () => void;
}

/** One tab per board. Tabs are locked while a board is being edited so drafts are never lost silently. */
export function BoardTabs({ boards, activeBoardId, disabled, onSelect, onCreate }: BoardTabsProps) {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, borderBottom: 1, borderColor: 'divider' }}>
			<Tabs
				value={activeBoardId}
				onChange={(_, id: string) => onSelect(id)}
				variant="scrollable"
				scrollButtons="auto"
				aria-label="Tableros"
				sx={{
					flex: '1 1 auto',
					minHeight: 48,
					'& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontSize: '0.875rem' }
				}}
			>
				{boards.map((board) => (
					<Tab
						key={board.id}
						value={board.id}
						disabled={disabled && board.id !== activeBoardId}
						iconPosition="start"
						icon={<FuseSvgIcon size={16}>{board.icon}</FuseSvgIcon>}
						label={board.name}
					/>
				))}
			</Tabs>
			<Button
				variant="outlined"
				size="small"
				disabled={disabled}
				onClick={onCreate}
				startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
				sx={{
					flexShrink: 0,
					textTransform: 'none',
					fontWeight: 600,
					borderStyle: 'dashed',
					borderRadius: '6px'
				}}
			>
				Nuevo tablero
			</Button>
		</Box>
	);
}

export default BoardTabs;
