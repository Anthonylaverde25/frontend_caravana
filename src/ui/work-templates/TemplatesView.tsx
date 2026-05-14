import { useMemo, useState } from 'react';
import { 
	Box, 
	Typography, 
	Paper, 
	Stack, 
	IconButton, 
	Tooltip, 
	Chip, 
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Divider
} from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DataTable from '@/components/data-table/DataTable';
import { Link } from 'react-router';
import { useTemplateData } from './hooks/useTemplateData';

/**
 * PreviewDialog Component
 * Renders a technical "Planilla de Campo" (A4 Style) for the selected template.
 */
function PreviewDialog({ open, onClose, template }: { open: boolean, onClose: () => void, template: any }) {
	if (!template) return null;

	return (
		<Dialog 
			open={open} 
			onClose={onClose} 
			maxWidth="md" 
			fullWidth
			PaperProps={{
				sx: { borderRadius: '8px', backgroundColor: 'grey.100' }
			}}
		>
			<DialogTitle className="flex items-center justify-between bg-white border-b border-divider px-24 py-16">
				<Stack direction="row" spacing={1.5} alignItems="center">
					<FuseSvgIcon size={20} color="primary">heroicons-outline:document-magnifying-glass</FuseSvgIcon>
					<Box>
						<Typography variant="subtitle1" className="font-extrabold text-grey-800 leading-tight">
							Previsualización: {template.title}
						</Typography>
						<Typography variant="caption" className="text-grey-500 font-bold uppercase tracking-wider">
							Formato: Planilla de Campo
						</Typography>
					</Box>
				</Stack>
				<IconButton onClick={onClose} size="small"><FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon></IconButton>
			</DialogTitle>
			<DialogContent className="p-40 flex justify-center overflow-y-auto bg-grey-200">
				{/* Simulated A4 Sheet */}
				<Paper 
					elevation={4} 
					sx={{ 
						width: '210mm', 
						minHeight: '297mm', 
						p: '20mm', 
						backgroundColor: 'white',
						boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
						borderRadius: '2px'
					}}
				>
					{/* Planilla de Campo Header */}
					<Box className="border-2 border-grey-900 p-16 mb-24">
						<Stack direction="row" justifyContent="space-between" alignItems="center">
							<Box>
								<Typography variant="h5" className="font-black text-grey-900 uppercase">PLANILLA DE CAMPO</Typography>
								<Typography variant="body2" className="font-bold text-grey-600 italic">{template.type_name}</Typography>
							</Box>
							<Box className="text-right border-l-2 border-grey-900 pl-24">
								<Typography variant="caption" className="block font-bold">ESTABLECIMIENTO: ____________________</Typography>
								<Typography variant="caption" className="block font-bold mt-4">FECHA: ____ / ____ / ________</Typography>
							</Box>
						</Stack>
					</Box>

					{/* Technical Grid Mockup */}
					<Box className="w-full">
						<Table size="small" sx={{ border: '2px solid black', '& td, & th': { border: '1px solid black', py: 1.5 } }}>
							<TableHead>
								<TableRow sx={{ bgcolor: 'grey.100' }}>
									<TableCell sx={{ fontWeight: 900, fontSize: 10, textAlign: 'center', width: 40 }}>ORD.</TableCell>
									<TableCell sx={{ fontWeight: 900, fontSize: 10 }}>CARAVANA / ID</TableCell>
									<TableCell sx={{ fontWeight: 900, fontSize: 10 }}>CATEGORÍA</TableCell>
									<TableCell sx={{ fontWeight: 900, fontSize: 10 }}>PESO (KG)</TableCell>
									<TableCell sx={{ fontWeight: 900, fontSize: 10 }}>OBSERVACIONES</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{[...Array(15)].map((_, i) => (
									<TableRow key={i}>
										<TableCell sx={{ textAlign: 'center', color: 'grey.400', fontSize: 10 }}>{i + 1}</TableCell>
										<TableCell />
										<TableCell />
										<TableCell />
										<TableCell />
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Box>

					{/* Footer Info */}
					<Box className="mt-40 pt-24 border-t border-grey-300">
						<Stack direction="row" spacing={8}>
							<Box className="flex-1 border-b border-grey-900 pb-4">
								<Typography variant="caption" className="font-bold uppercase text-grey-400">Responsable de Campo</Typography>
							</Box>
							<Box className="flex-1 border-b border-grey-900 pb-4 text-right">
								<Typography variant="caption" className="font-bold uppercase text-grey-400 text-right">Firma y Sello</Typography>
							</Box>
						</Stack>
					</Box>
				</Paper>
			</DialogContent>
			<Box className="p-16 bg-white border-t border-divider flex justify-end gap-12">
				<Button variant="outlined" onClick={onClose} sx={{ textTransform: 'none', fontWeight: 700 }}>Cerrar</Button>
				<Button 
					variant="contained" 
					startIcon={<FuseSvgIcon size={20}>heroicons-outline:printer</FuseSvgIcon>}
					sx={{ bgcolor: 'primary.main', textTransform: 'none', fontWeight: 700 }}
				>
					Imprimir Planilla
				</Button>
			</Box>
		</Dialog>
	);
}

import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

/**
 * TemplatesView Component
 */
function TemplatesView() {
	const { types, templates, isLoading, error } = useTemplateData();
	const [previewTemplate, setPreviewTemplate] = useState<any>(null);

	const columns = useMemo(() => [
		{
			header: 'Tipo de Proceso',
			accessorKey: 'name',
			cell: ({ row }: any) => (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box sx={{ color: row.original.color, display: 'flex' }}>
						<FuseSvgIcon size={20}>{row.original.icon || 'heroicons-outline:collection'}</FuseSvgIcon>
					</Box>
					<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
						{row.original.name}
					</Typography>
				</Stack>
			)
		},
		{
			header: 'Código',
			accessorKey: 'code',
			cell: ({ getValue }: any) => (
				<Typography variant="caption" className="font-mono font-bold text-grey-400 uppercase tracking-wider">
					{getValue()}
				</Typography>
			)
		},
		{
			header: 'Cant. Plantillas',
			accessorFn: (row: any) => templates.filter(t => t.type_name === row.name).length,
			cell: ({ getValue }: any) => (
				<Chip
					label={`${getValue()} Activas`}
					size="small"
					sx={{ fontWeight: 700, fontSize: 10, height: 20 }}
				/>
			)
		}
	], [templates]);

	if (error) {
		return (
			<ViewLayout title="Plantillas de Trabajo">
				<Box className="p-32 text-center text-error border border-error rounded-8 bg-error-50">
					<Typography variant="h6">Error de sincronización</Typography>
					<Typography variant="body2">{error}</Typography>
				</Box>
			</ViewLayout>
		);
	}

	return (
		<ViewLayout
			title="Gestión de Plantillas"
			subtitle="Repositorio centralizado de procesos operativos y formatos de campo."
			actions={
				<Button
					variant="contained"
					component={Link}
					to="/templates/create"
					startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>}
					sx={{
						bgcolor: 'primary.main',
						borderRadius: '6px',
						px: 3,
						fontWeight: 700,
						textTransform: 'none',
						boxShadow: 'none'
					}}
				>
					Nueva Plantilla
				</Button>
			}
		>
			<Box className="w-full">
				<DataTable
					columns={columns}
					data={types}
					isLoading={isLoading}
					enableExpanding={true}
					positionActionsColumn="last"
					renderDetailPanel={({ row }) => {
						const typeTemplates = templates.filter(t => t.type_name === row.original.name);

						return (
							<Box
								sx={{
									display: 'grid',
									width: '100%',
									p: 3,
									bgcolor: 'background.default',
									borderTop: 1,
									borderBottom: 1,
									borderColor: 'divider'
								}}
							>
								<Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, mb: 2, display: 'block' }}>
									Formatos asociados a {row.original.name} ({typeTemplates.length})
								</Typography>

								{typeTemplates.length > 0 ? (
									<Stack spacing={1.5}>
										{typeTemplates.map((template) => (
											<Paper
												key={template.id}
												elevation={0}
												sx={{
													p: 2,
													px: 3,
													borderRadius: '6px',
													border: 1,
													borderColor: 'divider',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'space-between',
													bgcolor: 'background.paper',
													transition: 'all 0.2s',
													'&:hover': {
														borderColor: 'primary.main',
														boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
													}
												}}
											>
												<Stack direction="row" spacing={3} alignItems="center">
													<Box>
														<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
															<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
																{template.title}
															</Typography>
															<Typography variant="caption" sx={{ color: 'divider', fontWeight: 900 }}>|</Typography>
															<Typography variant="caption" sx={{ fontWeight: 800, color: template.status === 'active' ? 'success.main' : 'warning.main' }}>
																{template.status === 'active' ? 'ACTIVA' : 'BORRADOR'}
															</Typography>
														</Stack>
														<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
															{template.description || 'Configuración operativa estándar para procesos de gestión.'}
														</Typography>
													</Box>
												</Stack>

												<Stack direction="row" spacing={1} alignItems="center">
													
													<Tooltip title="Previsualizar Formato">
														<IconButton
															size="small"
															onClick={() => setPreviewTemplate(template)}
															sx={{
																color: 'info.main',
																bgcolor: 'info.lighter',
																'&:hover': { bgcolor: 'info.light' }
															}}
														>
															<FuseSvgIcon size={20}>heroicons-outline:eye</FuseSvgIcon>
														</IconButton>
													</Tooltip>

													<Tooltip title="Imprimir / Descargar PDF">
														<IconButton
															size="small"
															sx={{
																color: 'success.main',
																bgcolor: 'success.lighter',
																'&:hover': { bgcolor: 'success.light' }
															}}
														>
															<FuseSvgIcon size={20}>heroicons-outline:printer</FuseSvgIcon>
														</IconButton>
													</Tooltip>

													<Tooltip title="Configurar Estructura">
														<IconButton
															size="small"
															component={Link}
															to={`/livestock/generator?id=${template.id}`}
															sx={{
																color: 'primary.main',
																bgcolor: 'action.hover',
																'&:hover': { bgcolor: 'action.selected' }
															}}
														>
															<FuseSvgIcon size={20}>heroicons-outline:cog</FuseSvgIcon>
														</IconButton>
													</Tooltip>
													
													<IconButton
														size="small"
														sx={{
															color: 'text.secondary',
															bgcolor: 'action.hover',
															'&:hover': { bgcolor: 'action.selected' }
														}}
													>
														<FuseSvgIcon size={20}>heroicons-outline:ellipsis-vertical</FuseSvgIcon>
													</IconButton>
												</Stack>
											</Paper>
										))}
									</Stack>
								) : (
									<Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
										No hay plantillas registradas para este tipo de proceso.
									</Typography>
								)}
							</Box>
						);
					}}
					initialState={{
						density: 'compact',
						showGlobalFilter: true,
						pagination: { pageSize: 15, pageIndex: 0 },
					}}
					muiTableProps={{
						sx: {
							border: '1px solid',
							borderColor: 'divider',
						}
					}}
					muiTableHeadCellProps={{
						sx: {
							borderRight: '1px solid',
							borderBottom: '2px solid',
							borderColor: 'divider',
							bgcolor: 'action.hover',
							fontWeight: 800,
						}
					}}
					muiTableBodyCellProps={{
						sx: {
							borderRight: '1px solid',
							borderBottom: '1px solid',
							borderColor: 'divider',
						}
					}}
				/>
			</Box>

			{/* Modal de Previsualización */}
			<PreviewDialog 
				open={Boolean(previewTemplate)} 
				onClose={() => setPreviewTemplate(null)} 
				template={previewTemplate} 
			/>
		</ViewLayout>
	);
}

export default TemplatesView;
