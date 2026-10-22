import { Box, Chip, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { CategoryNode } from '@/core/items/domain/rules/categoryTree';

interface ItemsSubcategoryChipsProps {
	subcategories: CategoryNode[];
	parentName: string;
	activeSubcategoryId: number | '';
	onSelectSubcategory: (id: number | '') => void;
}

export default function ItemsSubcategoryChips({
	subcategories,
	parentName,
	activeSubcategoryId,
	onSelectSubcategory
}: ItemsSubcategoryChipsProps) {
	if (!subcategories || subcategories.length === 0) {
		return null;
	}

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 1.5,
				py: 0.75,
				px: 1.5,
				bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'),
				borderRadius: '8px',
				border: 1,
				borderColor: 'divider',
				overflowX: 'auto',
				'&::-webkit-scrollbar': { height: 4 },
				'&::-webkit-scrollbar-thumb': { backgroundColor: 'divider', borderRadius: 2 }
			}}
		>
			<Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0, color: 'text.secondary' }}>
				<FuseSvgIcon size={16}>heroicons-outline:funnel</FuseSvgIcon>
				<Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
					Subcategoría:
				</Typography>
			</Stack>

			<Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
				<Chip
					size="small"
					label={`Todas (${parentName})`}
					clickable
					color={activeSubcategoryId === '' ? 'primary' : 'default'}
					variant={activeSubcategoryId === '' ? 'filled' : 'outlined'}
					onClick={() => onSelectSubcategory('')}
					sx={{
						fontWeight: activeSubcategoryId === '' ? 700 : 500,
						fontSize: '0.75rem',
						cursor: 'pointer',
						transition: 'all 0.15s ease'
					}}
				/>

				{subcategories.map((sub) => {
					const isSelected = activeSubcategoryId === sub.id;
					return (
						<Chip
							key={sub.id}
							size="small"
							label={sub.name}
							clickable
							color={isSelected ? 'primary' : 'default'}
							variant={isSelected ? 'filled' : 'outlined'}
							onClick={() => onSelectSubcategory(sub.id)}
							sx={{
								fontWeight: isSelected ? 700 : 500,
								fontSize: '0.75rem',
								cursor: 'pointer',
								transition: 'all 0.15s ease'
							}}
						/>
					);
				})}
			</Stack>
		</Box>
	);
}
