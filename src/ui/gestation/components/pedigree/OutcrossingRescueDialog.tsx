import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
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
	TextField,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	Checkbox,
	CircularProgress,
	Alert,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Tooltip,
	useTheme,
	Chip,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { PedigreeRecord } from '@/core/caravans/domain/services/pedigreeAnalysis';
import {
	analyzeRescueSiresForFemales,
	RescueBullEvaluation,
} from '@/core/caravans/domain/services/outcrossingRescueAnalysis';
import { useBatches } from '@/features/batches/hooks/useBatches';
import { useCreateServiceOrder } from '@/features/gestation/hooks/useServiceOrders';

interface OutcrossingRescueDialogProps {
	open: boolean;
	onClose: () => void;
	selectedFemaleRecords: PedigreeRecord[];
	allCaravans: Caravan[];
	onSuccess?: () => void;
}

export default function OutcrossingRescueDialog({
	open,
	onClose,
	selectedFemaleRecords,
	allCaravans,
	onSuccess,
}: OutcrossingRescueDialogProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const navigate = useNavigate();

	// SAP Fiori Horizon palette tokens
	const accent = isDark ? '#3582e8' : '#0a6ed1';
	const accentHover = isDark ? '#0a6ed1' : '#0854a0';
	const accentSoft = isDark ? 'rgba(10, 110, 209, 0.15)' : '#eff6ff';
	const borders = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
	const headerBg = isDark ? '#1e293b' : '#f8fafc';
	const neutralSurface = isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc';
	const positive = isDark ? '#34d399' : '#107e3e';
	const warning = isDark ? '#fb923c' : '#e6600d';
	const negative = isDark ? '#f87171' : '#bb0000';

	// 1. Data hooks
	const { data: batches = [] } = useBatches();
	const createOrderMutation = useCreateServiceOrder();

	// 2. State
	const [serviceType, setServiceType] = useState<'single' | 'multi' | 'rotation'>('single');
	const [selectedBullIds, setSelectedBullIds] = useState<number[]>([]);
	const [selectedBatchId, setSelectedBatchId] = useState<number | ''>('');
	const [orderCode, setOrderCode] = useState<string>('');
	const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
	const [observations, setObservations] = useState<string>(
		'[RESCATE EXOGÁMICO - GARANTÍA Fx 0.0%] Servicio planificado para eliminar consanguinidad previa y restaurar heterosis máxima.'
	);

	// Map of all caravans
	const caravansMap = useMemo(() => {
		const map = new Map<number, Caravan>();
		allCaravans.forEach((c) => map.set(c.id, c));
		return map;
	}, [allCaravans]);

	// Filter available bulls from all caravans
	const availableBulls = useMemo(() => {
		return allCaravans.filter((c) => c.sex === 'M' && (c.category || '').toLowerCase() === 'toro');
	}, [allCaravans]);

	// Extract selected female IDs
	const femaleIds = useMemo(() => {
		return selectedFemaleRecords.map((r) => r.id);
	}, [selectedFemaleRecords]);

	// Run genetic analysis to find pure outcrossing rescue bulls
	const rescueAnalysis = useMemo(() => {
		return analyzeRescueSiresForFemales(femaleIds, availableBulls, caravansMap);
	}, [femaleIds, availableBulls, caravansMap]);

	// Auto-select the first pure rescue bull by default
	useEffect(() => {
		if (rescueAnalysis.pureRescueBulls.length > 0 && selectedBullIds.length === 0) {
			setSelectedBullIds([rescueAnalysis.pureRescueBulls[0].bull.id]);
		}
	}, [rescueAnalysis.pureRescueBulls, selectedBullIds.length]);

	// Auto-generate code when dialog opens
	useEffect(() => {
		if (open) {
			const randomSuffix = Math.floor(1000 + Math.random() * 9000);
			setOrderCode(`RESCUE-FX0-${randomSuffix}`);
			if (batches.length > 0 && selectedBatchId === '') {
				setSelectedBatchId(batches[0].id);
			}
		}
	}, [open, batches, selectedBatchId]);

	// Handlers
	const handleToggleBull = (bullId: number) => {
		if (serviceType === 'single') {
			setSelectedBullIds([bullId]);
		} else {
			if (selectedBullIds.includes(bullId)) {
				setSelectedBullIds(selectedBullIds.filter((id) => id !== bullId));
			} else {
				setSelectedBullIds([...selectedBullIds, bullId]);
			}
		}
	};

	const handleCreateOrder = async () => {
		if (!selectedBatchId) {
			toast.error('Debe seleccionar un lote destino de servicio');
			return;
		}

		if (selectedBullIds.length === 0) {
			toast.error('Debe seleccionar al menos un toro de rescate');
			return;
		}

		if (femaleIds.length === 0) {
			toast.error('No hay vientres seleccionados para el rescate');
			return;
		}

		try {
			// Build individual female-sire assignments if single or controlled service
			const assignments = femaleIds.map((fId) => ({
				female_caravan_id: fId,
				assigned_male_caravan_id: selectedBullIds[0],
			}));

			await createOrderMutation.mutateAsync({
				batch_id: Number(selectedBatchId),
				code: orderCode.trim() || `RESCUE-${Date.now()}`,
				planned_start_date: startDate,
				observations: observations.trim(),
				male_caravan_ids: selectedBullIds,
				female_caravan_ids: femaleIds,
				service_type: serviceType,
				is_controlled_service: serviceType === 'single',
				female_sire_assignments: assignments,
			});

			toast.success(`Orden de Rescate Exogámico "${orderCode}" creada exitosamente`);
			if (onSuccess) onSuccess();
			onClose();
		} catch (error: any) {
			console.error('Error creating rescue service order:', error);
			const msg = error.response?.data?.message || 'Error al crear la orden de rescate exogámico';
			toast.error(msg);
		}
	};

	const handleOpenInAdvancedCreator = () => {
		navigate('/gestation/bull-rotation?action=create', {
			state: {
				preselectedFemaleIds: femaleIds,
				preselectedSireIds: selectedBullIds,
				serviceType,
				isRescueMode: true,
			},
		});
		onClose();
	};

	const getInbreedingStatus = (fx: number) => {
		if (fx > 12.5) {
			return {
				label: 'Crítico',
				color: isDark ? '#f87171' : '#bb0000',
				bg: isDark ? 'rgba(187, 0, 0, 0.18)' : '#fbebeb',
				border: isDark ? 'rgba(187, 0, 0, 0.35)' : '#f5c6c6',
			};
		}
		if (fx >= 6.25) {
			return {
				label: 'Alto',
				color: isDark ? '#fb923c' : '#e6600d',
				bg: isDark ? 'rgba(230, 96, 13, 0.15)' : '#fff3e0',
				border: isDark ? 'rgba(230, 96, 13, 0.3)' : '#ffe0b2',
			};
		}
		return {
			label: 'Seguro',
			color: isDark ? '#34d399' : '#107e3e',
			bg: isDark ? 'rgba(16, 126, 62, 0.15)' : '#e7f6ec',
			border: isDark ? 'rgba(16, 126, 62, 0.3)' : '#b0e4c1',
		};
	};

	const headerCellStyle = {
		py: 1.25,
		px: 1.5,
		fontSize: '0.7rem',
		fontWeight: 700,
		textTransform: 'uppercase' as const,
		color: isDark ? '#94a3b8' : '#475569',
		borderBottom: '1px solid',
		borderRight: '1px solid',
		borderColor: borders,
		whiteSpace: 'nowrap' as const,
		letterSpacing: '0.04em',
		bgcolor: headerBg,
	};

	const bodyCellStyle = {
		px: 1.5,
		py: 1,
		borderRight: '1px solid',
		borderBottom: '1px solid',
		borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
	};

	return (
		<Dialog
			open={open}
			onClose={createOrderMutation.isPending ? undefined : onClose}
			maxWidth="lg"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '8px',
					border: `1px solid ${borders}`,
					boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)',
					bgcolor: 'background.paper',
					overflow: 'hidden',
				},
			}}
		>
			{/* Dialog Header */}
			<DialogTitle
				sx={{
					p: 2.5,
					borderBottom: `1px solid ${borders}`,
					bgcolor: headerBg,
				}}
			>
				<Stack direction="row" spacing={1.5} alignItems="center">
					
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.25 }}>
							Planificar Orden de Servicio de Rescate Exogámico
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
							{femaleIds.length} vientres · Garantía Fx = 0.0% · Zootecnia & Genética de Poblaciones
						</Typography>
					</Box>
				</Stack>
			</DialogTitle>

			<DialogContent sx={{ p: 3, bgcolor: 'background.paper' }}>
				<Stack spacing={2.5}>
					{/* SAP Fiori MessageStrip: Scientific Explanation Banner */}
					<Box
						sx={{
							p: 2,
							borderRadius: '6px',
							border: '1px solid',
							borderColor: isDark ? 'rgba(10, 110, 209, 0.3)' : '#bfdbfe',
							borderLeft: `4px solid ${accent}`,
							bgcolor: accentSoft,
						}}
					>
						<Stack direction="row" spacing={1.5} alignItems="flex-start">
							<Box sx={{ color: accent, display: 'flex', mt: 0.25 }}>
								<FuseSvgIcon size={20}>heroicons-outline:information-circle</FuseSvgIcon>
							</Box>
							<Box>
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: accent, mb: 0.5 }}>
									Principio de Rescate y Heterosis Máxima (Carrillo, Caps. XV-XVI)
								</Typography>
								<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', lineHeight: 1.5 }}>
									Al aparear vientres con consanguinidad previa con un reproductor que no comparte ningún ancestro común,
									toda la descendencia nace con{' '}
									<strong style={{ color: accent, fontWeight: 700 }}>Fx = 0.0% (exogamia pura)</strong>. Se enmascaran los
									alelos deletéreos recesivos y se restablece el 100% del vigor híbrido (ganancia de peso y fertilidad).
								</Typography>
							</Box>
						</Stack>
					</Box>

					{/* Step 1: Selected Females Overview */}
					<Accordion
						defaultExpanded
						elevation={0}
						disableGutters
						sx={{
							border: `1px solid ${borders}`,
							borderRadius: '6px',
							overflow: 'hidden',
							bgcolor: 'background.paper',
							'&:before': { display: 'none' },
						}}
					>
						<AccordionSummary
							expandIcon={<FuseSvgIcon size={18}>heroicons-outline:chevron-down</FuseSvgIcon>}
							sx={{ bgcolor: headerBg, '& .Mui-expandIconWrapper': { color: 'text.secondary' } }}
						>
							<Stack direction="row" spacing={1.5} alignItems="baseline">
								<Typography variant="caption" sx={{ color: accent, fontWeight: 800, letterSpacing: '0.06em' }}>
									PASO 1
								</Typography>
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
									Vientres seleccionados para el entore de rescate ({femaleIds.length})
								</Typography>
							</Stack>
						</AccordionSummary>
						<AccordionDetails sx={{ p: 0 }}>
							<TableContainer sx={{ maxHeight: 180 }}>
								<Table size="small" stickyHeader sx={{ borderCollapse: 'collapse' }}>
									<TableHead>
										<TableRow>
											<TableCell key="h-caravana" sx={headerCellStyle}>
												Caravana
											</TableCell>
											<TableCell key="h-categoria" sx={headerCellStyle}>
												Categoría
											</TableCell>
											<TableCell key="h-raza" sx={headerCellStyle}>
												Raza
											</TableCell>
											<TableCell key="h-lote" sx={headerCellStyle}>
												Lote actual
											</TableCell>
											<TableCell key="h-fx" sx={{ ...headerCellStyle, borderRight: 0 }}>
												Consanguinidad de la madre (Fx)
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{selectedFemaleRecords.map((f, idx) => {
											const fxStatus = getInbreedingStatus(f.inbreedingCoefficient);
											return (
												<TableRow key={f.id} hover sx={{ bgcolor: idx % 2 === 1 ? neutralSurface : 'inherit' }}>
													<TableCell sx={{ ...bodyCellStyle, fontFamily: 'monospace', fontWeight: 700, color: 'text.primary' }}>
														#{f.identification}
													</TableCell>
													<TableCell sx={{ ...bodyCellStyle, textTransform: 'capitalize', fontSize: '0.75rem' }}>
														{f.category}
													</TableCell>
													<TableCell sx={{ ...bodyCellStyle, fontSize: '0.75rem' }}>{f.breed}</TableCell>
													<TableCell sx={{ ...bodyCellStyle, fontSize: '0.75rem', color: 'text.secondary' }}>
														{f.batchName}
													</TableCell>
													<TableCell sx={{ ...bodyCellStyle, borderRight: 0 }}>
														<Chip
															size="small"
															label={`${f.inbreedingCoefficient}% — ${fxStatus.label}`}
															sx={{
																fontWeight: 700,
																fontSize: '0.72rem',
																height: 22,
																borderRadius: '4px',
																bgcolor: fxStatus.bg,
																color: fxStatus.color,
																border: '1px solid',
																borderColor: fxStatus.border,
															}}
														/>
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</TableContainer>
						</AccordionDetails>
					</Accordion>

					{/* Step 2: Compatible Pure Rescue Bulls (Fx = 0.0%) */}
					<Accordion
						defaultExpanded
						elevation={0}
						disableGutters
						sx={{
							border: `1px solid ${borders}`,
							borderRadius: '6px',
							overflow: 'hidden',
							bgcolor: 'background.paper',
							'&:before': { display: 'none' },
						}}
					>
						<AccordionSummary
							expandIcon={<FuseSvgIcon size={18}>heroicons-outline:chevron-down</FuseSvgIcon>}
							sx={{ bgcolor: headerBg, '& .Mui-expandIconWrapper': { color: 'text.secondary' } }}
						>
							<Stack direction="row" spacing={1.5} alignItems="baseline">
								<Typography variant="caption" sx={{ color: accent, fontWeight: 800, letterSpacing: '0.06em' }}>
									PASO 2
								</Typography>
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
									Selección de reproductores compatibles ({rescueAnalysis.pureRescueBulls.length})
								</Typography>
							</Stack>
						</AccordionSummary>
						<AccordionDetails sx={{ p: 2 }}>
							<Stack spacing={2}>
								{/* Service Type Switcher */}
								<Stack direction="row" spacing={2} flexWrap="wrap">
									<RadioGroup
										row
										value={serviceType}
										onChange={(e) => {
											const val = e.target.value as 'single' | 'multi' | 'rotation';
											setServiceType(val);
											if (val === 'single' && selectedBullIds.length > 1) {
												setSelectedBullIds([selectedBullIds[0]]);
											}
										}}
									>
										<FormControlLabel
											value="single"
											control={<Radio size="small" />}
											label={
												<Typography variant="body2" sx={{ fontWeight: 600 }}>
													Servicio dirigido / individual (1 toro exogámico)
												</Typography>
											}
										/>
										<FormControlLabel
											value="rotation"
											control={<Radio size="small" />}
											label={
												<Typography variant="body2" sx={{ fontWeight: 600 }}>
													Rotación de toros (batería colectiva)
												</Typography>
											}
										/>
									</RadioGroup>
								</Stack>

								{/* Pure Rescue Bulls List */}
								{rescueAnalysis.pureRescueBulls.length > 0 ? (
									<Box
										sx={{
											display: 'grid',
											gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
											gap: 1.5,
										}}
									>
										{rescueAnalysis.pureRescueBulls.map((evalItem) => {
											const bull = evalItem.bull;
											const isSelected = selectedBullIds.includes(bull.id);

											return (
												<Paper
													key={bull.id}
													elevation={0}
													onClick={() => handleToggleBull(bull.id)}
													sx={{
														p: 1.75,
														borderRadius: '6px',
														border: '1px solid',
														borderColor: isSelected ? accent : borders,
														bgcolor: isSelected ? accentSoft : (isDark ? '#1e293b' : '#ffffff'),
														cursor: 'pointer',
														transition: 'all 0.15s ease-in-out',
														boxShadow: isSelected ? '0 2px 8px rgba(10, 110, 209, 0.15)' : 'none',
														'&:hover': {
															borderColor: accent,
															bgcolor: isSelected ? accentSoft : (isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
														},
													}}
												>
													<Stack spacing={1}>
														<Stack direction="row" justifyContent="space-between" alignItems="center">
															<Stack direction="row" spacing={1} alignItems="center">
																{serviceType === 'single' ? (
																	<Radio checked={isSelected} size="small" sx={{ p: 0 }} />
																) : (
																	<Checkbox checked={isSelected} size="small" sx={{ p: 0 }} />
																)}
																<Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'text.primary', fontSize: '0.9rem' }}>
																	#{bull.identification}
																</Typography>
															</Stack>
															<Box
																sx={{
																	px: 1,
																	py: 0.25,
																	borderRadius: '4px',
																	fontSize: '0.72rem',
																	fontWeight: 700,
																	bgcolor: isDark ? 'rgba(16, 126, 62, 0.15)' : '#e7f6ec',
																	color: positive,
																	border: '1px solid',
																	borderColor: isDark ? 'rgba(16, 126, 62, 0.3)' : '#b0e4c1',
																}}
															>
																Fx 0.0%
															</Box>
														</Stack>

														<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 500 }}>
															{bull.breed || 'Sin raza'} • {bull.teeth !== undefined ? `${bull.teeth}D` : '—'} •{' '}
															{bull.entry_weight ? `${bull.entry_weight} kg` : '—'}
														</Typography>

														<Typography variant="caption" sx={{ color: positive, fontWeight: 700 }}>
															100% exogamia • Heterosis total
														</Typography>
													</Stack>
												</Paper>
											);
										})}
									</Box>
								) : (
									<Alert severity="warning" variant="outlined" sx={{ borderRadius: '6px' }}>
										No se encontraron toros en el rodeo que tengan 100% de exogamia (Fx = 0.0%) con todas las
										hembras seleccionadas simultáneamente. Se recomienda usar la opción de{' '}
										<strong>servicio individual</strong> o adquirir un reproductor externo.
									</Alert>
								)}
							</Stack>
						</AccordionDetails>
					</Accordion>

					{/* Step 3: Service Parameters */}
					<Accordion
						defaultExpanded
						elevation={0}
						disableGutters
						sx={{
							border: `1px solid ${borders}`,
							borderRadius: '6px',
							overflow: 'hidden',
							bgcolor: 'background.paper',
							'&:before': { display: 'none' },
						}}
					>
						<AccordionSummary
							expandIcon={<FuseSvgIcon size={18}>heroicons-outline:chevron-down</FuseSvgIcon>}
							sx={{ bgcolor: headerBg, '& .Mui-expandIconWrapper': { color: 'text.secondary' } }}
						>
							<Stack direction="row" spacing={1.5} alignItems="baseline">
								<Typography variant="caption" sx={{ color: accent, fontWeight: 800, letterSpacing: '0.06em' }}>
									PASO 3
								</Typography>
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
									Lote destino y trazabilidad de la orden
								</Typography>
							</Stack>
						</AccordionSummary>
						<AccordionDetails sx={{ p: 2 }}>
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
									gap: 2,
								}}
							>
								<TextField
									id="rescue-order-code"
									label="Código de orden"
									variant="outlined"
									size="small"
									fullWidth
									value={orderCode}
									onChange={(e) => setOrderCode(e.target.value)}
									disabled={createOrderMutation.isPending}
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: '6px',
											bgcolor: isDark ? '#0f172a' : '#f8fafc',
										},
									}}
								/>

								<TextField
									id="rescue-start-date"
									label="Fecha planificada de inicio"
									variant="outlined"
									type="date"
									size="small"
									fullWidth
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									InputLabelProps={{ shrink: true }}
									disabled={createOrderMutation.isPending}
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: '6px',
											bgcolor: isDark ? '#0f172a' : '#f8fafc',
										},
									}}
								/>

								<FormControl size="small" fullWidth>
									<InputLabel>Lote destino del entore</InputLabel>
									<Select
										id="rescue-destination-batch"
										variant="outlined"
										label="Lote destino del entore"
										value={selectedBatchId}
										onChange={(e) => setSelectedBatchId(Number(e.target.value))}
										disabled={createOrderMutation.isPending}
										sx={{
											borderRadius: '6px',
											bgcolor: isDark ? '#0f172a' : '#f8fafc',
										}}
									>
										{batches.map((b) => (
											<MenuItem key={b.id} value={b.id}>
												{b.name} ({b.batch_type_name || 'Lote'})
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>

							<Box sx={{ mt: 2 }}>
								<TextField
									id="rescue-observations"
									label="Observaciones / justificación"
									variant="outlined"
									multiline
									rows={2}
									size="small"
									fullWidth
									value={observations}
									onChange={(e) => setObservations(e.target.value)}
									disabled={createOrderMutation.isPending}
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: '6px',
											bgcolor: isDark ? '#0f172a' : '#f8fafc',
										},
									}}
								/>
							</Box>
						</AccordionDetails>
					</Accordion>
				</Stack>
			</DialogContent>

			{/* Dialog Actions */}
			<DialogActions
				sx={{
					px: 3,
					py: 2,
					borderTop: `1px solid ${borders}`,
					bgcolor: headerBg,
				}}
			>
				<Stack direction="row" spacing={1.5} sx={{ width: '100%', justifyContent: 'flex-end' }}>
					<Button
						variant="text"
						onClick={onClose}
						disabled={createOrderMutation.isPending}
						sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
					>
						Cancelar
					</Button>

					<Button
						variant="outlined"
						color="inherit"
						onClick={handleOpenInAdvancedCreator}
						disabled={createOrderMutation.isPending}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:adjustments-horizontal</FuseSvgIcon>}
						sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '6px', borderColor: borders }}
					>
						Abrir en creador avanzado
					</Button>

					<Button
						variant="contained"
						onClick={handleCreateOrder}
						disabled={createOrderMutation.isPending || selectedBullIds.length === 0 || !selectedBatchId}
						startIcon={
							createOrderMutation.isPending ? (
								<CircularProgress size={16} color="inherit" />
							) : (
								<FuseSvgIcon size={18}>heroicons-outline:check-circle</FuseSvgIcon>
							)
						}
						sx={{
							textTransform: 'none',
							fontWeight: 700,
							borderRadius: '6px',
							px: 3,
							bgcolor: accent,
							color: '#ffffff',
							boxShadow: '0 2px 4px rgba(10, 110, 209, 0.25)',
							'&:hover': { bgcolor: accentHover, boxShadow: '0 4px 8px rgba(10, 110, 209, 0.35)' },
							'&.Mui-disabled': { bgcolor: isDark ? 'rgba(53, 130, 232, 0.35)' : 'rgba(10, 110, 209, 0.3)', color: 'rgba(255,255,255,0.8)' },
						}}
					>
						{createOrderMutation.isPending
							? 'Creando orden...'
							: `Crear orden de rescate (${selectedBullIds.length} toro${selectedBullIds.length !== 1 ? 's' : ''} / ${femaleIds.length} vientres)`}
					</Button>
				</Stack>
			</DialogActions>
		</Dialog>
	);
}