import { useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Stack,
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	Avatar,
	TextField,
	CircularProgress,
	useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { PedigreeRecord } from '@/core/caravans/domain/services/pedigreeAnalysis';

interface IsolateToReserveDialogProps {
	open: boolean;
	onClose: () => void;
	selectedRecords: PedigreeRecord[];
	onConfirm: (reason: string) => Promise<void>;
	isSubmitting?: boolean;
}

export default function IsolateToReserveDialog({
	open,
	onClose,
	selectedRecords,
	onConfirm,
	isSubmitting = false,
}: IsolateToReserveDialogProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	const [reason, setReason] = useState<string>(
		'Apartado preventivo por consanguinidad / evaluación zootécnica desde Pedigree'
	);

	const criticalCount = selectedRecords.filter((r) => r.inbreedingCoefficient > 12.5).length;
	const alertCount = selectedRecords.filter(
		(r) => r.inbreedingCoefficient >= 6.25 && r.inbreedingCoefficient <= 12.5
	).length;
	const optimalCount = selectedRecords.filter((r) => r.inbreedingCoefficient < 3.125).length;

	const handleConfirm = async () => {
		await onConfirm(reason.trim());
	};

	return (
		<Dialog
			open={open}
			onClose={isSubmitting ? undefined : onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '8px',
					border: '1px solid',
					borderColor: 'divider',
					boxShadow: '0 10px 35px rgba(0,0,0,0.2)',
				},
			}}
		>
			{/* Dialog Header */}
			<DialogTitle
				sx={{
					p: 2.5,
					borderBottom: 1,
					borderColor: 'divider',
					bgcolor: isDark ? 'background.paper' : '#f5f3ff',
				}}
			>
				<Stack direction="row" spacing={2} alignItems="center">
					<Avatar
						sx={{
							bgcolor: '#6366f1',
							color: '#ffffff',
							width: 44,
							height: 44,
						}}
					>
						<FuseSvgIcon size={24}>heroicons-outline:archive-box</FuseSvgIcon>
					</Avatar>
					<Box>
						<Typography
							variant="caption"
							sx={{ color: '#4f46e5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}
						>
							Estructura Organizacional del Sistema
						</Typography>
						<Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
							Apartar Animales al Lote Reserva ({selectedRecords.length})
						</Typography>
					</Box>
				</Stack>
			</DialogTitle>

			<DialogContent sx={{ p: 3, bgcolor: isDark ? 'grey.950' : '#fafafa' }}>
				<Stack spacing={2.5}>
					{/* System Info Banner */}
					<Paper
						elevation={0}
						sx={{
							p: 2,
							borderRadius: '6px',
							border: '1px solid',
							borderColor: '#c7d2fe',
							bgcolor: isDark ? 'rgba(99, 102, 241, 0.1)' : '#eef2ff',
							borderLeft: '4px solid #6366f1',
						}}
					>
						<Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#3730a3', mb: 0.5 }}>
							🏷️ Destino: Lote Reserva | Animales Apartados
						</Typography>
						<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', lineHeight: 1.5 }}>
							Este es un <strong>lote protegido del sistema</strong>. Los animales transferidos saldrán de sus lotes operativos actuales y quedarán aislados en reserva para evitar servicios no deseados, engorde, o destino a faena.
						</Typography>
					</Paper>

					{/* Summary KPIs */}
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
							gap: 1.5,
						}}
					>
						<Paper
							elevation={0}
							sx={{
								p: 1.5,
								borderRadius: '6px',
								border: '1px solid',
								borderColor: '#fca5a5',
								bgcolor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
							}}
						>
							<Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
								Consanguinidad Crítica (&gt;12.5%)
							</Typography>
							<Typography variant="h6" sx={{ fontWeight: 900, color: '#991b1b', mt: 0.2 }}>
								{criticalCount} <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'gray' }}>animales</span>
							</Typography>
						</Paper>

						<Paper
							elevation={0}
							sx={{
								p: 1.5,
								borderRadius: '6px',
								border: '1px solid',
								borderColor: '#fed7aa',
								bgcolor: isDark ? 'rgba(249, 115, 22, 0.1)' : '#fff7ed',
							}}
						>
							<Typography variant="caption" sx={{ color: '#9a3412', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
								Alerta Alta (6.25% - 12.5%)
							</Typography>
							<Typography variant="h6" sx={{ fontWeight: 900, color: '#9a3412', mt: 0.2 }}>
								{alertCount} <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'gray' }}>animales</span>
							</Typography>
						</Paper>

						<Paper
							elevation={0}
							sx={{
								p: 1.5,
								borderRadius: '6px',
								border: '1px solid',
								borderColor: '#bbf7d0',
								bgcolor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4',
							}}
						>
							<Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.65rem' }}>
								Otros / Reserva
							</Typography>
							<Typography variant="h6" sx={{ fontWeight: 900, color: '#166534', mt: 0.2 }}>
								{selectedRecords.length - criticalCount - alertCount} <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'gray' }}>animales</span>
							</Typography>
						</Paper>
					</Box>

					{/* Selected Animals List */}
					<Paper
						elevation={0}
						sx={{
							border: 1,
							borderColor: 'divider',
							borderRadius: '6px',
							overflow: 'hidden',
							bgcolor: 'background.paper',
						}}
					>
						<TableContainer sx={{ maxHeight: 200 }}>
							<Table size="small" stickyHeader>
								<TableHead>
									<TableRow sx={{ bgcolor: isDark ? 'grey.900' : 'grey.100' }}>
										<TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>Caravana</TableCell>
										<TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>Categoría / Sexo</TableCell>
										<TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>Lote Actual</TableCell>
										<TableCell sx={{ fontWeight: 800, fontSize: '0.72rem' }}>Consanguinidad ($F_X$)</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{selectedRecords.map((r) => {
										const isCritical = r.inbreedingCoefficient > 12.5;
										const isAlert = r.inbreedingCoefficient >= 6.25 && r.inbreedingCoefficient <= 12.5;

										return (
											<TableRow key={r.id} hover>
												<TableCell sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.8rem', color: 'primary.main' }}>
													#{r.identification}
												</TableCell>
												<TableCell sx={{ fontSize: '0.75rem' }}>
													{r.category} ({r.sex === 'M' ? 'Macho ♂' : 'Hembra ♀'})
												</TableCell>
												<TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
													{r.batchName}
												</TableCell>
												<TableCell>
													<Chip
														size="small"
														label={`${r.inbreedingCoefficient}% — ${
															isCritical ? 'Crítico 🔴' : isAlert ? 'Alto 🟠' : 'Seguro 🟢'
														}`}
														sx={{
															fontWeight: 800,
															fontSize: '0.68rem',
															height: 20,
															bgcolor: isCritical ? '#ef4444' : isAlert ? '#ea580c' : '#22c55e',
															color: '#ffffff',
														}}
													/>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</TableContainer>
					</Paper>

					{/* Reason / Notes TextField */}
					<TextField
						label="Motivo del Apartado / Observaciones de Trazabilidad"
						multiline
						rows={2}
						size="small"
						fullWidth
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						placeholder="Especifique el motivo de aislamiento a reserva (ej. consanguinidad crítica, descarte reproductivo, faena...)"
						disabled={isSubmitting}
					/>
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
				}}
			>
				<Button
					variant="text"
					onClick={onClose}
					disabled={isSubmitting}
					sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
				>
					Cancelar
				</Button>

				<Button
					variant="contained"
					color="primary"
					onClick={handleConfirm}
					disabled={isSubmitting || selectedRecords.length === 0}
					startIcon={
						isSubmitting ? (
							<CircularProgress size={16} color="inherit" />
						) : (
							<FuseSvgIcon size={18}>heroicons-outline:arrow-right-on-rectangle</FuseSvgIcon>
						)
					}
					sx={{
						textTransform: 'none',
						fontWeight: 800,
						px: 3,
						bgcolor: '#6366f1',
						'&:hover': { bgcolor: '#4f46e5' },
					}}
				>
					{isSubmitting
						? 'Apartando y Transfiriendo...'
						: `Confirmar Apartado de ${selectedRecords.length} Animales`}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
