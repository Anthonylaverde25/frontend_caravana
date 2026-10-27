import React from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DashboardBoard } from '../../types/dashboard.types';

interface BoardTabsProps {
	boards: DashboardBoard[];
	activeBoardId: string;
	disabled?: boolean;
	onSelect: (id: string) => void;
	onCreate?: () => void;
}

/**
 * Tab bar for switching between boards.
 * Implements the canonical tab navigation pattern from /items:
 * full-width subheader integration, vibrant green underline indicator,
 * and clean typography.
 */
export function BoardTabs({ boards, activeBoardId, disabled = false, onSelect }: BoardTabsProps) {
	const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
		onSelect(newValue);
	};

	return (
		<Box
			sx={{
				width: '100%',
				borderBottom: 1,
				borderColor: 'divider',
				mb: '-1px'
			}}
		>
			<Tabs
				value={activeBoardId}
				onChange={handleTabChange}
				variant="scrollable"
				scrollButtons="auto"
				allowScrollButtonsMobile
				sx={{
					minHeight: 44,
					width: '100% !important',
					backgroundColor: 'transparent !important',
					padding: '0 !important',
					borderRadius: '0 !important',
					boxShadow: 'none !important',
					'& .MuiTabs-scroller': {
						overflow: 'auto !important'
					},
					'& .MuiTabs-flexContainer': {
						gap: { xs: 1, sm: 3 }
					},
					// Explicitly override Fuse theme's pill indicator with bottom underline
					'& .MuiTabs-indicator': {
						top: 'auto !important',
						bottom: '0 !important',
						height: '3px !important',
						minHeight: '3px !important',
						maxHeight: '3px !important',
						backgroundColor: '#16a34a !important', // Vibrant green canonical tab indicator
						borderRadius: '3px 3px 0 0 !important',
						boxShadow: 'none !important',
						border: 'none !important',
						zIndex: 2
					},
					// Explicitly override Fuse theme's button-like Tab styles
					'& .MuiTab-root': {
						minHeight: '44px !important',
						minWidth: 'auto !important',
						py: '10px !important',
						px: { xs: '12px !important', sm: '16px !important' },
						borderRadius: '0 !important',
						backgroundColor: 'transparent !important',
						border: 'none !important',
						boxShadow: 'none !important',
						textTransform: 'none',
						fontSize: '0.9rem',
						fontWeight: '500 !important',
						color: (theme) => (theme.palette.mode === 'dark' ? '#94a3b8 !important' : '#64748b !important'),
						letterSpacing: '0.01em',
						transition: 'color 0.15s ease-in-out',
						display: 'inline-flex',
						flexDirection: 'row',
						alignItems: 'center',
						gap: 1,
						'&:hover': {
							color: (theme) => (theme.palette.mode === 'dark' ? '#f8fafc !important' : '#0f172a !important'),
							backgroundColor: 'transparent !important'
						},
						'&.Mui-selected': {
							color: (theme) => (theme.palette.mode === 'dark' ? '#ffffff !important' : '#0f172a !important'),
							fontWeight: '700 !important',
							backgroundColor: 'transparent !important'
						},
						'&.Mui-disabled': {
							opacity: 0.5
						}
					},
					// Reset icon spacing when icon is used
					'& .MuiTab-root.MuiTab-labelIcon': {
						minHeight: '44px !important'
					},
					'& .MuiTab-root > .MuiTab-iconWrapper': {
						marginRight: '8px !important',
						marginBottom: '0 !important'
					}
				}}
			>
				{boards.map((board) => (
					<Tab
						key={board.id}
						value={board.id}
						disabled={disabled && board.id !== activeBoardId}
						icon={board.icon ? <FuseSvgIcon size={18}>{board.icon}</FuseSvgIcon> : undefined}
						iconPosition="start"
						label={board.name}
					/>
				))}
			</Tabs>
		</Box>
	);
}

export default BoardTabs;
