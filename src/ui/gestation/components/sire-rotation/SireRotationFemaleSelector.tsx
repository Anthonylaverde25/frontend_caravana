import {
	Card,
	CardContent,
	Box,
	Typography,
	Stack,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	TextField,
	Chip,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Checkbox,
	Tooltip,
	Paper
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { toast } from 'sonner';

interface Caravan {
	id: number;
	identification: string;
	sex: string;
	category?: string;
	active_gestation?: unknown;
	batch_id?: number | null;
	breed?: string;
	current_weight?: number;
}

interface CategoryCounts {
	all: number;
	vaca: number;
	vaquillona: number;
	vaca_vacia: number;
}

interface SireRotationFemaleSelectorProps {
	selectedBatchId: number | 'all';
	serviceType: 'single' | 'rotation' | 'multi';
	isControlledService: boolean;
	selectedFemaleIds: number[];
	setSelectedFemaleIds: (ids: number[]) => void;
	selectedSireIds: number[];
	availableBulls: Caravan[];
	filteredFemales: Caravan[];
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedCategoryFilter: string;
	setSelectedCategoryFilter: (filter: string) => void;
	categoryCounts: CategoryCounts;
	femaleSireAssignments: Map<number, number>;
	setFemaleSireAssignments: (assignments: Map<number, number>) => void;
	handleSelectFemale: (id: number) => void;
	handleSelectAllFemales: () => void;
	borderStyle: string;
	cellStyle: any;
	tableHeaderStyle: any;
	isDark: boolean;
	cardShadow: string;
}

function SireRotationFemaleSelector({
	selectedBatchId,
	serviceType,
	isControlledService,
	selectedFemaleIds,
	selectedSireIds,
	availableBulls,
	filteredFemales,
	searchQuery,
	setSearchQuery,
	selectedCategoryFilter,
	setSelectedCategoryFilter,
	categoryCounts,
	femaleSireAssignments,
	setFemaleSireAssignments,
	handleSelectFemale,
	handleSelectAllFemales,
	borderStyle,
	cellStyle,
	tableHeaderStyle,
	isDark,
	cardShadow
}: SireRotationFemaleSelectorProps) {
	const getCategoryBadgeStyles = (category: string) => {
		const lowerCategory = (category || '').toLowerCase();
		if (lowerCategory === 'vaca') {
			return {
				bg: isDark ? 'rgba(16, 185, 129, 0.1)' : '#eefbee',
				color: isDark ? '#4ade80' : '#107e3e',
				border: isDark ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid #107e3e',
				label: 'Vaca'
			};
		}
		if (lowerCategory === 'vaquillona') {
			return {
				bg: isDark ? 'rgba(59, 130, 246, 0.1)' : '#f0f4fa',
				color: isDark ? '#60a5fa' : '#0a6ed1',
				border: isDark ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid #0a6ed1',
				label: 'Vaquillona'
			};
		}
		return {
			bg: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fff7e6',
			color: isDark ? '#fbbf24' : '#e97c00',
			border: isDark ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid #e97c00',
			label: 'Vaca Vacía'
		};
	};

	return (
		<Card
			elevation={0}
			sx={{
				borderRadius: '12px',
				border: borderStyle,
				boxShadow: cardShadow,
				overflow: 'hidden',
				background: isDark ? 'rgba(30, 41, 59, 0.4)' : '#ffffff'
			}}
		>
			<CardContent sx={{ p: 0 }}>
				{/* Header inside Card */}
				<Box
					sx={{
						p: 4,
						pb: 2,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						flexWrap: 'wrap',
						gap: 2
					}}
				>
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 2
						}}
					>
						<Box
							sx={{
								color: isDark ? '#60a5fa' : '#2563eb',
								bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.08)',
								p: 1.25,
								borderRadius: '50%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								boxShadow: isDark ? 'inset 0 0 8px rgba(96, 165, 250, 0.1)' : 'none'
							}}
						>
							<FuseSvgIcon size={20}>heroicons-outline:clipboard-document-list</FuseSvgIcon>
						</Box>
						<Box>
							<Typography
								variant="subtitle2"
								sx={{
									fontWeight: 800,
									textTransform: 'uppercase',
									letterSpacing: '1px',
									fontSize: '0.75rem',
									color: isDark ? '#94a3b8' : '#475569',
									lineHeight: 1
								}}
							>
								Paso 3
							</Typography>
							<Typography
								variant="h6"
								sx={{
									fontWeight: 800,
									fontSize: '1.05rem',
									mt: 0.5,
									color: isDark ? '#f8fafc' : '#1e293b',
									lineHeight: 1
								}}
							>
								Selección de Vientres Aptos
							</Typography>
						</Box>
					</Box>

					{selectedBatchId !== 'all' && filteredFemales.length > 0 && (
						<Stack
							direction="row"
							spacing={1.5}
							alignItems="center"
						>
							{serviceType === 'multi' && isControlledService && selectedFemaleIds.length > 0 && selectedSireIds.length > 0 && (
								<FormControl
									size="small"
									variant="outlined"
									sx={{ minWidth: 160 }}
								>
									<InputLabel
										id="bulk-sire-assign-label"
										sx={{ fontSize: '0.75rem' }}
									>
										Asignación Rápida
									</InputLabel>
									<Select
										labelId="bulk-sire-assign-label"
										label="Asignación Rápida"
										value=""
										onChange={(e) => {
											const sireId = Number(e.target.value);
											if (sireId) {
												const newAssignments = new Map(femaleSireAssignments);
												selectedFemaleIds.forEach((femaleId) => {
													newAssignments.set(femaleId, sireId);
												});
												setFemaleSireAssignments(newAssignments);
												toast.info(
													`Vientres asignados al toro #${availableBulls.find((b) => b.id === sireId)?.identification}`
												);
											}
										}}
										sx={{
											height: 32,
											fontSize: '0.75rem',
											borderRadius: '8px',
											bgcolor: 'background.paper',
											'& .MuiSelect-select': { py: 0.75 }
										}}
									>
										{selectedSireIds.map((id) => {
											const bull = availableBulls.find((b) => b.id === id);
											return (
												<MenuItem
													key={id}
													value={id}
													sx={{ fontSize: '0.75rem' }}
												>
													{bull?.identification || `#${id}`}
												</MenuItem>
											);
										})}
									</Select>
								</FormControl>
							)}

							<Button
								variant="outlined"
								size="small"
								onClick={handleSelectAllFemales}
								sx={{
									fontSize: '0.75rem',
									textTransform: 'none',
									borderRadius: '8px',
									fontWeight: 700,
									borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#d1d5db',
									color: 'text.primary',
									height: 32,
									px: 2,
									'&:hover': {
										borderColor: isDark ? '#60a5fa' : '#2563eb',
										bgcolor: isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(37, 99, 235, 0.02)'
									}
								}}
							>
								{selectedFemaleIds.length === filteredFemales.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
							</Button>
						</Stack>
					)}
				</Box>

				{selectedBatchId === 'all' ? (
					<Box
						sx={{
							px: 4,
							pb: 5,
							pt: 3,
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
							textAlign: 'center'
						}}
					>
						<Box sx={{ color: 'text.disabled', mb: 2, opacity: 0.6, display: 'flex' }}>
							<FuseSvgIcon size={44}>heroicons-outline:information-circle</FuseSvgIcon>
						</Box>
						<Typography
							variant="subtitle2"
							color="text.primary"
							sx={{ fontWeight: 700, mb: 0.5 }}
						>
							Seleccione un Lote de Trabajo
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ maxWidth: 320, display: 'block' }}
						>
							Por favor, seleccione un lote de origen en el paso 1 para listar y elegir los vientres disponibles en esta orden.
						</Typography>
					</Box>
				) : (
					<Box sx={{ px: 4, pb: 4, borderRadius: 0 }}>
						{/* Search and Filters Segment */}
						<Stack
							direction={{ xs: 'column', md: 'row' }}
							spacing={2}
							sx={{ mb: 3, mt: 1 }}
						>
							<TextField
								size="small"
								variant="outlined"
								placeholder="Buscar por caravana..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								sx={{
									flexGrow: 1,
									'& .MuiOutlinedInput-root': {
										borderRadius: '8px',
										bgcolor: 'background.paper'
									}
								}}
								InputProps={{
									startAdornment: (
										<Box sx={{ color: 'text.disabled', mr: 1, display: 'flex', alignItems: 'center' }}>
											<FuseSvgIcon size={16}>heroicons-outline:magnifying-glass</FuseSvgIcon>
										</Box>
									)
								}}
							/>

							{/* Quick Category Filters */}
							<Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, alignItems: 'center' }}>
								<Chip
									label={`Todas (${categoryCounts.all})`}
									onClick={() => setSelectedCategoryFilter('all')}
									color={selectedCategoryFilter === 'all' ? 'primary' : 'default'}
									variant={selectedCategoryFilter === 'all' ? 'filled' : 'outlined'}
									size="small"
									sx={{
										fontWeight: 700,
										borderRadius: '16px',
										px: 1,
										bgcolor: selectedCategoryFilter === 'all' ? (isDark ? '#1a56db' : '#2563eb') : 'transparent',
										color: selectedCategoryFilter === 'all' ? '#ffffff' : 'text.secondary'
									}}
								/>
								<Chip
									label={`Vacas (${categoryCounts.vaca})`}
									onClick={() => setSelectedCategoryFilter('vaca')}
									color={selectedCategoryFilter === 'vaca' ? 'primary' : 'default'}
									variant={selectedCategoryFilter === 'vaca' ? 'filled' : 'outlined'}
									size="small"
									sx={{
										fontWeight: 700,
										borderRadius: '16px',
										px: 1,
										bgcolor: selectedCategoryFilter === 'vaca' ? (isDark ? '#1a56db' : '#2563eb') : 'transparent',
										color: selectedCategoryFilter === 'vaca' ? '#ffffff' : 'text.secondary'
									}}
								/>
								<Chip
									label={`Vaquillonas (${categoryCounts.vaquillona})`}
									onClick={() => setSelectedCategoryFilter('vaquillona')}
									color={selectedCategoryFilter === 'vaquillona' ? 'primary' : 'default'}
									variant={selectedCategoryFilter === 'vaquillona' ? 'filled' : 'outlined'}
									size="small"
									sx={{
										fontWeight: 700,
										borderRadius: '16px',
										px: 1,
										bgcolor: selectedCategoryFilter === 'vaquillona' ? (isDark ? '#1a56db' : '#2563eb') : 'transparent',
										color: selectedCategoryFilter === 'vaquillona' ? '#ffffff' : 'text.secondary'
									}}
								/>
								<Chip
									label={`Vacías (${categoryCounts.vaca_vacia})`}
									onClick={() => setSelectedCategoryFilter('vaca_vacia')}
									color={selectedCategoryFilter === 'vaca_vacia' ? 'primary' : 'default'}
									variant={selectedCategoryFilter === 'vaca_vacia' ? 'filled' : 'outlined'}
									size="small"
									sx={{
										fontWeight: 700,
										borderRadius: '16px',
										px: 1,
										bgcolor: selectedCategoryFilter === 'vaca_vacia' ? (isDark ? '#1a56db' : '#2563eb') : 'transparent',
										color: selectedCategoryFilter === 'vaca_vacia' ? '#ffffff' : 'text.secondary'
									}}
								/>
							</Box>
						</Stack>

						{/* Vientres Table */}
						<TableContainer
							component={Paper}
							elevation={0}
							sx={{
								maxHeight: 380,
								borderRadius: '8px',
								border: borderStyle,
								overflow: 'auto',
								bgcolor: isDark ? 'rgba(0, 0, 0, 0.15)' : '#ffffff'
							}}
						>
							<Table
								size="small"
								stickyHeader
								sx={{ borderCollapse: 'collapse', borderRadius: 0 }}
							>
								<TableHead>
									<TableRow>
										<TableCell
											sx={{ ...tableHeaderStyle, width: 60 }}
											align="center"
										>
											<Checkbox
												size="small"
												indeterminate={selectedFemaleIds.length > 0 && selectedFemaleIds.length < filteredFemales.length}
												checked={filteredFemales.length > 0 && selectedFemaleIds.length === filteredFemales.length}
												onChange={handleSelectAllFemales}
												sx={{ p: 0, borderRadius: '4px' }}
											/>
										</TableCell>
										<TableCell sx={tableHeaderStyle}>Caravana</TableCell>
										{serviceType === 'multi' && isControlledService && (
											<TableCell sx={tableHeaderStyle}>Toro Asignado</TableCell>
										)}
										<TableCell sx={tableHeaderStyle}>Categoría</TableCell>
										<TableCell sx={tableHeaderStyle}>Raza</TableCell>
										<TableCell
											sx={{ ...tableHeaderStyle, borderRight: 0 }}
											align="right"
										>
											Peso Act.
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{filteredFemales.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={serviceType === 'multi' && isControlledService ? 6 : 5}
												align="center"
												sx={{ py: 6, color: 'text.disabled', fontStyle: 'italic', fontSize: '0.8rem' }}
											>
												{searchQuery || selectedCategoryFilter !== 'all'
													? 'No se encontraron vientres con ese criterio de búsqueda o filtro.'
													: 'No hay vientres aptos disponibles en este lote (vacías, sin preñez activa).'}
											</TableCell>
										</TableRow>
									) : (
										filteredFemales.map((female) => {
											const isChecked = selectedFemaleIds.includes(female.id);
											const badge = getCategoryBadgeStyles(female.category || '');
											return (
												<TableRow
													key={female.id}
													hover
													onClick={() => handleSelectFemale(female.id)}
													sx={{
														cursor: 'pointer',
														backgroundColor: isChecked
															? isDark
																? 'rgba(59, 130, 246, 0.08)'
																: '#e1f0fc'
															: 'transparent',
														transition: 'background-color 0.15s ease',
														borderRadius: 0
													}}
												>
													<TableCell
														sx={cellStyle}
														align="center"
														onClick={(e) => e.stopPropagation()}
													>
														<Checkbox
															size="small"
															checked={isChecked}
															onChange={() => handleSelectFemale(female.id)}
															sx={{ p: 0, borderRadius: '4px' }}
														/>
													</TableCell>
													<TableCell
														sx={{
															...cellStyle,
															fontWeight: 700,
															fontFamily: 'monospace',
															color: isChecked ? (isDark ? '#60a5fa' : '#2563eb') : 'text.primary',
															fontSize: '0.85rem'
														}}
													>
														{female.identification}
													</TableCell>
													{serviceType === 'multi' && isControlledService && (
														<TableCell
															sx={cellStyle}
															onClick={(e) => e.stopPropagation()}
														>
															{selectedSireIds.length === 0 ? (
																<Typography
																	variant="caption"
																	color="error"
																	sx={{ fontWeight: 600 }}
																>
																	⚠️ Asigne toros en Paso 2
																</Typography>
															) : (
																<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
																	<Select
																		value={femaleSireAssignments.get(female.id) || ''}
																		onChange={(e) => {
																			const newAssignments = new Map(femaleSireAssignments);
																			if (e.target.value) {
																				newAssignments.set(female.id, e.target.value as number);
																			} else {
																				newAssignments.delete(female.id);
																			}
																			setFemaleSireAssignments(newAssignments);
																		}}
																		displayEmpty
																		size="small"
																		disabled={!isChecked}
																		sx={{
																			height: 28,
																			fontSize: '0.75rem',
																			borderRadius: '6px',
																			width: 140,
																			bgcolor: 'background.paper'
																		}}
																	>
																		<MenuItem value="">
																			<em>-- Seleccionar --</em>
																		</MenuItem>
																		{selectedSireIds.map((id) => {
																			const bull = availableBulls.find((b) => b.id === id);
																			return (
																				<MenuItem
																					key={id}
																					value={id}
																					sx={{ fontSize: '0.75rem' }}
																				>
																					{bull?.identification || `#${id}`}
																				</MenuItem>
																			);
																		})}
																	</Select>
																	{!femaleSireAssignments.has(female.id) && isChecked && (
																		<Tooltip title="Vientre sin toro asignado">
																			<Box sx={{ color: '#e97c00', display: 'flex' }}>
																				<FuseSvgIcon size={16}>
																					heroicons-outline:exclamation-triangle
																				</FuseSvgIcon>
																			</Box>
																		</Tooltip>
																	)}
																</Box>
															)}
														</TableCell>
													)}
													<TableCell sx={cellStyle}>
														<Chip
															label={badge.label}
															size="small"
															sx={{
																bgcolor: badge.bg,
																color: badge.color,
																border: badge.border,
																fontWeight: 700,
																fontSize: '0.68rem',
																borderRadius: '4px',
																height: 20
															}}
														/>
													</TableCell>
													<TableCell sx={{ ...cellStyle, color: 'text.secondary' }}>
														{female.breed || 'N/A'}
													</TableCell>
													<TableCell
														sx={{ ...cellStyle, borderRight: 0, fontWeight: 600 }}
														align="right"
													>
														{female.current_weight ? `${female.current_weight} kg` : 'N/A'}
													</TableCell>
												</TableRow>
											);
										})
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				)}
			</CardContent>
		</Card>
	);
}

export default SireRotationFemaleSelector;
