import React from 'react';
import {
	Box,
	Grid,
	Skeleton,
	Paper,
	Typography,
	Button,
	Stack
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { WorkTemplate } from '../../types/TemplateModels';
import TemplateGalleryCard from './TemplateGalleryCard';

interface TemplateGalleryGridProps {
	templates: WorkTemplate[];
	isLoading: boolean;
	onOpenDetail: (template: WorkTemplate) => void;
	onResetFilters: () => void;
}

export const TemplateGalleryGrid: React.FC<TemplateGalleryGridProps> = ({
	templates,
	isLoading,
	onOpenDetail,
	onResetFilters
}) => {
	if (isLoading) {
		return (
			<Grid container spacing={3}>
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
						<Paper
							elevation={0}
							sx={{
								p: 2.5,
								height: 380,
								borderRadius: '12px',
								border: '1px solid',
								borderColor: 'divider',
								display: 'flex',
								flexDirection: 'column',
								gap: 2
							}}
						>
							<Stack direction="row" spacing={1} justifyContent="space-between">
								<Skeleton variant="rounded" width={80} height={26} />
								<Skeleton variant="rounded" width={110} height={24} />
							</Stack>
							<Skeleton variant="text" width="85%" height={32} />
							<Skeleton variant="text" width="60%" height={20} />
							<Skeleton variant="rounded" width="100%" height={110} sx={{ my: 1 }} />
							<Skeleton variant="text" width="40%" height={20} />
							<Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
								<Skeleton variant="rounded" width="50%" height={34} />
								<Skeleton variant="rounded" width="50%" height={34} />
							</Stack>
						</Paper>
					</Grid>
				))}
			</Grid>
		);
	}

	if (templates.length === 0) {
		return (
			<Paper
				elevation={0}
				sx={{
					p: 6,
					textAlign: 'center',
					borderRadius: '12px',
					border: '1px dashed',
					borderColor: 'divider',
					bgcolor: 'background.paper'
				}}
			>
				<Box
					sx={{
						width: 56,
						height: 56,
						borderRadius: '50%',
						bgcolor: 'action.hover',
						color: 'text.secondary',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						mx: 'auto',
						mb: 2
					}}
				>
					<FuseSvgIcon size={28}>heroicons-outline:magnifying-glass</FuseSvgIcon>
				</Box>
				<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
					No se encontraron plantillas
				</Typography>
				<Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 440, mx: 'auto', mb: 2.5 }}>
					No existen plantillas zootécnicas que coincidan con los criterios de búsqueda o el ciclo biológico seleccionado.
				</Typography>
				<Button
					variant="outlined"
					size="small"
					onClick={onResetFilters}
					startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-path</FuseSvgIcon>}
					sx={{ borderRadius: '6px', fontWeight: 700, textTransform: 'none' }}
				>
					Restablecer Filtros
				</Button>
			</Paper>
		);
	}

	return (
		<Grid container spacing={3}>
			{templates.map((template) => (
				<Grid size={{ xs: 12, md: 6, lg: 4 }} key={template.code}>
					<TemplateGalleryCard
						template={template}
						onOpenDetail={onOpenDetail}
					/>
				</Grid>
			))}
		</Grid>
	);
};

export default TemplateGalleryGrid;
