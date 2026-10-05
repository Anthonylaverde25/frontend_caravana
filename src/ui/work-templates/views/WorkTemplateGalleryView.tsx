import React, { useMemo, useState, useCallback } from 'react';
import {
	Box,
	Typography,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper,
	Chip,
	Stack,
	Button,
	IconButton,
	Tooltip
} from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link } from 'react-router';
import { useTemplateData } from '../hooks/useTemplateData';
import { WorkTemplate } from '../types/TemplateModels';
import { ZOOTECHNICAL_CATALOG } from '../data/zootechnicalLibraryData';
import TemplateGalleryHeader from '../components/gallery/TemplateGalleryHeader';
import TemplateGalleryGrid from '../components/gallery/TemplateGalleryGrid';
import TemplateQuickDetailModal from '../components/gallery/TemplateQuickDetailModal';

export const WorkTemplateGalleryView: React.FC = () => {
	const { templates: rawTemplates, isLoading, error, refresh } = useTemplateData();

	// Deduplicate templates by unique code (handles multi-tenant/multi-company DB seeds)
	const uniqueTemplates = useMemo(() => {
		const map = new Map<string, WorkTemplate>();
		rawTemplates.forEach((t) => {
			if (!map.has(t.code)) {
				map.set(t.code, t);
			}
		});
		return Array.from(map.values());
	}, [rawTemplates]);

	// Filter & search states
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedStage, setSelectedStage] = useState('all');
	const [showArchived, setShowArchived] = useState(false);
	const [viewMode, setViewMode] = useState<'gallery' | 'table'>('gallery');
	const [detailTemplate, setDetailTemplate] = useState<WorkTemplate | null>(null);

	// Filtered templates list
	const filteredTemplates = useMemo(() => {
		return uniqueTemplates.filter((t) => {
			const meta = ZOOTECHNICAL_CATALOG[t.code];
			const isArchived = t.status === 'archived' || meta?.isArchived;

			// Archived filter
			if (!showArchived && isArchived) return false;

			// Biological stage filter
			if (selectedStage !== 'all' && meta?.stageKey !== selectedStage) {
				return false;
			}

			// Free text search filter
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase().trim();
				const codeMatch = t.code.toLowerCase().includes(query);
				const titleMatch = t.title.toLowerCase().includes(query);
				const descMatch = (t.description || '').toLowerCase().includes(query);
				const summaryMatch = (meta?.zootechnicalSummary || '').toLowerCase().includes(query);
				const objectiveMatch = (meta?.biologicalObjective || '').toLowerCase().includes(query);
				const stageMatch = (meta?.stageName || '').toLowerCase().includes(query);
				const metricsMatch = (meta?.fieldMetrics || []).some(
					(m) => m.label.toLowerCase().includes(query) || (m.hint || '').toLowerCase().includes(query)
				);

				return codeMatch || titleMatch || descMatch || summaryMatch || objectiveMatch || stageMatch || metricsMatch;
			}

			return true;
		});
	}, [uniqueTemplates, searchQuery, selectedStage, showArchived]);

	const totalCount = uniqueTemplates.length;
	const activeCount = useMemo(
		() => uniqueTemplates.filter((t) => t.status !== 'archived' && !ZOOTECHNICAL_CATALOG[t.code]?.isArchived).length,
		[uniqueTemplates]
	);

	const handleResetFilters = useCallback(() => {
		setSearchQuery('');
		setSelectedStage('all');
		setShowArchived(false);
	}, []);

	if (error) {
		return (
			<ViewLayout title="Galería de Plantillas de Trabajo">
				<Box className="p-32 text-center border rounded-8 bg-error-50 border-error">
					<Typography variant="h6" color="error">
						Error de sincronización con la base de datos
					</Typography>
					<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
						{error}
					</Typography>
					<Button
						variant="outlined"
						size="small"
						onClick={refresh}
						startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrow-path</FuseSvgIcon>}
						sx={{ mt: 2 }}
					>
						Reintentar Conexión
					</Button>
				</Box>
			</ViewLayout>
		);
	}

	return (
		<ViewLayout
			title="Galería de Planillas Imprimibles"
			subtitle="Vista previa de documentos de manga en formato A4 listos para imprimir y sus fundamentos zootécnicos."
			actions={
				<Stack direction="row" spacing={1.5}>
					<Button
						variant="contained"
						component={Link}
						to="/work-templates/scan"
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:camera</FuseSvgIcon>}
						sx={{
							bgcolor: '#6366f1',
							borderRadius: '8px',
							px: 2.5,
							fontWeight: 700,
							textTransform: 'none',
							boxShadow: 'none',
							'&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' }
						}}
					>
						Escanear con AI
					</Button>
				</Stack>
			}
		>
			<Box className="w-full">
				{/* Gallery Header with search & stage filter chips */}
				<TemplateGalleryHeader
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					selectedStage={selectedStage}
					onStageChange={setSelectedStage}
					showArchived={showArchived}
					onToggleArchived={setShowArchived}
					viewMode={viewMode}
					onViewModeChange={setViewMode}
					totalCount={totalCount}
					activeCount={activeCount}
				/>

				{/* Content: Gallery Card Grid or Compact Table */}
				{viewMode === 'gallery' ? (
					<TemplateGalleryGrid
						templates={filteredTemplates}
						isLoading={isLoading}
						onOpenDetail={(tmpl) => setDetailTemplate(tmpl)}
						onResetFilters={handleResetFilters}
					/>
				) : (
					<Paper
						elevation={0}
						sx={{
							borderRadius: '12px',
							border: '1px solid',
							borderColor: 'divider',
							overflow: 'hidden'
						}}
					>
						<Table size="small">
							<TableHead sx={{ bgcolor: 'action.hover' }}>
								<TableRow>
									<TableCell sx={{ fontWeight: 800, width: 110 }}>Código</TableCell>
									<TableCell sx={{ fontWeight: 800, width: 220 }}>Nombre del Proceso</TableCell>
									<TableCell sx={{ fontWeight: 800, width: 180 }}>Fase Zootécnica</TableCell>
									<TableCell sx={{ fontWeight: 800 }}>Fundamento Zootécnico</TableCell>
									<TableCell sx={{ fontWeight: 800, width: 90, textAlign: 'center' }}>Estado</TableCell>
									<TableCell sx={{ fontWeight: 800, width: 160, textAlign: 'right' }}>Acciones</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{filteredTemplates.map((template) => {
									const meta = ZOOTECHNICAL_CATALOG[template.code];
									const isArchived = template.status === 'archived' || meta?.isArchived;

									return (
										<TableRow
											key={template.code}
											hover
											sx={{
												opacity: isArchived ? 0.7 : 1,
												cursor: 'pointer'
											}}
											onClick={() => setDetailTemplate(template)}
										>
											<TableCell>
												<Box
													sx={{
														px: 1,
														py: 0.25,
														borderRadius: '4px',
														bgcolor: 'grey.900',
														color: 'white',
														fontFamily: 'monospace',
														fontWeight: 800,
														fontSize: '0.75rem',
														display: 'inline-block'
													}}
												>
													{template.code}
												</Box>
											</TableCell>
											<TableCell>
												<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.82rem' }}>
													{template.title}
												</Typography>
												<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
													{meta?.orderContext}
												</Typography>
											</TableCell>
											<TableCell>
												{meta && (
													<Chip
														icon={<FuseSvgIcon size={14} sx={{ color: `${meta.stageColor} !important` }}>{meta.stageIcon}</FuseSvgIcon>}
														label={meta.stageName}
														size="small"
														sx={{
															fontWeight: 700,
															fontSize: '0.7rem',
															height: 22,
															bgcolor: meta.stageBadgeBg,
															color: meta.stageColor
														}}
													/>
												)}
											</TableCell>
											<TableCell>
												<Typography variant="body2" sx={{ fontSize: '0.78rem', color: 'text.primary', lineHeight: 1.4 }}>
													{meta?.zootechnicalSummary || template.description}
												</Typography>
											</TableCell>
											<TableCell sx={{ textAlign: 'center' }}>
												<Chip
													label={isArchived ? 'ARCHIVADA' : 'ACTIVA'}
													size="small"
													color={isArchived ? 'default' : 'success'}
													sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }}
												/>
											</TableCell>
											<TableCell sx={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
												<Stack direction="row" spacing={0.5} justifyContent="flex-end">
													<Tooltip title="Ficha Zootécnica">
														<IconButton size="small" onClick={() => setDetailTemplate(template)}>
															<FuseSvgIcon size={18}>heroicons-outline:information-circle</FuseSvgIcon>
														</IconButton>
													</Tooltip>

													<Tooltip title="Imprimir Planilla">
														<IconButton
															size="small"
															component={Link}
															to={`/work-templates/${template.code}`}
															disabled={isArchived}
														>
															<FuseSvgIcon size={18}>heroicons-outline:printer</FuseSvgIcon>
														</IconButton>
													</Tooltip>

													{meta?.hasScanAi && (
														<Tooltip title="Escanear con AI">
															<IconButton
																size="small"
																component={Link}
																to={`/work-templates/scan/${template.code.toLowerCase()}`}
																disabled={isArchived}
																sx={{ color: '#6366f1' }}
															>
																<FuseSvgIcon size={18}>heroicons-outline:camera</FuseSvgIcon>
															</IconButton>
														</Tooltip>
													)}
												</Stack>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</Paper>
				)}

				{/* Quick Detail Modal */}
				<TemplateQuickDetailModal
					open={Boolean(detailTemplate)}
					onClose={() => setDetailTemplate(null)}
					template={detailTemplate}
				/>
			</Box>
		</ViewLayout>
	);
};

export default WorkTemplateGalleryView;
