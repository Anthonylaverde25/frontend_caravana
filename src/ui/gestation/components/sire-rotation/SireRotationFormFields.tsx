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
	TextField,
	ToggleButtonGroup,
	ToggleButton,
	FormControlLabel,
	Switch
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface Batch {
	id: number;
	name: string;
	farm_name?: string;
}

interface SireRotationFormFieldsProps {
	dbBatches: Batch[];
	selectedBatchId: number | 'all';
	setSelectedBatchId: (id: number | 'all') => void;
	orderCode: string;
	setOrderCode: (code: string) => void;
	startDate: string;
	setStartDate: (date: string) => void;
	serviceType: 'single' | 'rotation' | 'multi';
	setServiceType: (type: 'single' | 'rotation' | 'multi') => void;
	isControlledService: boolean;
	setIsControlledService: (val: boolean) => void;
	observations: string;
	setObservations: (val: string) => void;
	setSelectedSireIds: (ids: number[]) => void;
	setFemaleSireAssignments: (assignments: Map<number, number>) => void;
	borderStyle: string;
	isDark: boolean;
	cardShadow: string;
}

function SireRotationFormFields({
	dbBatches,
	selectedBatchId,
	setSelectedBatchId,
	orderCode,
	setOrderCode,
	startDate,
	setStartDate,
	serviceType,
	setServiceType,
	isControlledService,
	setIsControlledService,
	observations,
	setObservations,
	setSelectedSireIds,
	setFemaleSireAssignments,
	borderStyle,
	isDark,
	cardShadow
}: SireRotationFormFieldsProps) {
	return (
		<Card
			elevation={0}
			sx={{
				borderRadius: '12px',
				border: borderStyle,
				boxShadow: cardShadow,
				overflow: 'visible',
				background: isDark ? 'rgba(30, 41, 59, 0.4)' : '#ffffff'
			}}
		>
			<CardContent sx={{ p: 4 }}>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 2,
						mb: 4
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
						<FuseSvgIcon size={20}>heroicons-outline:cog-8-tooth</FuseSvgIcon>
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
							Paso 1
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
							Configuración General
						</Typography>
					</Box>
				</Box>

				<Stack spacing={3.5}>
					<Box
						sx={{
							display: 'flex',
							flexDirection: { xs: 'column', sm: 'row' },
							gap: 2.5
						}}
					>
						<FormControl
							fullWidth
							size="small"
							variant="outlined"
							required
						>
							<InputLabel id="source-batch-select-label">Lote de Trabajo (Servicio)</InputLabel>
							<Select
								labelId="source-batch-select-label"
								value={selectedBatchId}
								label="Lote de Trabajo (Servicio)"
								onChange={(e) => {
									const val = e.target.value;
									setSelectedBatchId(val === 'all' ? 'all' : Number(val));
								}}
								sx={{ borderRadius: '8px', bgcolor: 'background.paper' }}
							>
								<MenuItem value="all">
									<em>-- Seleccione un Lote --</em>
								</MenuItem>
								{dbBatches.map((b) => (
									<MenuItem
										key={b.id}
										value={b.id}
									>
										{b.name} {b.farm_name ? `(${b.farm_name})` : ''}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<TextField
							required
							fullWidth
							size="small"
							variant="outlined"
							label="Código de la Orden"
							placeholder="SO-YYYYMMDD-XXXX"
							value={orderCode}
							onChange={(e) => setOrderCode(e.target.value)}
							InputProps={{ sx: { borderRadius: '8px', bgcolor: 'background.paper' } }}
						/>
					</Box>

					<Box
						sx={{
							display: 'flex',
							flexDirection: { xs: 'column', sm: 'row' },
							gap: 2.5
						}}
					>
						<TextField
							required
							fullWidth
							variant="outlined"
							label="Fecha Programada de Inicio"
							type="date"
							size="small"
							InputLabelProps={{ shrink: true }}
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							InputProps={{ sx: { borderRadius: '8px', bgcolor: 'background.paper' } }}
						/>

						<FormControl
							fullWidth
							size="small"
						>
							<Typography
								variant="caption"
								color="text.secondary"
								sx={{
									fontWeight: 700,
									mb: 1,
									display: 'block',
									fontSize: '0.72rem',
									textTransform: 'uppercase',
									letterSpacing: '0.5px'
								}}
							>
								Modalidad de Servicio
							</Typography>
							<ToggleButtonGroup
								value={serviceType}
								exclusive
								onChange={(e, val) => {
									if (val !== null) {
										setServiceType(val);
										setSelectedSireIds([]);
										setIsControlledService(false);
										setFemaleSireAssignments(new Map());
									}
								}}
								fullWidth
								size="small"
								color="primary"
								sx={{
									height: 38,
									borderRadius: '8px',
									bgcolor: isDark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.02)',
									p: 0.5,
									border: borderStyle,
									'& .MuiToggleButton-root': {
										textTransform: 'none',
										fontWeight: 700,
										borderRadius: '6px',
										border: 'none',
										mx: 0.25,
										color: 'text.secondary',
										transition: 'all 0.2s ease',
										'&.Mui-selected': {
											backgroundColor: isDark ? '#1a56db' : '#2563eb',
											color: '#ffffff',
											boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)',
											'&:hover': {
												backgroundColor: isDark ? '#1e429f' : '#1d4ed8'
											}
										}
									}
								}}
							>
								<ToggleButton
									value="single"
									sx={{ gap: 1 }}
								>
									<FuseSvgIcon size={16}>heroicons-outline:user</FuseSvgIcon>
									Toro Único
								</ToggleButton>
								<ToggleButton
									value="multi"
									sx={{ gap: 1 }}
								>
									<FuseSvgIcon size={16}>heroicons-outline:users</FuseSvgIcon>
									Multi-Toro
								</ToggleButton>
							</ToggleButtonGroup>

							{serviceType === 'multi' && (
								<FormControlLabel
									control={
										<Switch
											checked={isControlledService}
											onChange={(e) => {
												setIsControlledService(e.target.checked);

												if (!e.target.checked) {
													setFemaleSireAssignments(new Map());
												}
											}}
											size="small"
										/>
									}
									label={
										<Typography
											variant="body2"
											sx={{ fontWeight: 600, fontSize: '0.78rem' }}
										>
											Servicio Controlado — Asignar toros específicos a cada vientre
										</Typography>
									}
									sx={{ mt: 1.5, ml: 0 }}
								/>
							)}
						</FormControl>
					</Box>

					<TextField
						size="small"
						fullWidth
						variant="outlined"
						multiline
						rows={3}
						label="Observaciones de la Orden"
						placeholder="Escriba aquí los detalles sobre el potrero asignado, las condiciones de salud de los toros o cualquier especificación técnica..."
						value={observations}
						onChange={(e) => setObservations(e.target.value)}
						InputProps={{ sx: { borderRadius: '8px', bgcolor: 'background.paper' } }}
					/>
				</Stack>
			</CardContent>
		</Card>
	);
}

export default SireRotationFormFields;
