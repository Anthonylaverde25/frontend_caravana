import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Box,
	Typography,
	Chip,
	IconButton,
	Tooltip,
	TextField,
	InputAdornment,
	Stack,
	Avatar,
	TablePagination,
	useTheme,
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { calculateWrightInbreeding, classifyInbreedingRisk } from '@/core/caravans/domain/services/pedigreeAnalysis';

interface ReserveCaravanDataTableProps {
	caravans: Caravan[];
	allCaravansMap: Map<number, Caravan>;
}

export default function ReserveCaravanDataTable({
	caravans,
	allCaravansMap,
}: ReserveCaravanDataTableProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const navigate = useNavigate();

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedSexFilter, setSelectedSexFilter] = useState<'ALL' | 'M' | 'H'>('ALL');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(15);

	const headerBg = isDark ? theme.palette.background.default : '#f8f9fa';
	const zebraBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.015)';

	// Calculate inbreeding for each caravan in reserve
	const enrichedCaravans = useMemo(() => {
		return caravans.map((c) => {
			const inbreeding = calculateWrightInbreeding(
				c.lineage?.mother_id,
				c.lineage?.father_id,
				allCaravansMap
			);
			const { risk, label: riskLabel } = classifyInbreedingRisk(inbreeding.fx);
			return {
				...c,
				fx: inbreeding.fx,
				risk,
				riskLabel,
				commonAncestors: inbreeding.commonAncestors,
			};
		});
	}, [caravans, allCaravansMap]);


	// Filtered caravans
	const filteredCaravans = useMemo(() => {
		return enrichedCaravans.filter((c) => {
			const q = searchTerm.trim().toLowerCase();
			const matchesSearch =
				q === '' ||
				c.identification.toLowerCase().includes(q) ||
				(c.category || '').toLowerCase().includes(q) ||
				(c.breed || '').toLowerCase().includes(q);

			if (!matchesSearch) return false;

			if (selectedSexFilter === 'M') return c.sex === 'M';
			if (selectedSexFilter === 'H') return c.sex === 'H';

			return true;
		});
	}, [enrichedCaravans, searchTerm, selectedSexFilter]);

	// Paginated
	const paginatedCaravans = useMemo(() => {
		const start = page * rowsPerPage;
		return filteredCaravans.slice(start, start + rowsPerPage);
	}, [filteredCaravans, page, rowsPerPage]);

	const handleChangePage = (_: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const headerCellStyle = {
		py: 1.5,
		px: 2,
		fontSize: '0.72rem',
		fontWeight: 800,
		textTransform: 'uppercase' as const,
		color: theme.palette.text.secondary,
		borderBottom: 1,
		borderRight: 1,
		borderColor: theme.palette.divider,
		whiteSpace: 'nowrap' as const,
		letterSpacing: '0.5px',
	};

	const bodyCellStyle = {
		px: 2,
		py: 1.2,
		borderRight: 1,
		borderBottom: 1,
		borderColor: theme.palette.divider,
	};

	return (
		<Box sx={{ width: '100%' }}>
			{/* Top Toolbar: Search & Sex Filters */}
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				justifyContent="space-between"
				alignItems={{ xs: 'stretch', md: 'center' }}
				spacing={2}
				sx={{ mb: 2 }}
			>
				{/* Search input */}
				<TextField
					size="small"
					placeholder="Buscar por identificación, categoría o raza..."
					value={searchTerm}
					onChange={(e) => {
						setSearchTerm(e.target.value);
						setPage(0);
					}}
					sx={{ minWidth: { xs: '100%', md: 360 } }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<FuseSvgIcon size={18} color="disabled">
									heroicons-outline:magnifying-glass
								</FuseSvgIcon>
							</InputAdornment>
						),
					}}
				/>

				{/* Quick Sex Filter Chips */}
				<Stack direction="row" spacing={1} flexWrap="wrap">
					<Chip
						label={`Todos (${caravans.length})`}
						size="small"
						clickable
						color={selectedSexFilter === 'ALL' ? 'primary' : 'default'}
						variant={selectedSexFilter === 'ALL' ? 'filled' : 'outlined'}
						onClick={() => {
							setSelectedSexFilter('ALL');
							setPage(0);
						}}
						sx={{ fontWeight: 700, fontSize: '0.72rem' }}
					/>
					<Chip
						label={`Hembras ♀ (${caravans.filter((c) => c.sex === 'H').length})`}
						size="small"
						clickable
						color={selectedSexFilter === 'H' ? 'secondary' : 'default'}
						variant={selectedSexFilter === 'H' ? 'filled' : 'outlined'}
						onClick={() => {
							setSelectedSexFilter('H');
							setPage(0);
						}}
						sx={{ fontWeight: 700, fontSize: '0.72rem' }}
					/>
					<Chip
						label={`Machos ♂ (${caravans.filter((c) => c.sex === 'M').length})`}
						size="small"
						clickable
						color={selectedSexFilter === 'M' ? 'info' : 'default'}
						variant={selectedSexFilter === 'M' ? 'filled' : 'outlined'}
						onClick={() => {
							setSelectedSexFilter('M');
							setPage(0);
						}}
						sx={{ fontWeight: 700, fontSize: '0.72rem' }}
					/>
				</Stack>
			</Stack>

			{/* Spreadsheet Table Container */}
			<Paper
				elevation={0}
				sx={{
					border: 1,
					borderColor: theme.palette.divider,
					borderRadius: '6px',
					overflow: 'hidden',
					bgcolor: 'background.paper',
				}}
			>
				<TableContainer sx={{ maxHeight: 620 }}>
					<Table stickyHeader sx={{ minWidth: 1000, borderCollapse: 'collapse' }}>
						<TableHead>
							<TableRow sx={{ bgcolor: headerBg }}>
								<TableCell sx={{ ...headerCellStyle, width: 48, textAlign: 'center' }}>#</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 190 }}>Caravana / Animal</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 110 }}>Sexo</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Categoría</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Raza</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 100, textAlign: 'center' }}>Dentición</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 130 }}>Peso Registrado</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 140 }}>Estado Gestacional</TableCell>
								<TableCell sx={{ ...headerCellStyle, minWidth: 160 }}>Consanguinidad ($F_X$)</TableCell>
								<TableCell sx={{ ...headerCellStyle, width: 90, textAlign: 'center', borderRight: 0 }}>Acciones</TableCell>
							</TableRow>
						</TableHead>

						<TableBody>
							{paginatedCaravans.map((c, index) => {
								const isEven = index % 2 === 1;
								const isMale = c.sex === 'M';
								const isCritical = c.fx > 12.5;
								const isAlert = c.fx >= 6.25 && c.fx <= 12.5;

								return (
									<TableRow
										key={c.id}
										hover
										sx={{
											bgcolor: isEven ? zebraBg : 'inherit',
											transition: 'background-color 0.15s ease',
										}}
									>
										{/* 1. Index */}
										<TableCell sx={{ ...bodyCellStyle, textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}>
											{page * rowsPerPage + index + 1}
										</TableCell>

										{/* 2. Caravana / Animal */}
										<TableCell sx={bodyCellStyle}>
											<Stack direction="row" spacing={1.2} alignItems="center">
												<Avatar
													sx={{
														width: 28,
														height: 28,
														bgcolor: isMale ? 'info.light' : 'secondary.light',
														color: isMale ? 'info.contrastText' : 'secondary.contrastText',
														fontSize: '0.7rem',
														fontWeight: 800,
													}}
												>
													{isMale ? '♂' : '♀'}
												</Avatar>
												<Box>
													<Typography sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main', fontSize: '0.85rem', lineHeight: 1.1 }}>
														#{c.identification}
													</Typography>
													<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', display: 'block' }}>
														ID: {c.id}
													</Typography>
												</Box>
											</Stack>
										</TableCell>

										{/* 3. Sexo */}
										<TableCell sx={bodyCellStyle}>
											<Chip
												size="small"
												label={isMale ? 'Macho ♂' : 'Hembra ♀'}
												sx={{
													fontWeight: 800,
													fontSize: '0.68rem',
													height: 22,
													bgcolor: isMale ? 'rgba(2,132,199,0.08)' : 'rgba(219,39,119,0.08)',
													color: isMale ? 'info.dark' : 'secondary.dark',
													border: '1px solid',
													borderColor: isMale ? 'rgba(2,132,199,0.25)' : 'rgba(219,39,119,0.25)',
												}}
											/>
										</TableCell>

										{/* 4. Categoría */}
										<TableCell sx={bodyCellStyle}>
											<Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize' }}>
												{c.category || 'Sin categoría'}
											</Typography>
										</TableCell>

										{/* 5. Raza */}
										<TableCell sx={bodyCellStyle}>
											<Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
												{c.breed || 'Sin raza'}
											</Typography>
										</TableCell>

										{/* 6. Dentición */}
										<TableCell sx={{ ...bodyCellStyle, textAlign: 'center' }}>
											<Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
												{c.teeth !== undefined && c.teeth !== null ? `${c.teeth} D` : '—'}
											</Typography>
										</TableCell>

										{/* 7. Peso Registrado */}
										<TableCell sx={bodyCellStyle}>
											{c.entry_weight ? (
												<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'secondary.main', fontSize: '0.82rem' }}>
													{c.entry_weight} kg
												</Typography>
											) : (
												<Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
													Sin registro
												</Typography>
											)}
										</TableCell>

										{/* 8. Estado Gestacional */}
										<TableCell sx={bodyCellStyle}>
											{isMale ? (
												<Typography variant="caption" sx={{ color: 'text.disabled' }}>
													N/A (Macho)
												</Typography>
											) : c.active_gestation ? (
												<Chip
													size="small"
													label="Gestante 🤰"
													color="warning"
													sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
												/>
											) : (
												<Chip
													size="small"
													label="Vacía / Apta"
													variant="outlined"
													color="success"
													sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
												/>
											)}
										</TableCell>

										{/* 9. Consanguinidad ($F_X$) */}
										<TableCell sx={bodyCellStyle}>
											<Tooltip
												title={
													c.commonAncestors.length > 0
														? `Ancestros comunes: ${c.commonAncestors.join(', ')}`
														: 'Sin consanguinidad directa detectada'
												}
												arrow
											>
												<Chip
													size="small"
													label={`${c.fx}% — ${isCritical ? 'Crítico 🔴' : isAlert ? 'Alto 🟠' : 'Óptimo 🟢'}`}
													sx={{
														fontWeight: 800,
														fontSize: '0.68rem',
														height: 22,
														bgcolor: isCritical ? '#ef4444' : isAlert ? '#ea580c' : '#22c55e',
														color: '#ffffff',
													}}
												/>
											</Tooltip>
										</TableCell>

										{/* 10. Acciones */}
										<TableCell sx={{ ...bodyCellStyle, textAlign: 'center', borderRight: 0 }}>
											<Stack direction="row" spacing={0.5} justifyContent="center">
												<Tooltip title="Ver en Árbol Genealógico">
													<IconButton
														size="small"
														color="primary"
														onClick={() => navigate(`/gestation/pedigree/${c.id}`)}
														sx={{ p: 0.5 }}
													>
														<FuseSvgIcon size={18}>heroicons-outline:chart-bar</FuseSvgIcon>
													</IconButton>
												</Tooltip>

												<Tooltip title="Ver Tabla General de Pedigree">
													<IconButton
														size="small"
														color="inherit"
														onClick={() => navigate('/gestation/pedigree')}
														sx={{ p: 0.5 }}
													>
														<FuseSvgIcon size={18}>heroicons-outline:academic-cap</FuseSvgIcon>
													</IconButton>
												</Tooltip>
											</Stack>
										</TableCell>
									</TableRow>
								);
							})}

							{paginatedCaravans.length === 0 && (
								<TableRow>
									<TableCell colSpan={10} sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
										<Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
											<FuseSvgIcon size={36} color="disabled">
												heroicons-outline:magnifying-glass
											</FuseSvgIcon>
										</Box>
										<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
											No se encontraron animales con los filtros seleccionados
										</Typography>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>

				{/* Pagination */}
				<TablePagination
					rowsPerPageOptions={[10, 15, 25, 50]}
					component="div"
					count={filteredCaravans.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					labelRowsPerPage="Filas por página:"
					labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
					sx={{
						borderTop: 1,
						borderColor: theme.palette.divider,
						bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : '#fafafa',
					}}
				/>
			</Paper>
		</Box>
	);
}
