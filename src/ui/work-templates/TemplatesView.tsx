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
	DialogTitle
} from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DataTable from '@/components/data-table/DataTable';
import { Link } from 'react-router';
import { useTemplateData } from './hooks/useTemplateData';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

// Metadatos estáticos para las categorías de procesos operativos
const CATEGORY_META: Record<string, { name: string; color: string; icon: string }> = {
	ENTRY: { name: 'Ingreso Ganadero', color: '#4CAF50', icon: 'heroicons-outline:arrow-down-tray' },
	WEIGHT: { name: 'Control de Peso', color: '#2196F3', icon: 'heroicons-outline:scale' },
	ACTIVITY: { name: 'Cambio de Actividad', color: '#FF9800', icon: 'heroicons-outline:arrows-right-left' },
	HEALTH: { name: 'Sanidad', color: '#10b981', icon: 'heroicons-outline:shield-check' },
	REPRODUCTIVE: { name: 'Reproductivo', color: '#9C27B0', icon: 'heroicons-outline:clipboard-document-check' },
};

/**
 * PreviewDialog Component
 * Renders a technical "Planilla de Campo" (A4 Style) for the selected template.
 */
function PreviewDialog({ open, onClose, template }: { open: boolean, onClose: () => void, template: any }) {
	if (!template) return null;

	const meta = CATEGORY_META[template.category] || { name: 'Proceso General', color: '#757575', icon: 'heroicons-outline:collection' };

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
								<Typography variant="body2" className="font-bold text-grey-600 italic">{meta.name}</Typography>
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

/**
 * TemplatesView Component
 */
function TemplatesView() {
	const { templates, isLoading, error } = useTemplateData();
	const [previewTemplate, setPreviewTemplate] = useState<any>(null);

	const columns = useMemo(() => [
		{
			header: 'Nombre de Plantilla',
			accessorKey: 'title',
			cell: ({ row }: any) => (
				<Box>
					<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
						{row.original.title}
					</Typography>
					<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
						{row.original.description || 'Configuración operativa estándar para procesos de gestión.'}
					</Typography>
				</Box>
			)
		},
		{
			header: 'Categoría',
			accessorKey: 'category',
			cell: ({ getValue }: any) => {
				const category = getValue();
				const meta = CATEGORY_META[category] || { name: 'Proceso General', color: '#757575', icon: 'heroicons-outline:collection' };
				return (
					<Stack direction="row" spacing={1} alignItems="center">
						<Box sx={{ color: meta.color, display: 'flex' }}>
							<FuseSvgIcon size={18}>{meta.icon}</FuseSvgIcon>
						</Box>
						<Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
							{meta.name}
						</Typography>
					</Stack>
				);
			}
		},
		{
			header: 'Código',
			accessorKey: 'code',
			cell: ({ getValue }: any) => (
				<Typography variant="caption" className="font-mono font-bold text-grey-500 uppercase tracking-wider">
					{getValue()}
				</Typography>
			)
		},
		{
			header: 'Estado',
			accessorKey: 'status',
			cell: ({ getValue }: any) => {
				const status = getValue();
				const label = status === 'active' ? 'ACTIVA' : status === 'draft' ? 'BORRADOR' : 'ARCHIVADA';
				const color = status === 'active' ? 'success' : status === 'draft' ? 'warning' : 'default';
				return (
					<Chip
						label={label}
						size="small"
						color={color}
						sx={{ fontWeight: 800, fontSize: 10, height: 20 }}
					/>
				);
			}
		},
		{
			id: 'actions',
			header: 'Acciones',
			cell: ({ row }: any) => {
				const template = row.original;
				return (
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
					</Stack>
				);
			}
		}
	], []);

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
					data={templates}
					isLoading={isLoading}
					enableExpanding={false}
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
