import React, { useState } from 'react';
import {
	Box,
	Card,
	CardContent,
	CardActions,
	Typography,
	Stack,
	Chip,
	Button,
	Tooltip,
	Divider,
	Fade
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link } from 'react-router';
import { WorkTemplate } from '../../types/TemplateModels';
import { ZOOTECHNICAL_CATALOG } from '../../data/zootechnicalLibraryData';
import WorkTemplateSheetThumbnail from './WorkTemplateSheetThumbnail';

interface TemplateGalleryCardProps {
	template: WorkTemplate;
	onOpenDetail: (template: WorkTemplate) => void;
}

export const TemplateGalleryCard: React.FC<TemplateGalleryCardProps> = ({
	template,
	onOpenDetail
}) => {
	const [isHovered, setIsHovered] = useState(false);

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
		orderContext: 'Manejo General de Rodeo',
		hasScanAi: false,
		hasPrintSheet: true
	};

	const isArchived = template.status === 'archived' || meta.isArchived;

	return (
		<Card
			elevation={0}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			sx={{
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				borderRadius: '14px',
				border: '1px solid',
				borderColor: isHovered && !isArchived ? meta.stageColor : 'divider',
				bgcolor: isArchived ? 'action.hover' : 'background.paper',
				opacity: isArchived ? 0.75 : 1,
				boxShadow: isHovered
					? '0 14px 28px -6px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.04)'
					: '0 2px 6px rgba(0,0,0,0.03)',
				transform: isHovered ? 'translateY(-4px)' : 'none',
				transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
				position: 'relative',
				overflow: 'hidden'
			}}
		>
			{/* Top: A4 Document Printable Preview */}
			<Box sx={{ position: 'relative' }}>
				<WorkTemplateSheetThumbnail
					code={template.code}
					title={template.title}
					isArchived={isArchived}
				/>

				{/* Floating Fast Action Overlay on Hover */}
				<Fade in={isHovered && !isArchived}>
					<Box
						sx={{
							position: 'absolute',
							inset: 0,
							bgcolor: 'rgba(15, 23, 42, 0.65)',
							backdropFilter: 'blur(2px)',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 1.25,
							p: 2,
							zIndex: 2,
							cursor: 'pointer'
						}}
						onClick={() => onOpenDetail(template)}
					>
						<Typography variant="caption" sx={{ color: 'white', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
							Documento Imprimible A4
						</Typography>

						<Stack direction="row" spacing={1}>
							<Button
								size="small"
								variant="contained"
								onClick={(e) => {
									e.stopPropagation();
									onOpenDetail(template);
								}}
								startIcon={<FuseSvgIcon size={16}>heroicons-outline:magnifying-glass-plus</FuseSvgIcon>}
								sx={{
									bgcolor: 'white',
									color: 'grey.900',
									fontWeight: 800,
									fontSize: '0.72rem',
									textTransform: 'none',
									borderRadius: '6px',
									'&:hover': { bgcolor: 'grey.100' }
								}}
							>
								Zoom A4
							</Button>

							<Button
								size="small"
								variant="contained"
								component={Link}
								to={`/work-templates/${template.code}`}
								onClick={(e) => e.stopPropagation()}
								startIcon={<FuseSvgIcon size={16}>heroicons-outline:printer</FuseSvgIcon>}
								sx={{
									bgcolor: 'primary.main',
									color: 'white',
									fontWeight: 800,
									fontSize: '0.72rem',
									textTransform: 'none',
									borderRadius: '6px',
									'&:hover': { bgcolor: 'primary.dark' }
								}}
							>
								Imprimir
							</Button>
						</Stack>
					</Box>
				</Fade>
			</Box>

			{/* Middle: Details & Zootechnical Explanation */}
			<CardContent sx={{ p: 2.25, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
				{/* Code, Stage & Status Header */}
				<Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
					<Stack direction="row" spacing={0.75} alignItems="center">
						<Box
							sx={{
								px: 1.2,
								py: 0.25,
								borderRadius: '5px',
								bgcolor: 'grey.900',
								color: 'white',
								fontFamily: 'monospace',
								fontWeight: 900,
								fontSize: '0.8rem',
								letterSpacing: '0.04em'
							}}
						>
							{template.code}
						</Box>

						<Chip
							icon={
								<FuseSvgIcon size={13} sx={{ color: `${meta.stageColor} !important` }}>
									{meta.stageIcon}
								</FuseSvgIcon>
							}
							label={meta.stageName}
							size="small"
							sx={{
								fontWeight: 700,
								fontSize: '0.7rem',
								height: 22,
								bgcolor: meta.stageBadgeBg,
								color: meta.stageColor,
								border: `1px solid ${meta.stageColor}33`
							}}
						/>
					</Stack>

					<Chip
						label={isArchived ? 'ARCHIVADA' : 'ACTIVA'}
						size="small"
						color={isArchived ? 'default' : 'success'}
						sx={{
							fontWeight: 800,
							fontSize: '0.62rem',
							height: 20
						}}
					/>
				</Stack>

				{/* Title */}
				<Typography
					variant="subtitle2"
					sx={{
						fontWeight: 800,
						color: 'text.primary',
						lineHeight: 1.25,
						mb: 0.5,
						fontSize: '0.92rem',
						minHeight: 38
					}}
				>
					{template.title}
				</Typography>

				<Typography
					variant="caption"
					sx={{
						color: 'text.secondary',
						fontWeight: 600,
						display: 'flex',
						alignItems: 'center',
						gap: 0.5,
						mb: 1.5,
						fontSize: '0.72rem'
					}}
				>
					<FuseSvgIcon size={13}>heroicons-outline:calendar</FuseSvgIcon>
					{meta.orderContext}
				</Typography>

				{/* Zootechnical Explanation Box */}
				<Box
					sx={{
						p: 1.5,
						borderRadius: '8px',
						bgcolor: 'action.hover',
						borderLeft: `3px solid ${meta.stageColor}`,
						mb: 1.75,
						flexGrow: 1
					}}
				>
					<Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
						<Box sx={{ color: meta.stageColor, display: 'flex' }}>
							<FuseSvgIcon size={14}>heroicons-outline:academic-cap</FuseSvgIcon>
						</Box>
						<Typography
							variant="caption"
							sx={{
								fontWeight: 800,
								textTransform: 'uppercase',
								color: 'text.secondary',
								fontSize: '0.68rem',
								letterSpacing: '0.04em'
							}}
						>
							Fundamento Zootécnico
						</Typography>
					</Stack>
					<Typography
						variant="body2"
						sx={{
							fontSize: '0.77rem',
							lineHeight: 1.45,
							color: 'text.primary',
							fontWeight: 500
						}}
					>
						{meta.zootechnicalSummary}
					</Typography>
				</Box>

				{/* Field Metrics Chips */}
				{meta.fieldMetrics && meta.fieldMetrics.length > 0 && (
					<Box sx={{ mt: 'auto' }}>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
							{meta.fieldMetrics.slice(0, 3).map((metric, idx) => (
								<Tooltip key={idx} title={metric.hint || metric.label}>
									<Chip
										label={metric.label}
										size="small"
										variant="outlined"
										sx={{
											fontSize: '0.66rem',
											height: 20,
											borderColor: 'divider',
											bgcolor: 'background.paper',
											fontWeight: 600,
											color: 'text.secondary'
										}}
									/>
								</Tooltip>
							))}
							{meta.fieldMetrics.length > 3 && (
								<Chip
									label={`+${meta.fieldMetrics.length - 3}`}
									size="small"
									sx={{
										fontSize: '0.66rem',
										height: 20,
										bgcolor: 'action.hover',
										fontWeight: 700
									}}
								/>
							)}
						</Box>
					</Box>
				)}
			</CardContent>

			<Divider sx={{ borderColor: 'divider' }} />

			{/* Card Footer Actions */}
			<CardActions sx={{ p: 1.25, px: 2, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
				<Button
					size="small"
					variant="text"
					onClick={() => onOpenDetail(template)}
					startIcon={<FuseSvgIcon size={15}>heroicons-outline:document-magnifying-glass</FuseSvgIcon>}
					sx={{
						fontSize: '0.73rem',
						fontWeight: 700,
						textTransform: 'none',
						color: 'text.secondary',
						'&:hover': { color: 'primary.main', bgcolor: 'action.hover' }
					}}
				>
					Ficha A4
				</Button>

				<Stack direction="row" spacing={1}>
					<Tooltip title="Imprimir o descargar planilla A4">
						<Button
							size="small"
							variant="outlined"
							component={Link}
							to={`/work-templates/${template.code}`}
							startIcon={<FuseSvgIcon size={14}>heroicons-outline:printer</FuseSvgIcon>}
							disabled={isArchived}
							sx={{
								fontSize: '0.73rem',
								fontWeight: 700,
								textTransform: 'none',
								borderRadius: '6px',
								py: 0.4,
								px: 1.25,
								borderColor: 'divider',
								color: 'text.primary',
								'&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'primary.lighter' }
							}}
						>
							Imprimir
						</Button>
					</Tooltip>

					{meta.hasScanAi && (
						<Tooltip title="Escanear y cargar con Visión AI">
							<Button
								size="small"
								variant="contained"
								component={Link}
								to={`/work-templates/scan/${template.code.toLowerCase()}`}
								startIcon={<FuseSvgIcon size={14}>heroicons-outline:camera</FuseSvgIcon>}
								disabled={isArchived}
								sx={{
									fontSize: '0.73rem',
									fontWeight: 700,
									textTransform: 'none',
									borderRadius: '6px',
									py: 0.4,
									px: 1.25,
									bgcolor: '#6366f1',
									color: 'white',
									boxShadow: 'none',
									'&:hover': { bgcolor: '#4f46e5', boxShadow: 'none' }
								}}
							>
								Escanear
							</Button>
						</Tooltip>
					)}
				</Stack>
			</CardActions>
		</Card>
	);
};

export default TemplateGalleryCard;
