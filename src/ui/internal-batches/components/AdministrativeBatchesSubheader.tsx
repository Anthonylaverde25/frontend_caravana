import React from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

export type AdministrativeBatchesTabKey = 'consumption' | 'death' | 'exit' | 'quarantine' | 'reserve' | 'assignment';

interface AdministrativeBatchesSubheaderProps {
	activeTab: AdministrativeBatchesTabKey;
	onTabChange: (tab: AdministrativeBatchesTabKey) => void;
}

/**
 * Tab bar for Lotes Administrativos Hub:
 * - "Consumo Interno": Cattle allocated for internal consumption.
 * - "Muertes / Bajas": Mortality and loss records.
 * - "Egresos": Structural exits not linked to standard trade orders.
 * - "Cuarentena": Sanitary isolation batches.
 * - "Reserva": Animal reserve and apartados with pedigree and consanguinity tracking.
 *
 * Adheres to canonical ItemsCategorySubheader / CalvesHubSubheader design tokens.
 */
export default function AdministrativeBatchesSubheader({ activeTab, onTabChange }: AdministrativeBatchesSubheaderProps) {
	const handleChange = (_: React.SyntheticEvent, newValue: string) => {
		onTabChange(newValue as AdministrativeBatchesTabKey);
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
				{/* Tab 1: Consumo */}
				<Tab
					value="consumption"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:fire</FuseSvgIcon>
							<Typography
								component="span"
								sx={{ fontSize: '0.88rem', fontWeight: 'inherit', color: 'inherit' }}
							>
								Consumo Interno
							</Typography>
						</Box>
					}
				/>

				{/* Tab 2: Muertes */}
				<Tab
					value="death"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:x-circle</FuseSvgIcon>
							<Typography
								component="span"
								sx={{ fontSize: '0.88rem', fontWeight: 'inherit', color: 'inherit' }}
							>
								Muertes / Bajas
							</Typography>
						</Box>
					}
				/>

				{/* Tab 3: Egresos */}
				<Tab
					value="exit"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:arrow-up-on-square</FuseSvgIcon>
							<Typography
								component="span"
								sx={{ fontSize: '0.88rem', fontWeight: 'inherit', color: 'inherit' }}
							>
								Lote Egresos
							</Typography>
						</Box>
					}
				/>

				{/* Tab 4: Cuarentena */}
				<Tab
					value="quarantine"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:shield-exclamation</FuseSvgIcon>
							<Typography
								component="span"
								sx={{ fontSize: '0.88rem', fontWeight: 'inherit', color: 'inherit' }}
							>
								Cuarentena
							</Typography>
						</Box>
					}
				/>

				{/* Tab 5: Reserva */}
				<Tab
					value="reserve"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:archive-box</FuseSvgIcon>
							<Typography
								component="span"
								sx={{ fontSize: '0.88rem', fontWeight: 'inherit', color: 'inherit' }}
							>
								Lote Reserva
							</Typography>
						</Box>
					}
				/>

				{/* Tab 6: Asignar a Lote Propio */}
				<Tab
					value="assignment"
					label={
						<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
							<FuseSvgIcon size={18}>heroicons-outline:arrow-right-start-on-rectangle</FuseSvgIcon>
							<Typography
								component="span"
								sx={{ fontSize: '0.88rem', fontWeight: 'inherit', color: 'inherit' }}
							>
								Asignar a Lote Propio
							</Typography>
						</Box>
					}
				/>
			</Tabs>
		</Box>
	);
}
