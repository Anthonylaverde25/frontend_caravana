import {
	Card,
	CardContent,
	Box,
	Typography,
	Stack,
	Autocomplete,
	TextField,
	Avatar,
	IconButton,
	Tooltip
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

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

interface SireRotationMaleSelectorProps {
	availableBulls: Caravan[];
	selectedSireIds: number[];
	handleAddBull: (bullId: number) => void;
	handleRemoveBull: (bullId: number) => void;
	borderStyle: string;
	isDark: boolean;
	cardShadow: string;
}

function SireRotationMaleSelector({
	availableBulls,
	selectedSireIds,
	handleAddBull,
	handleRemoveBull,
	borderStyle,
	isDark,
	cardShadow
}: SireRotationMaleSelectorProps) {
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
						<FuseSvgIcon size={20}>heroicons-outline:shield-check</FuseSvgIcon>
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
							Paso 2
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
							Asignar Machos Reproductores
						</Typography>
					</Box>
				</Box>

				<Stack spacing={3}>
					<Autocomplete
						options={availableBulls.filter((bull) => !selectedSireIds.includes(bull.id))}
						getOptionLabel={(option) => `${option.identification} - ${option.breed || 'Sin Raza'}`}
						onChange={(event, value) => {
							if (value) {
								handleAddBull(value.id);
							}
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Buscar y Asignar Semental (Toro)"
								size="small"
								variant="outlined"
								placeholder="Escriba la identificación o raza del toro..."
								InputProps={{
									...params.InputProps,
									sx: { borderRadius: '8px', bgcolor: 'background.paper' }
								}}
							/>
						)}
						value={null}
						blurOnSelect
						clearOnBlur
						sx={{
							'& .MuiOutlinedInput-root': {
								borderRadius: '8px'
							}
						}}
					/>

					{/* VISUAL CARDS FOR ASSIGNED BULLS */}
					<Box sx={{ mt: 1 }}>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{
								fontWeight: 700,
								display: 'block',
								mb: 2,
								fontSize: '0.72rem',
								textTransform: 'uppercase',
								letterSpacing: '0.5px'
							}}
						>
							Sementales Asignados ({selectedSireIds.length})
						</Typography>

						{selectedSireIds.length === 0 ? (
							<Box
								sx={{
									p: 4.5,
									border: '2px dashed',
									borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
									borderRadius: '8px',
									textAlign: 'center',
									bgcolor: isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.01)'
								}}
							>
								<Typography
									variant="body2"
									color="text.disabled"
									sx={{ fontStyle: 'italic' }}
								>
									No hay toros asignados. Utilice el selector de arriba para buscar y agregar
									reproductores.
								</Typography>
							</Box>
						) : (
							<Box
								sx={{
									display: 'flex',
									flexWrap: 'wrap',
									gap: 2
								}}
							>
								{selectedSireIds.map((id) => {
									const bull = availableBulls.find((b) => b.id === id);
									return (
										<Card
											key={id}
											variant="outlined"
											sx={{
												display: 'flex',
												alignItems: 'center',
												p: 2,
												borderRadius: '8px',
												minWidth: 200,
												flex: '1 1 calc(50% - 8px)',
												borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
												background: isDark ? 'rgba(0, 0, 0, 0.15)' : '#fafafa',
												position: 'relative',
												boxShadow: 'none',
												transition: 'all 0.2s ease-in-out',
												'&:hover': {
													borderColor: isDark ? '#60a5fa' : '#2563eb',
													transform: 'translateY(-1px)',
													boxShadow: isDark
														? '0 4px 12px rgba(0,0,0,0.2)'
														: '0 4px 12px rgba(0,0,0,0.02)'
												}
											}}
										>
											<Avatar
												sx={{
													bgcolor: isDark
														? 'rgba(59, 130, 246, 0.15)'
														: 'rgba(37, 99, 235, 0.06)',
													color: isDark ? '#60a5fa' : '#2563eb',
													mr: 2,
													width: 38,
													height: 38,
													borderRadius: '50%',
													border: isDark
														? '1px solid rgba(96, 165, 250, 0.2)'
														: '1px solid rgba(37, 99, 235, 0.15)'
												}}
											>
												<FuseSvgIcon size={18}>heroicons-outline:shield-check</FuseSvgIcon>
											</Avatar>
											<Box sx={{ flexGrow: 1, pr: 2 }}>
												<Typography
													variant="subtitle2"
													sx={{
														fontWeight: 700,
														fontFamily: 'monospace',
														color: isDark ? '#60a5fa' : '#2563eb',
														fontSize: '0.9rem'
													}}
												>
													{bull?.identification || `Toro #${id}`}
												</Typography>
												<Typography
													variant="caption"
													color="text.secondary"
													sx={{ fontWeight: 600 }}
												>
													{bull?.breed || 'Sin Raza'}
												</Typography>
											</Box>
											<Tooltip title="Remover Semental">
												<IconButton
													size="small"
													onClick={() => handleRemoveBull(id)}
													sx={{
														color: 'text.disabled',
														borderRadius: '50%',
														'&:hover': {
															color: isDark ? '#ef4444' : '#dc2626',
															backgroundColor: isDark
																? 'rgba(239, 68, 68, 0.1)'
																: 'rgba(220, 38, 38, 0.05)'
														}
													}}
												>
													<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
												</IconButton>
											</Tooltip>
										</Card>
									);
								})}
							</Box>
						)}
					</Box>
				</Stack>
			</CardContent>
		</Card>
	);
}

export default SireRotationMaleSelector;
