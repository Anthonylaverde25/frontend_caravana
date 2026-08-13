import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Stack,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	Avatar,
	useTheme,
	alpha
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { InbreedingRisk } from '@/core/caravans/domain/services/pedigreeAnalysis';

export interface RiskyFemalePair {
	female: Caravan;
	fx: number;
	risk: InbreedingRisk;
	sireDesc: string;
	commonAncestors: string[];
}

interface SireRotationInbreedingDialogProps {
	open: boolean;
	onClose: () => void;
	riskyFemales: RiskyFemalePair[];
	onConfirmWithAll: () => void;
	onExcludeAndConfirm: () => void;
	isSubmitting?: boolean;
}

export default function SireRotationInbreedingDialog({
	open,
	onClose,
	riskyFemales,
	onConfirmWithAll,
	onExcludeAndConfirm,
	isSubmitting = false
}: SireRotationInbreedingDialogProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	const criticalCount = riskyFemales.filter((r) => r.fx > 12.5).length;
	const highCount = riskyFemales.filter((r) => r.fx >= 6.25 && r.fx <= 12.5).length;
	const moderateCount = riskyFemales.filter((r) => r.fx > 3.125 && r.fx < 6.25).length;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '8px',
					border: '1px solid',
					borderColor: 'divider',
					boxShadow: '0 10px 35px rgba(0,0,0,0.2)'
				}
			}}
		>
			{/* Dialog Header */}
			<DialogTitle
				sx={{
					p: 2.5,
					borderBottom: 1,
					borderColor: 'divider',
					bgcolor: 'background.paper'
				}}
			>
				<Stack direction="row" spacing={2} alignItems="center">
					<Avatar
						sx={{
							bgcolor: alpha('#d97706', 0.12),
							color: '#d97706',
							width: 40,
							height: 40
						}}
					>
						<FuseSvgIcon size={22}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
					</Avatar>
					<Box>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.68rem' }}>
							Auditoría Genética Preventiva
						</Typography>
						<Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
							Vientres con Consanguinidad Detectados ({riskyFemales.length})
						</Typography>
					</Box>
				</Stack>
			</DialogTitle>

			<DialogContent sx={{ p: 3, bgcolor: isDark ? 'grey.950' : '#fafafa' }}>
				<Stack spacing={2.5}>
					{/* KPIs Ribbon */}
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
							gap: 1.5
						}}
					>
						<Box
							sx={{
								p: 1.5,
								borderRadius: '8px',
								border: '1px solid',
								borderColor: 'divider',
								bgcolor: 'background.paper'
							}}
						>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
								Peligro Crítico ($F_X &gt; 12.5\%$)
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 700, color: '#dc2626', mt: 0.3 }}>
								{criticalCount}{' '}
								<span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'gray' }}>
									(Padre $\times$ Hija)
								</span>
							</Typography>
						</Box>

						<Box
							sx={{
								p: 1.5,
								borderRadius: '8px',
								border: '1px solid',
								borderColor: 'divider',
								bgcolor: 'background.paper'
							}}
						>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
								Alerta Alta ($6.25\% - 12.5\%$)
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 700, color: '#ea580c', mt: 0.3 }}>
								{highCount}{' '}
								<span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'gray' }}>
									(Medio Hermanos)
								</span>
							</Typography>
						</Box>

						<Box
							sx={{
								p: 1.5,
								borderRadius: '8px',
								border: '1px solid',
								borderColor: 'divider',
								bgcolor: 'background.paper'
							}}
						>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>
								Moderada ($3.1\% - 6.25\%$)
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 700, color: '#ca8a04', mt: 0.3 }}>
								{moderateCount}{' '}
								<span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'gray' }}>
									(Primos)
								</span>
							</Typography>
						</Box>
					</Box>

					{/* Bibliographical / Agronomic Insight Box */}
					<Box
						sx={{
							p: 2,
							borderRadius: '6px',
							border: '1px solid',
							borderColor: 'divider',
							bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff'
						}}
					>
						<Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#b45309', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.75 }}>
							<FuseSvgIcon size={16}>heroicons-outline:light-bulb</FuseSvgIcon>
							Impacto en el Rodeo y Autonomía de Manejo:
						</Typography>
						<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', lineHeight: 1.5 }}>
							Según el Dr. Jorge Carrillo (*Manejo de un Rodeo de Cría*, Cap. XV), el apareamiento entre animales emparentados produce <strong>depresión endogámica</strong> (merma de 5 a 15 kg al destete, menor vigor al nacimiento y riesgo en futuras vaquillonas de reposición).
						</Typography>
						<Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 1, fontStyle: 'italic' }}>
							Si no cuenta con reproductores alternativos en el establecimiento, puede optar por <strong>aceptar el riesgo y generar la orden</strong>, o bien <strong>excluir automáticamente estos vientres</strong> con el botón recomendado.
						</Typography>
					</Box>

					{/* Detailed Risky Females Table */}
					<Box
						sx={{
							border: 1,
							borderColor: 'divider',
							borderRadius: '6px',
							overflow: 'hidden',
							bgcolor: 'background.paper'
						}}
					>
						<TableContainer sx={{ maxHeight: 220 }}>
							<Table size="small" stickyHeader>
								<TableHead>
									<TableRow sx={{ bgcolor: isDark ? 'grey.900' : 'grey.100' }}>
										<TableCell sx={{ fontWeight: 600, fontSize: '0.72rem' }}>Caravana Vientre</TableCell>
										<TableCell sx={{ fontWeight: 600, fontSize: '0.72rem' }}>Semental Involucrado</TableCell>
										<TableCell sx={{ fontWeight: 600, fontSize: '0.72rem' }}>Consanguinidad ($F_X$)</TableCell>
										<TableCell sx={{ fontWeight: 600, fontSize: '0.72rem' }}>Ancestros Compartidos</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{riskyFemales.map((pair, idx) => {
										const isCritical = pair.fx > 12.5;
										return (
											<TableRow
												key={idx}
												sx={{
													bgcolor: isCritical
														? isDark ? 'rgba(239, 68, 68, 0.05)' : '#fef2f2'
														: isDark ? 'rgba(245, 158, 11, 0.04)' : '#fffbeb'
												}}
											>
												<TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem', color: 'primary.main' }}>
													#{pair.female.identification} ({pair.female.category || 'Vientre'})
												</TableCell>
												<TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
													{pair.sireDesc}
												</TableCell>
												<TableCell>
													<Chip
														size="small"
														label={`${pair.fx}% — ${isCritical ? 'Crítico' : 'Alto Riesgo'}`}
														sx={{
															fontWeight: 600,
															fontSize: '0.68rem',
															height: 20,
															bgcolor: alpha(isCritical ? '#ef4444' : '#f97316', 0.12),
															color: isCritical ? '#dc2626' : '#ea580c'
														}}
													/>
												</TableCell>
												<TableCell sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
													{pair.commonAncestors.length > 0 ? pair.commonAncestors.join(', ') : 'Línea parental directa'}
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				</Stack>
			</DialogContent>

			{/* Dialog Actions */}
			<DialogActions
				sx={{
					px: 3,
					py: 2,
					justifyContent: 'space-between',
					borderTop: 1,
					borderColor: 'divider',
					flexWrap: 'wrap',
					gap: 1.5
				}}
			>
				<Button
					variant="text"
					onClick={onClose}
					disabled={isSubmitting}
					sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
				>
					Volver y Modificar
				</Button>

				<Stack direction="row" spacing={1.5}>
					<Button
						variant="outlined"
						color="warning"
						onClick={onConfirmWithAll}
						disabled={isSubmitting}
						sx={{ textTransform: 'none', fontWeight: 600 }}
					>
						Crear Orden de Todos Modos (Aceptar Riesgo)
					</Button>

					<Button
						variant="contained"
						color="primary"
						onClick={onExcludeAndConfirm}
						disabled={isSubmitting}
						startIcon={<FuseSvgIcon size={16}>heroicons-outline:shield-check</FuseSvgIcon>}
						sx={{
							textTransform: 'none',
							fontWeight: 600,
							px: 2.5,
							bgcolor: '#0a6ed1',
							'&:hover': { bgcolor: '#0854a0' }
						}}
					>
						Excluir {riskyFemales.length} en Riesgo y Crear Orden
					</Button>
				</Stack>
			</DialogActions>
		</Dialog>
	);
}
