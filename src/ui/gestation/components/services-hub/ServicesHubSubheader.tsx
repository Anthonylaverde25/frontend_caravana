import React from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export type ServicesHubTabKey = 'conventional' | 'insemination' | 'history';

interface ServicesHubSubheaderProps {
	activeTab: ServicesHubTabKey;
	onTabChange: (tab: ServicesHubTabKey) => void;
	conventionalCount: number;
	inseminationCount: number;
	historyCount: number;
}

/**
 * Tab bar of /gestation/services: "Convencionales", "Inseminación", and "Historial".
 * Follows the canonical ItemsCategorySubheader design token standard:
 * - Transparent background, no pill container
 * - #16a34a vibrant green indicator (3px height, rounded top)
 * - 44px height, clean typography, reactive badge counters
 */
export default function ServicesHubSubheader({
	activeTab,
	onTabChange,
	conventionalCount,
	inseminationCount,
	historyCount
}: ServicesHubSubheaderProps) {
	const handleChange = (_: React.SyntheticEvent, newValue: string) => {
		onTabChange(newValue as ServicesHubTabKey);
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
				value={activeTab}
				onChange={handleChange}
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
					// Explicitly override Fuse theme's pill indicator with canonical vibrant green
					'& .MuiTabs-indicator': {
						top: 'auto !important',
						bottom: '0 !important',
						height: '3px !important',
						minHeight: '3px !important',
						maxHeight: '3px !important',
						backgroundColor: '#16a34a !important',
						borderRadius: '3px 3px 0 0 !important',
						boxShadow: 'none !important',
						border: 'none !important',
						zIndex: 2
					},
					// Tab button typography & hover transitions
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
						'&:hover': {
							color: (theme) => (theme.palette.mode === 'dark' ? '#f8fafc !important' : '#0f172a !important'),
							backgroundColor: 'transparent !important'
						},
						'&.Mui-selected': {
							color: (theme) => (theme.palette.mode === 'dark' ? '#ffffff !important' : '#0f172a !important'),
							fontWeight: '700 !important',
							backgroundColor: 'transparent !important'
						}
					}
				}}
			>
				{/* Tab 1: Convencionales (Default) */}
				<Tab
					value="conventional"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:user-group</FuseSvgIcon>
							<Typography
								component="span"
								sx={{
									fontSize: 'inherit',
									fontWeight: 'inherit',
									color: 'inherit'
								}}
							>
								Convencionales
							</Typography>
							{conventionalCount > 0 && (
								<Box
									component="span"
									sx={{
										px: 1,
										py: 0.1,
										borderRadius: '9999px',
										fontSize: '0.72rem',
										fontWeight: 700,
										bgcolor: (theme) =>
											activeTab === 'conventional'
												? '#16a34a'
												: theme.palette.mode === 'dark'
													? 'rgba(255, 255, 255, 0.1)'
													: 'rgba(0, 0, 0, 0.08)',
										color: activeTab === 'conventional' ? '#ffffff' : 'text.secondary',
										lineHeight: 1.5,
										display: 'inline-flex',
										alignItems: 'center',
										justifyContent: 'center'
									}}
								>
									{conventionalCount}
								</Box>
							)}
						</Box>
					}
				/>

				{/* Tab 2: Inseminación */}
				<Tab
					value="insemination"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:beaker</FuseSvgIcon>
							<Typography
								component="span"
								sx={{
									fontSize: 'inherit',
									fontWeight: 'inherit',
									color: 'inherit'
								}}
							>
								Inseminación
							</Typography>
							{inseminationCount > 0 && (
								<Box
									component="span"
									sx={{
										px: 1,
										py: 0.1,
										borderRadius: '9999px',
										fontSize: '0.72rem',
										fontWeight: 700,
										bgcolor: (theme) =>
											activeTab === 'insemination'
												? '#16a34a'
												: theme.palette.mode === 'dark'
													? 'rgba(255, 255, 255, 0.1)'
													: 'rgba(0, 0, 0, 0.08)',
										color: activeTab === 'insemination' ? '#ffffff' : 'text.secondary',
										lineHeight: 1.5,
										display: 'inline-flex',
										alignItems: 'center',
										justifyContent: 'center'
									}}
								>
									{inseminationCount}
								</Box>
							)}
						</Box>
					}
				/>

				{/* Tab 3: Historial */}
				<Tab
					value="history"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:archive-box</FuseSvgIcon>
							<Typography
								component="span"
								sx={{
									fontSize: 'inherit',
									fontWeight: 'inherit',
									color: 'inherit'
								}}
							>
								Historial
							</Typography>
							{historyCount > 0 && (
								<Box
									component="span"
									sx={{
										px: 1,
										py: 0.1,
										borderRadius: '9999px',
										fontSize: '0.72rem',
										fontWeight: 700,
										bgcolor: (theme) =>
											activeTab === 'history'
												? '#16a34a'
												: theme.palette.mode === 'dark'
													? 'rgba(255, 255, 255, 0.1)'
													: 'rgba(0, 0, 0, 0.08)',
										color: activeTab === 'history' ? '#ffffff' : 'text.secondary',
										lineHeight: 1.5,
										display: 'inline-flex',
										alignItems: 'center',
										justifyContent: 'center'
									}}
								>
									{historyCount}
								</Box>
							)}
						</Box>
					}
				/>
			</Tabs>
		</Box>
	);
}
