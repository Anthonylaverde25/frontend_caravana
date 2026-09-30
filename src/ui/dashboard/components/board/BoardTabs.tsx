import { Box, Button, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DashboardBoard } from '../../types/dashboard.types';

interface BoardTabsProps {
	boards: DashboardBoard[];
	activeBoardId: string;
	disabled: boolean;
	onSelect: (id: string) => void;
	onCreate: () => void;
}

/**
 * Segmented button bar for switching between boards.
 * Replaces legacy tab underlines with canonical design tokens:
 * active contained primary button, subtle interactive text buttons, and dashed new-board trigger.
 */
export function BoardTabs({ boards, activeBoardId, disabled, onSelect, onCreate }: BoardTabsProps) {
	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: 1.5,
				flexWrap: 'wrap',
				py: 0.5
			}}
		>
			{/* Segmented Button Bar */}
			<Stack
				direction="row"
				spacing={0.75}
				sx={{
					p: 0.5,
					bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC'),
					border: '1px solid',
					borderColor: 'divider',
					borderRadius: '10px',
					overflowX: 'auto',
					maxWidth: '100%'
				}}
			>
				{boards.map((board) => {
					const isActive = board.id === activeBoardId;

					return (
						<Button
							key={board.id}
							disabled={disabled && !isActive}
							onClick={() => onSelect(board.id)}
							variant={isActive ? 'contained' : 'text'}
							color={isActive ? 'primary' : 'inherit'}
							startIcon={<FuseSvgIcon size={18}>{board.icon}</FuseSvgIcon>}
							sx={{
								px: 2,
								py: 0.75,
								borderRadius: '8px',
								textTransform: 'none',
								fontWeight: isActive ? 700 : 600,
								fontSize: '0.875rem',
								whiteSpace: 'nowrap',
								color: isActive ? 'primary.contrastText' : 'text.secondary',
								bgcolor: isActive ? 'primary.main' : 'transparent',
								boxShadow: isActive ? 1 : 'none',
								transition: 'all 140ms ease',
								'&:hover': {
									bgcolor: isActive ? 'primary.dark' : 'action.hover',
									color: isActive ? 'primary.contrastText' : 'text.primary'
								}
							}}
						>
							{board.name}
						</Button>
					);
				})}
			</Stack>

			{/* New Board Action Button */}
			<Button
				variant="outlined"
				disabled={disabled}
				onClick={onCreate}
				startIcon={<FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon>}
				sx={{
					px: 2,
					py: 0.75,
					borderRadius: '8px',
					textTransform: 'none',
					fontWeight: 600,
					fontSize: '0.875rem',
					borderStyle: 'dashed',
					borderColor: 'primary.main',
					color: 'primary.main',
					whiteSpace: 'nowrap',
					'&:hover': {
						borderStyle: 'dashed',
						borderColor: 'primary.dark',
						bgcolor: 'action.hover'
					}
				}}
			>
				Nuevo tablero
			</Button>
		</Box>
	);
}

export default BoardTabs;
