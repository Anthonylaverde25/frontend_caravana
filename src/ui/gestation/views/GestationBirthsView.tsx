import { useState, useMemo } from 'react';
import {
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Chip,
	Tooltip,
	TextField,
	CircularProgress,
	useTheme,
	Button,
	Checkbox
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useBirthHistory } from '@/features/gestation/hooks/useBirthHistory';
import WeaningDialog from '../components/dialogs/WeaningDialog';
import BulkWeaningDialog from '../components/dialogs/BulkWeaningDialog';

function GestationBirthsView() {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	// Fetch birth history
	const { data: birthHistory = [], isLoading } = useBirthHistory();

	// Search filter state
	const [searchQuery, setSearchQuery] = useState('');

	// Selection state for bulk weaning
	const [selectedCalfIds, setSelectedCalfIds] = useState<number[]>([]);

	// Dialogs states
	const [weaningDialog, setWeaningDialog] = useState<{ open: boolean; calf: any | null }>({
		open: false,
		calf: null
	});
	const [bulkWeaningDialogOpen, setBulkWeaningDialogOpen] = useState(false);

	// Filter history records
	const filteredHistory = useMemo(() => {
		return birthHistory.filter((record) => {
			const matchesMother = record.mother_identification.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCalf = record.calf_identification.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesMother || matchesCalf;
		});
	}, [birthHistory, searchQuery]);

	// Filter active nursing calves that are eligible for selection
	const eligibleCalves = useMemo(() => {
		return filteredHistory.filter((record) => record.is_nursing);
	}, [filteredHistory]);

	// Memoize selected calves details
	const selectedCalvesData = useMemo(() => {
		return birthHistory
			.filter((record) => selectedCalfIds.includes(record.calf_id))
			.map((record) => ({
				calf_id: record.calf_id,
				calf_identification: record.calf_identification,
				calf_sex: record.calf_sex,
				mother_identification: record.mother_identification
			}));
	}, [birthHistory, selectedCalfIds]);

	// Handlers for selection
	const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			const activeIds = eligibleCalves.map((c) => c.calf_id);
			setSelectedCalfIds(activeIds);
		} else {
			setSelectedCalfIds([]);
		}
	};

	const handleSelectOne = (calfId: number) => {
		setSelectedCalfIds((prev) => {
			if (prev.includes(calfId)) {
				return prev.filter((id) => id !== calfId);
			} else {
				return [...prev, calfId];
			}
		});
	};

	const headerBg = isDark ? theme.palette.background.default : '#f8f9fa';
	const zebraBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.015)';

	const cellStyle = {
		px: 2,
		py: 1.5,
		borderRight: '1px solid',
		borderBottom: '1px solid',
		borderColor: theme.palette.divider,
		fontSize: '0.85rem',
		borderRadius: 0,
		'&:last-child': { borderRight: 0 }
	};

	const tableHeaderStyle = {
		px: 2,
		py: 1.75,
		borderRight: '1px solid',
		borderBottom: '2px solid',
		borderColor: theme.palette.divider,
		fontSize: '0.8rem',
		fontWeight: 800,
		color: theme.palette.text.primary,
		backgroundColor: headerBg,
		textTransform: 'uppercase',
		letterSpacing: '0.5px',
		borderRadius: 0,
		'&:last-child': { borderRight: 0 }
	};

	if (isLoading) {
		return (
			<ViewLayout
				title="Historial de Partos y Lactancia"
				backUrl="/gestation"
				backTitle="Volver al Dashboard"
			>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						p: 12,
						gap: 2
					}}
				>
					<CircularProgress
						size={40}
						thickness={4}
					/>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ fontWeight: 600 }}
					>
						Cargando historial de pariciones...
					</Typography>
				</Box>
			</ViewLayout>
		);
	}

	return (
		<ViewLayout
			title="Historial de Partos y Lactancia"
			backUrl="/gestation"
			backTitle="Volver al Dashboard"
		>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
				{/* Top Controls Area */}
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						flexWrap: 'wrap',
						gap: 2
					}}
				>
					{/* Search Bar */}
					<TextField
						size="small"
						variant="outlined"
						placeholder="Buscar por caravana de madre o cría..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						sx={{
							width: { xs: '100%', sm: 360 },
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

					{/* Bulk Weaning Button */}
					{selectedCalfIds.length > 0 && (
						<Button
							variant="contained"
							color="warning"
							onClick={() => setBulkWeaningDialogOpen(true)}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:adjustments-horizontal</FuseSvgIcon>}
							sx={{
								textTransform: 'none',
								fontWeight: 800,
								borderRadius: '8px',
								boxShadow: 'none',
								color: '#ffffff',
								bgcolor: isDark ? '#ed6c02' : '#ff9800',
								'&:hover': {
									bgcolor: isDark ? '#e65100' : '#f57c00'
								}
							}}
						>
							Destete Masivo ({selectedCalfIds.length})
						</Button>
					)}
				</Box>

				{/* Spreadsheet Table Container */}
				<TableContainer
					component={Paper}
					elevation={0}
					sx={{
						borderRadius: '4px',
						border: 1,
						borderColor: theme.palette.divider,
						overflow: 'hidden',
						bgcolor: theme.palette.background.paper
					}}
				>
					<Table
						sx={{ minWidth: 650 }}
						aria-label="birth history table"
					>
						<TableHead>
							<TableRow>
								{/* Selection Header */}
								<TableCell sx={{ ...tableHeaderStyle, width: '48px', px: 1 }}>
									<Checkbox
										size="small"
										indeterminate={
											selectedCalfIds.length > 0 &&
											selectedCalfIds.length < eligibleCalves.length
										}
										checked={
											eligibleCalves.length > 0 &&
											selectedCalfIds.length === eligibleCalves.length
										}
										onChange={handleSelectAll}
										disabled={eligibleCalves.length === 0}
									/>
								</TableCell>
								<TableCell sx={tableHeaderStyle}>Caravana Madre</TableCell>
								<TableCell sx={tableHeaderStyle}>Fecha del Parto</TableCell>
								<TableCell sx={tableHeaderStyle}>Caravana Cría</TableCell>
								<TableCell sx={tableHeaderStyle}>Sexo</TableCell>
								<TableCell sx={tableHeaderStyle}>Lote Actual</TableCell>
								<TableCell sx={tableHeaderStyle}>Estado Lactancia</TableCell>
								<TableCell sx={tableHeaderStyle}>Observaciones</TableCell>
								<TableCell sx={{ ...tableHeaderStyle, textAlign: 'right' }}>Acciones</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{filteredHistory.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={9}
										align="center"
										sx={{ py: 8, color: 'text.disabled', fontStyle: 'italic' }}
									>
										{searchQuery
											? 'No se encontraron partos que coincidan con la búsqueda.'
											: 'No se han registrado partos exitosos en el establecimiento aún.'}
									</TableCell>
								</TableRow>
							) : (
								filteredHistory.map((record) => {
									const isSelected = selectedCalfIds.includes(record.calf_id);
									return (
										<TableRow
											key={record.gestation_id}
											sx={{
												backgroundColor: isSelected
													? isDark
														? 'rgba(237, 108, 2, 0.08)'
														: 'rgba(255, 152, 0, 0.04)'
													: 'transparent',
												'&:nth-of-type(even)': {
													bgcolor: isSelected
														? isDark
															? 'rgba(237, 108, 2, 0.12)'
															: 'rgba(255, 152, 0, 0.08)'
														: zebraBg
												},
												'&:hover': {
													backgroundColor: isDark
														? 'rgba(255, 255, 255, 0.05)'
														: 'rgba(0, 0, 0, 0.025)'
												}
											}}
										>
											{/* Row Checkbox */}
											<TableCell sx={{ ...cellStyle, px: 1 }}>
												<Checkbox
													size="small"
													checked={isSelected}
													disabled={!record.is_nursing}
													onChange={() => handleSelectOne(record.calf_id)}
												/>
											</TableCell>
											<TableCell sx={{ ...cellStyle, fontWeight: 700, fontFamily: 'monospace' }}>
												{record.mother_identification}
											</TableCell>
											<TableCell sx={cellStyle}>{record.birth_date}</TableCell>
											<TableCell sx={{ ...cellStyle, fontFamily: 'monospace' }}>
												{record.calf_identification}
											</TableCell>
											<TableCell sx={cellStyle}>
												{record.calf_sex === 'M' ? 'Macho' : record.calf_sex === 'H' ? 'Hembra' : '-'}
											</TableCell>
											<TableCell sx={{ ...cellStyle, color: 'text.secondary' }}>
												{record.calf_batch_name || 'Sin lote'}
											</TableCell>
											<TableCell sx={cellStyle}>
												<Chip
													label={record.is_nursing ? 'Al Pie / Lactando' : 'Destetado'}
													size="small"
													sx={{
														fontWeight: 700,
														fontSize: '0.72rem',
														borderRadius: '2px',
														height: 22,
														bgcolor: record.is_nursing
															? isDark
																? 'rgba(16, 185, 129, 0.15)'
																: '#eefbee'
															: isDark
																? 'rgba(255, 255, 255, 0.05)'
																: '#f3f4f6',
														color: record.is_nursing
															? isDark
																? '#4ade80'
																: '#107e3e'
															: isDark
																? 'text.secondary'
																: '#4b5563',
														border: record.is_nursing
															? isDark
																? '1px solid rgba(74, 222, 128, 0.3)'
																: '1px solid #107e3e'
															: isDark
																? '1px solid rgba(255, 255, 255, 0.1)'
																: '1px solid #d1d5db'
													}}
												/>
											</TableCell>
											<TableCell
												sx={{
													...cellStyle,
													color: 'text.secondary',
													fontStyle: record.notes ? 'normal' : 'italic'
												}}
											>
												{record.notes || 'Sin observaciones'}
											</TableCell>
											<TableCell sx={{ ...cellStyle, textAlign: 'right' }}>
												{record.is_nursing ? (
													<Tooltip title="Registrar destete del ternero">
														<Button
															size="small"
															variant="outlined"
															color="warning"
															onClick={() =>
																setWeaningDialog({
																	open: true,
																	calf: record
																})
															}
															sx={{
																borderRadius: 0,
																textTransform: 'none',
																fontWeight: 700,
																fontSize: '0.75rem',
																py: 0.5,
																px: 2,
																borderColor: 'warning.main',
																'&:hover': {
																	bgcolor: isDark
																		? 'rgba(237, 108, 2, 0.08)'
																		: 'rgba(237, 108, 2, 0.04)'
																}
															}}
														>
															Destetar
														</Button>
													</Tooltip>
												) : (
													<Typography
														variant="caption"
														color="text.disabled"
														sx={{ fontWeight: 600, pr: 2 }}
													>
														Proceso Finalizado
													</Typography>
												)}
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>

			{/* Individual Weaning Dialog */}
			<WeaningDialog
				open={weaningDialog.open}
				onClose={() => setWeaningDialog({ open: false, calf: null })}
				calfId={weaningDialog.calf?.calf_id || 0}
				calfIdentification={weaningDialog.calf?.calf_identification || ''}
				motherIdentification={weaningDialog.calf?.mother_identification || ''}
				calfSex={weaningDialog.calf?.calf_sex || null}
			/>

			{/* Bulk Weaning Dialog */}
			<BulkWeaningDialog
				open={bulkWeaningDialogOpen}
				onClose={() => {
					setBulkWeaningDialogOpen(false);
					setSelectedCalfIds([]);
				}}
				selectedCalves={selectedCalvesData}
			/>
		</ViewLayout>
	);
}

export default GestationBirthsView;
