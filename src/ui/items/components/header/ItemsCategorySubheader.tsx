import React, { useState } from 'react';
import { Box, Tab, Tabs, Menu, MenuItem, ListItemText, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ItemCategory } from '@/core/items/domain/entities/ItemCategory';
import { ResolvedTab } from './itemTabs';

interface ItemsCategorySubheaderProps {
	resolved: { featured: ResolvedTab[]; others: ItemCategory[] };
	/** 'all', a featured key, or 'other'. */
	activeTabKey: string;
	activeOtherId: number | null;
	onSelectTab: (key: string) => void;
	onSelectOther: (id: number) => void;
}

/** The catalog's tabs; the active one comes from the URL (semen S-A, DA1). */
export default function ItemsCategorySubheader({ resolved, activeTabKey, activeOtherId, onSelectTab, onSelectOther }: ItemsCategorySubheaderProps) {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const resolvedFeatured = resolved.featured;
	const otherRootCategories = resolved.others;
	const activeRootCat = otherRootCategories.find((c) => c.id === activeOtherId) ?? null;
	const isOtherActive = activeTabKey === 'other';
	const selectedOtherLabel = isOtherActive && activeRootCat ? activeRootCat.name : null;

	const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
		if (newValue !== 'other') onSelectTab(newValue);
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
				value={activeTabKey}
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
					// Explicitly override Fuse theme's pill indicator
					'& .MuiTabs-indicator': {
						top: 'auto !important',
						bottom: '0 !important',
						height: '3px !important',
						minHeight: '3px !important',
						maxHeight: '3px !important',
						backgroundColor: '#16a34a !important', // Vibrant green from user screenshot
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
				<Tab value="all" label="Todos" />

				{resolvedFeatured.map((tab) => (
					<Tab key={tab.key} value={tab.key} label={tab.label} />
				))}

				{otherRootCategories.length > 0 && (
					<Tab
						value="other"
						label={
							<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
								<Typography
									component="span"
									sx={{
										fontSize: 'inherit',
										fontWeight: isOtherActive ? 700 : 500,
										color: 'inherit'
									}}
								>
									{selectedOtherLabel ? `Otras: ${selectedOtherLabel}` : 'Otras categorías'}
								</Typography>
								<FuseSvgIcon size={16}>heroicons-mini:chevron-down</FuseSvgIcon>
							</Box>
						}
						onClick={(e) => setAnchorEl(e.currentTarget)}
					/>
				)}
			</Tabs>

			{/* Dropdown Menu for Other Categories */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => setAnchorEl(null)}
				PaperProps={{
					sx: {
						mt: 0.5,
						minWidth: 220,
						boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
						borderRadius: '8px'
					}
				}}
			>
				{otherRootCategories.map((cat) => (
					<MenuItem
						key={cat.id}
						selected={activeRootCat?.id === cat.id}
						onClick={() => {
							onSelectOther(cat.id);
							setAnchorEl(null);
						}}
						sx={{ py: 1 }}
					>
						<ListItemText
							primary={cat.name}
							primaryTypographyProps={{
								fontSize: '0.875rem',
								fontWeight: activeRootCat?.id === cat.id ? 700 : 500
							}}
						/>
					</MenuItem>
				))}
			</Menu>
		</Box>
	);
}
