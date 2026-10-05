import React from 'react';
import {
	Box,
	Paper,
	Stack,
	TextField,
	InputAdornment,
	Chip,
	Button,
	Typography,
	ToggleButtonGroup,
	ToggleButton,
	Tooltip,
	FormControlLabel,
	Switch
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link } from 'react-router';
import { ZOOTECHNICAL_STAGES } from '../../data/zootechnicalLibraryData';

interface TemplateGalleryHeaderProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	selectedStage: string;
	onStageChange: (stage: string) => void;
	showArchived: boolean;
	onToggleArchived: (show: boolean) => void;
	viewMode: 'gallery' | 'table';
	onViewModeChange: (mode: 'gallery' | 'table') => void;
	totalCount: number;
	activeCount: number;
}

export const TemplateGalleryHeader: React.FC<TemplateGalleryHeaderProps> = ({
	searchQuery,
	onSearchChange,
	selectedStage,
	onStageChange,
	showArchived,
	onToggleArchived,
	viewMode,
	onViewModeChange,
	totalCount,
	activeCount
}) => {
	return (
		<Paper
			elevation={0}
			sx={{
				p: { xs: 2, sm: 2.5 },
				mb: 3,
				borderRadius: '12px',
				border: '1px solid',
				borderColor: 'divider',
				bgcolor: 'background.paper',
				boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
			}}
		>
			{/* Top Bar: Title info, Global actions & View Switcher */}
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				spacing={2}
				alignItems={{ xs: 'stretch', md: 'center' }}
				justifyContent="space-between"
				sx={{ mb: 2.5 }}
			>
				<Box>
					<Stack direction="row" spacing={1.5} alignItems="center">
						<Box
							sx={{
								width: 38,
								height: 38,
								borderRadius: '8px',
								bgcolor: 'primary.lighter',
								color: 'primary.main',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
							<FuseSvgIcon size={22}>heroicons-outline:book-open</FuseSvgIcon>
						</Box>
						<Box>
							<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
								Galería de Planillas Imprimibles A4
							</Typography>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
								Vista previa de documentos oficiales de manga y fundamentos zootécnicos ({activeCount} activas de {totalCount} registradas)
							</Typography>
						</Box>
					</Stack>
				</Box>

				<Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
					{/* Toggle Show Archived */}
					<FormControlLabel
						control={
							<Switch
								size="small"
								checked={showArchived}
								onChange={(e) => onToggleArchived(e.target.checked)}
								color="primary"
							/>
						}
						label={
							<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
								Mostrar Archivadas
							</Typography>
						}
						sx={{ mr: 1 }}
					/>

					{/* View Switcher (Gallery vs Table) */}
					<ToggleButtonGroup
						value={viewMode}
						exclusive
						onChange={(_, newMode) => newMode && onViewModeChange(newMode)}
						size="small"
						sx={{
							bgcolor: 'action.hover',
							borderRadius: '8px',
							'& .MuiToggleButton-root': {
								border: 'none',
								px: 1.5,
								py: 0.5,
								borderRadius: '6px',
								fontWeight: 700,
								textTransform: 'none',
								'&.Mui-selected': {
									bgcolor: 'background.paper',
									boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
								}
							}
						}}
					>
						<ToggleButton value="gallery">
							<Stack direction="row" spacing={0.75} alignItems="center">
								<FuseSvgIcon size={16}>heroicons-outline:document-duplicate</FuseSvgIcon>
								<Typography variant="caption">Hojas A4</Typography>
							</Stack>
						</ToggleButton>
						<ToggleButton value="table">
							<Stack direction="row" spacing={0.75} alignItems="center">
								<FuseSvgIcon size={16}>heroicons-outline:table-cells</FuseSvgIcon>
								<Typography variant="caption">Tabla</Typography>
							</Stack>
						</ToggleButton>
					</ToggleButtonGroup>

					{/* Fast Action: Go to Scan */}
					<Button
						variant="outlined"
						component={Link}
						to="/work-templates/scan"
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:camera</FuseSvgIcon>}
						sx={{
							borderColor: '#6366f1',
							color: '#6366f1',
							borderRadius: '8px',
							fontWeight: 700,
							textTransform: 'none',
							px: 2,
							'&:hover': { bgcolor: '#f5f3ff', borderColor: '#4f46e5' }
						}}
					>
						Escanear Planilla
					</Button>
				</Stack>
			</Stack>

			{/* Search Input Bar */}
			<TextField
				fullWidth
				size="small"
				value={searchQuery}
				onChange={(e) => onSearchChange(e.target.value)}
				placeholder="Buscar por código (ej: TOR-01, DEST-01), nombre o concepto zootécnico (ej: tacto, andrología, destete)..."
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<FuseSvgIcon size={20} sx={{ color: 'text.secondary' }}>
								heroicons-outline:magnifying-glass
							</FuseSvgIcon>
						</InputAdornment>
					),
					endAdornment: searchQuery ? (
						<InputAdornment position="end">
							<Tooltip title="Limpiar búsqueda">
								<Box
									component="button"
									onClick={() => onSearchChange('')}
									sx={{
										border: 'none',
										bgcolor: 'transparent',
										cursor: 'pointer',
										display: 'flex',
										p: 0.5,
										color: 'text.secondary',
										'&:hover': { color: 'text.primary' }
									}}
								>
									<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
								</Box>
							</Tooltip>
						</InputAdornment>
					) : null,
					sx: {
						borderRadius: '8px',
						bgcolor: 'action.hover',
						'& fieldset': { border: 'none' }
					}
				}}
				sx={{ mb: 2 }}
			/>

			{/* Biological Stage Filter Chips */}
			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
				sx={{
					overflowX: 'auto',
					pb: 0.5,
					'&::-webkit-scrollbar': { height: 4 },
					'&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 4 }
				}}
			>
				{ZOOTECHNICAL_STAGES.map((stage) => {
					const isSelected = selectedStage === stage.key;
					return (
						<Chip
							key={stage.key}
							icon={
								<FuseSvgIcon size={16} sx={{ color: isSelected ? 'inherit !important' : `${stage.color} !important` }}>
									{stage.icon}
								</FuseSvgIcon>
							}
							label={stage.label}
							clickable
							onClick={() => onStageChange(stage.key)}
							sx={{
								fontWeight: isSelected ? 800 : 600,
								fontSize: '0.78rem',
								height: 32,
								px: 0.5,
								borderRadius: '8px',
								transition: 'all 0.2s',
								bgcolor: isSelected ? 'primary.main' : 'action.hover',
								color: isSelected ? 'primary.contrastText' : 'text.primary',
								border: '1px solid',
								borderColor: isSelected ? 'primary.main' : 'transparent',
								'&:hover': {
									bgcolor: isSelected ? 'primary.dark' : 'action.selected'
								}
							}}
						/>
					);
				})}
			</Stack>
		</Paper>
	);
};

export default TemplateGalleryHeader;
