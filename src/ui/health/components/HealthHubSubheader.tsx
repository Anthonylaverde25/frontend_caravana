import React from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export type HealthHubTabKey = 'pre-service' | 'protocols' | 'portal';

interface HealthHubSubheaderProps {
	activeTab: HealthHubTabKey;
	onTabChange: (tab: HealthHubTabKey) => void;
}

/**
 * Tab bar for Sanidad & Veterinaria Hub:
 * - "Pre-Servicio & Toros": Andrological & pre-service bull evaluation.
 * - "Protocolos Diagnósticos": Official evidentiary documents & lab reports.
 * - "Portales Veterinarios": External veterinarians access & workspaces.
 *
 * Adheres to canonical ItemsCategorySubheader / CalvesHubSubheader design tokens:
 * - Mounted in ViewLayout subHeader slot (flush with header divider).
 * - Transparent background, no pill container.
 * - #16a34a vibrant green indicator (3px height, rounded top).
 * - 44px height, clean typography.
 */
export default function HealthHubSubheader({ activeTab, onTabChange }: HealthHubSubheaderProps) {
	const handleChange = (_: React.SyntheticEvent, newValue: string) => {
		onTabChange(newValue as HealthHubTabKey);
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
				{/* Tab 1: Pre-Servicio & Toros */}
				<Tab
					value="pre-service"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:shield-check</FuseSvgIcon>
							<Typography
								component="span"
								sx={{ fontSize: '0.88rem', fontWeight: 'inherit', color: 'inherit' }}
							>
								Pre-Servicio & Toros
							</Typography>
						</Box>
					}
				/>

				{/* Tab 2: Protocolos Diagnósticos */}
				<Tab
					value="protocols"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:document-check</FuseSvgIcon>
							<Typography
								component="span"
								sx={{ fontSize: '0.88rem', fontWeight: 'inherit', color: 'inherit' }}
							>
								Protocolos Diagnósticos
							</Typography>
						</Box>
					}
				/>

				{/* Tab 3: Portales Veterinarios */}
				<Tab
					value="portal"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:users</FuseSvgIcon>
							<Typography
								component="span"
								sx={{ fontSize: '0.88rem', fontWeight: 'inherit', color: 'inherit' }}
							>
								Portales Veterinarios
							</Typography>
						</Box>
					}
				/>
			</Tabs>
		</Box>
	);
}
