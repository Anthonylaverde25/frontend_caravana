import React from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export type HerdHubTabKey = 'batches' | 'empty-batches' | 'production' | 'movements';

interface HerdHubSubheaderProps {
	activeTab: HerdHubTabKey;
	onTabChange: (tab: HerdHubTabKey) => void;
	stockedCount?: number;
	emptyCount?: number;
}

/**
 * Tab bar for Hacienda Propia Hub:
 * - "Lotes & Caravanas": Active herd batches with cattle, ear tags, and herd stock search.
 * - "Lotes Vacíos": Own batches currently holding 0 head (ready for allocation or pasture resting).
 * - "Planilla de Producción": Zootechnical production stages (Cría, Recría, Invernada).
 * - "Historial de Movimientos": Traceability ledger of all cattle transfers and entries.
 *
 * Adheres to canonical ItemsCategorySubheader / CalvesHubSubheader design tokens.
 */
export default function HerdHubSubheader({
	activeTab,
	onTabChange,
	stockedCount,
	emptyCount
}: HerdHubSubheaderProps) {
	const handleChange = (_: React.SyntheticEvent, newValue: string) => {
		onTabChange(newValue as HerdHubTabKey);
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
				{/* Tab 1: Lotes & Caravanas */}
				<Tab
					value="batches"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:rectangle-stack</FuseSvgIcon>
							<Typography
								component="span"
								sx={{ fontSize: '0.88rem', fontWeight: 'inherit', color: 'inherit' }}
							>
								Lotes & Caravanas
							</Typography>
							{typeof stockedCount === 'number' && (
								<Box
									component="span"
									sx={{
										px: 1,
										py: 0.1,
										borderRadius: '9999px',
										fontSize: '0.72rem',
										fontWeight: 700,
										bgcolor: (theme) =>
											activeTab === 'batches'
												? '#16a34a'
												: theme.palette.mode === 'dark'
													? 'rgba(255, 255, 255, 0.1)'
													: 'rgba(0, 0, 0, 0.08)',
										color: activeTab === 'batches' ? '#ffffff' : 'text.secondary',
										lineHeight: 1.5,
										display: 'inline-flex',
										alignItems: 'center',
										justifyContent: 'center'
									}}
								>
									{stockedCount}
								</Box>
							)}
						</Box>
					}
				/>

				{/* Tab 2: Lotes Vacíos */}
				<Tab
					value="empty-batches"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:inbox</FuseSvgIcon>
							<Typography
								component="span"
								sx={{ fontSize: '0.88rem', fontWeight: 'inherit', color: 'inherit' }}
							>
								Lotes Vacíos
							</Typography>
							{typeof emptyCount === 'number' && (
								<Box
									component="span"
									sx={{
										px: 1,
										py: 0.1,
										borderRadius: '9999px',
										fontSize: '0.72rem',
										fontWeight: 700,
										bgcolor: (theme) =>
											activeTab === 'empty-batches'
												? '#16a34a'
												: theme.palette.mode === 'dark'
													? 'rgba(255, 255, 255, 0.1)'
													: 'rgba(0, 0, 0, 0.08)',
										color: activeTab === 'empty-batches' ? '#ffffff' : 'text.secondary',
										lineHeight: 1.5,
										display: 'inline-flex',
										alignItems: 'center',
										justifyContent: 'center'
									}}
								>
									{emptyCount}
								</Box>
							)}
						</Box>
					}
				/>

				{/* Tab 3: Planilla de Producción */}
				<Tab
					value="production"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:clipboard-document-list</FuseSvgIcon>
							<Typography
								component="span"
								sx={{ fontSize: '0.88rem', fontWeight: 'inherit', color: 'inherit' }}
							>
								Planilla de Producción
							</Typography>
						</Box>
					}
				/>

				{/* Tab 3: Historial de Movimientos */}
				<Tab
					value="movements"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:arrow-path</FuseSvgIcon>
							<Typography
								component="span"
								sx={{ fontSize: '0.88rem', fontWeight: 'inherit', color: 'inherit' }}
							>
								Historial de Movimientos
							</Typography>
						</Box>
					}
				/>
			</Tabs>
		</Box>
	);
}
