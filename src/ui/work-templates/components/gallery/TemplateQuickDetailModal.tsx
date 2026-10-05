import React, { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	Stack,
	Box,
	IconButton,
	Button,
	Chip,
	Divider,
	Tabs,
	Tab,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link } from 'react-router';
import { WorkTemplate } from '../../types/TemplateModels';
import { ZOOTECHNICAL_CATALOG } from '../../data/zootechnicalLibraryData';

interface TemplateQuickDetailModalProps {
	open: boolean;
	onClose: () => void;
	template: WorkTemplate | null;
}

export const TemplateQuickDetailModal: React.FC<TemplateQuickDetailModalProps> = ({
	open,
	onClose,
	template
}) => {
	const [activeTab, setActiveTab] = useState<number>(0);

	if (!template) return null;

	const meta = ZOOTECHNICAL_CATALOG[template.code] || {
		code: template.code,
		stageKey: 'transition',
		stageName: 'Proceso General',
		stageColor: '#6b7280',
		stageBadgeBg: '#f3f4f6',
		stageIcon: 'heroicons-outline:document-text',
		zootechnicalSummary: template.description || 'Configuración operativa estándar para procesos ganaderos.',
		biologicalObjective: 'Estandarizar el registro zootécnico en la manga.',
		fieldMetrics: [],
		orderContext: 'Manejo General',
		hasScanAi: false,
		hasPrintSheet: true
	};

	// Parse schema definition fields
	const schemaDefinition = template.schema_definition;
	const headerFields: any[] = schemaDefinition?.header_fields || [];
	const tableColumns: any[] = schemaDefinition?.table_columns || (Array.isArray(schemaDefinition) ? schemaDefinition : []);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '12px',
					boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
					overflow: 'hidden'
				}
			}}
		>
			{/* Dialog Header */}
			<DialogTitle
				sx={{
					p: 2.5,
					borderBottom: '1px solid',
					borderColor: 'divider',
					bgcolor: 'background.paper',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between'
				}}
			>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box
						sx={{
							px: 1.25,
							py: 0.5,
							borderRadius: '6px',
							bgcolor: 'grey.900',
							color: 'white',
							fontFamily: 'monospace',
							fontWeight: 900,
							fontSize: '0.9rem'
						}}
					>
						{template.code}
					</Box>
					<Box>
						<Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
							{template.title}
						</Typography>
						<Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
							<Chip
								label={meta.stageName}
								size="small"
								sx={{
									fontWeight: 700,
									fontSize: '0.7rem',
									height: 20,
									bgcolor: meta.stageBadgeBg,
									color: meta.stageColor
								}}
							/>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
								• {meta.orderContext}
							</Typography>
						</Stack>
					</Box>
				</Stack>

				<IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</DialogTitle>

			{/* Navigation Tabs */}
			<Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover', px: 2 }}>
				<Tabs
					value={activeTab}
					onChange={(_, val) => setActiveTab(val)}
					textColor="primary"
					indicatorColor="primary"
					sx={{ minHeight: 44 }}
				>
					<Tab
						icon={<FuseSvgIcon size={18}>heroicons-outline:document-text</FuseSvgIcon>}
						iconPosition="start"
						label="Formato de Hoja A4"
						sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', minHeight: 44 }}
					/>
					<Tab
						icon={<FuseSvgIcon size={18}>heroicons-outline:academic-cap</FuseSvgIcon>}
						iconPosition="start"
						label="Fundamento Zootécnico & Variables"
						sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', minHeight: 44 }}
					/>
				</Tabs>
			</Box>

			<DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: activeTab === 0 ? '#f1f5f9' : 'background.paper' }}>
				{/* Tab 0: High Fidelity A4 Document Sheet Preview */}
				{activeTab === 0 && (
					<Box sx={{ display: 'flex', justifyContent: 'center' }}>
						<Paper
							elevation={4}
							sx={{
								width: '100%',
								maxWidth: '210mm',
								bgcolor: 'white',
								p: 3,
								borderRadius: '4px',
								border: '2px solid #0f172a',
								boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
							}}
						>
							{/* Official Header */}
							<Box sx={{ borderBottom: '2px solid #0f172a', pb: 2, mb: 2 }}>
								<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
									<Box>
										<Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: '0.1em', color: 'text.secondary', textTransform: 'uppercase' }}>
											SISTEMA GANADERO INTEGRADO • PLANILLA OFICIAL DE MANGA
										</Typography>
										<Typography variant="h6" sx={{ fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', mt: 0.5 }}>
											{template.title}
										</Typography>
										<Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', fontStyle: 'italic' }}>
											{meta.stageName} • {meta.orderContext}
										</Typography>
									</Box>

									<Box sx={{ textAlign: 'right', border: '2px solid #0f172a', p: 1, borderRadius: '4px', minWidth: 120 }}>
										<Typography variant="caption" sx={{ fontWeight: 800, display: 'block', color: 'text.secondary' }}>
											TEMPLATE CODE
										</Typography>
										<Typography variant="subtitle2" sx={{ fontWeight: 900, fontFamily: 'monospace', color: '#0f172a' }}>
											{template.code}
										</Typography>
										<Typography variant="caption" sx={{ display: 'block', fontWeight: 700, mt: 0.5, fontSize: '0.65rem' }}>
											FECHA: ____ / ____ / ________
										</Typography>
									</Box>
								</Stack>
							</Box>

							{/* Metadata Header Boxes */}
							<Box sx={{ mb: 2 }}>
								<Stack direction="row" spacing={1} sx={{ mb: 1 }}>
									<Box sx={{ flex: 2, border: '1px solid #0f172a', p: 1, borderRadius: '2px' }}>
										<Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
											ESTABLECIMIENTO GANADERO:
										</Typography>
										<Typography variant="body2" sx={{ fontWeight: 600 }}>__________________________________</Typography>
									</Box>
									<Box sx={{ flex: 1, border: '1px solid #0f172a', p: 1, borderRadius: '2px' }}>
										<Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
											RENSPA / UBICACIÓN:
										</Typography>
										<Typography variant="body2" sx={{ fontWeight: 600 }}>____.____._._____/____</Typography>
									</Box>
								</Stack>

								{headerFields.length > 0 && (
									<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
										{headerFields.slice(0, 4).map((f: any, i: number) => (
											<Box key={i} sx={{ flex: '1 1 22%', border: '1px solid #cbd5e1', p: 0.75, borderRadius: '2px', bgcolor: '#f8fafc' }}>
												<Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.65rem', color: 'text.secondary' }}>
													{f.label?.toUpperCase() || f.name?.toUpperCase()}:
												</Typography>
												<Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', fontStyle: 'italic' }}>
													{f.ai_hint || 'Completar a mano'}
												</Typography>
											</Box>
										))}
									</Stack>
								)}
							</Box>

							{/* Technical Data Grid Table */}
							<Box sx={{ border: '2px solid #0f172a', borderRadius: '2px', overflow: 'hidden', mb: 2 }}>
								<Table size="small" sx={{ '& td, & th': { border: '1px solid #0f172a', py: 0.75 } }}>
									<TableHead sx={{ bgcolor: '#0f172a' }}>
										<TableRow>
											<TableCell sx={{ color: 'white', fontWeight: 900, fontSize: '0.68rem', textAlign: 'center', width: 35 }}>N°</TableCell>
											{tableColumns.map((col: any, idx: number) => (
												<TableCell key={idx} sx={{ color: 'white', fontWeight: 900, fontSize: '0.68rem', textAlign: 'left' }}>
													{col.label?.toUpperCase() || col.name?.toUpperCase()}
												</TableCell>
											))}
										</TableRow>
									</TableHead>
									<TableBody>
										{[...Array(8)].map((_, rowIdx) => (
											<TableRow key={rowIdx}>
												<TableCell sx={{ textAlign: 'center', fontSize: '0.65rem', color: 'text.secondary', fontWeight: 700 }}>
													{rowIdx + 1}
												</TableCell>
												{tableColumns.map((_, colIdx) => (
													<TableCell key={colIdx} sx={{ height: 24 }} />
												))}
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Box>

							{/* Sheet Footer */}
							<Box sx={{ borderTop: '2px solid #0f172a', pt: 1.5, mt: 3 }}>
								<Stack direction="row" spacing={3} justifyContent="space-between">
									<Box sx={{ flex: 1 }}>
										<Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
											RESPONSABLE DE CAMPO: ___________________________
										</Typography>
										<Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
											Certifica los datos registrados en manga.
										</Typography>
									</Box>
									<Box sx={{ flex: 1, textAlign: 'right' }}>
										<Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
											FIRMA Y SELLO: ___________________________
										</Typography>
										<Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
											Médico Veterinario Actuante
										</Typography>
									</Box>
								</Stack>
							</Box>
						</Paper>
					</Box>
				)}

				{/* Tab 1: Zootechnical Justification & Field Metrics */}
				{activeTab === 1 && (
					<Box>
						{/* Biological Foundations Section */}
						<Box sx={{ mb: 3 }}>
							<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
								<Box sx={{ color: meta.stageColor }}>
									<FuseSvgIcon size={18}>heroicons-outline:academic-cap</FuseSvgIcon>
								</Box>
								<Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'text.primary' }}>
									Fundamento y Objetivo Zootécnico
								</Typography>
							</Stack>

							<Box
								sx={{
									p: 2,
									borderRadius: '8px',
									bgcolor: 'action.hover',
									borderLeft: `4px solid ${meta.stageColor}`,
									mb: 2
								}}
							>
								<Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.6, color: 'text.primary', mb: 1.5 }}>
									{meta.zootechnicalSummary}
								</Typography>
								<Divider sx={{ my: 1, borderColor: 'divider' }} />
								<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}>
									<strong>Objetivo Productivo:</strong> {meta.biologicalObjective}
								</Typography>
							</Box>
						</Box>

						{/* Field Metrics in Manga */}
						{meta.fieldMetrics && meta.fieldMetrics.length > 0 && (
							<Box sx={{ mb: 3 }}>
								<Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
									Indicadores Clave Registrados en Manga
								</Typography>
								<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
									{meta.fieldMetrics.map((metric, idx) => (
										<Chip
											key={idx}
											label={`${metric.label}${metric.hint ? ` (${metric.hint})` : ''}`}
											size="small"
											sx={{
												fontWeight: 600,
												fontSize: '0.75rem',
												bgcolor: 'background.paper',
												border: '1px solid',
												borderColor: 'divider',
												color: 'text.secondary'
											}}
										/>
									))}
								</Stack>
							</Box>
						)}

						{/* Table Columns Schema */}
						<Box>
							<Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
								Estructura de Datos del Formulario ({tableColumns.length} columnas)
							</Typography>
							{tableColumns.length > 0 ? (
								<Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', overflow: 'hidden' }}>
									<Table size="small">
										<TableHead sx={{ bgcolor: 'action.hover' }}>
											<TableRow>
												<TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Campo / Columna</TableCell>
												<TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Tipo</TableCell>
												<TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Requerido</TableCell>
												<TableCell sx={{ fontWeight: 800, fontSize: '0.75rem' }}>Instrucción / Pista</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{tableColumns.map((col: any, idx: number) => (
												<TableRow key={idx} sx={{ '&:last-child td': { border: 0 } }}>
													<TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
														{col.label || col.name}
													</TableCell>
													<TableCell sx={{ fontSize: '0.72rem', color: 'text.secondary', fontFamily: 'monospace' }}>
														{col.type || 'string'}
													</TableCell>
													<TableCell sx={{ fontSize: '0.72rem' }}>
														{col.required ? (
															<Chip label="Obligatorio" size="small" color="error" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }} />
														) : (
															<Typography variant="caption" sx={{ color: 'text.disabled' }}>Opcional</Typography>
														)}
													</TableCell>
													<TableCell sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
														{col.ai_hint || col.name}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</Box>
							) : (
								<Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
									La estructura se define dinámicamente en el formato de campo.
								</Typography>
							)}
						</Box>
					</Box>
				)}
			</DialogContent>

			{/* Dialog Footer Actions */}
			<DialogActions sx={{ p: 2, px: 3, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
				<Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}>
					Cerrar
				</Button>

				<Button
					variant="contained"
					component={Link}
					to={`/work-templates/${template.code}`}
					startIcon={<FuseSvgIcon size={16}>heroicons-outline:printer</FuseSvgIcon>}
					sx={{
						textTransform: 'none',
						fontWeight: 700,
						borderRadius: '6px',
						bgcolor: 'primary.main',
						color: 'white',
						'&:hover': { bgcolor: 'primary.dark' }
					}}
				>
					Imprimir Planilla A4
				</Button>

				{meta.hasScanAi && (
					<Button
						variant="contained"
						component={Link}
						to={`/work-templates/scan/${template.code.toLowerCase()}`}
						startIcon={<FuseSvgIcon size={16}>heroicons-outline:camera</FuseSvgIcon>}
						sx={{
							textTransform: 'none',
							fontWeight: 700,
							borderRadius: '6px',
							bgcolor: '#6366f1',
							color: 'white',
							boxShadow: 'none',
							'&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' }
						}}
					>
						Escanear con AI
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default TemplateQuickDetailModal;
