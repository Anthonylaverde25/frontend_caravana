import React, { ReactNode, useMemo, useState } from 'react';
import {
	Box,
	Button,
	Checkbox,
	Chip,
	IconButton,
	InputAdornment,
	MenuItem,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Tooltip,
	Typography,
	alpha,
	useTheme
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useTransferPalette } from './transferPalette';
import { TransferableCaravan, formatAverage } from './transferMath';

import TransferDestinationCell from './TransferDestinationCell';
import type { Cact01Destination } from '@/ui/work-templates/components/scan/types';

interface TransferAnimalsTableProps {
	caravans: TransferableCaravan[];
	isLoading?: boolean;
	selectedIds: number[];
	onSelectionChange: (ids: number[]) => void;
	/**
	 * Per-animal destinations. Absent in single-destination mode, where the column is not
	 * rendered at all and this table behaves exactly as it always did.
	 */
	destinations?: Cact01Destination[];
	assignments?: Record<number, string>;
	onAssign?: (caravanIds: number[], key: string | null) => void;
	/**
	 * An issued order freezes what it ordered: the selection and the destinations are shown and
	 * cannot be touched. Changing them is an explicit act — cancelling the order — never a
	 * silent edit that leaves the screen and the order saying different things.
	 */
	readOnly?: boolean;
	/**
	 * Inline editing of the selected rows. Only "Registrar transferencia" passes it: a planned
	 * transfer never edits the animals, and without it this table is exactly what it was.
	 */
	fieldEditor?: TransferFieldEditor;
}

/**
 * What a registered transfer lets the operator write for each selected animal, rendered by the
 * caller. The table only decides where it goes; it knows nothing about weights or categories.
 */
export interface TransferFieldEditor {
	renderWeight: (caravanId: number) => ReactNode;
	renderCategory: (caravanId: number) => ReactNode;
	renderTeeth: (caravanId: number) => ReactNode;
	renderObservations: (caravanId: number) => ReactNode;
	/** The dentition of a row that is not selected, read-only. */
	teethOf: (caravanId: number) => string;
	/** What the server refused for this animal, shown under its row. */
	errorOf: (caravanId: number) => string | null;
	/**
	 * Per-animal destination picked right in the row (search, or create a batch). Replaces the
	 * select over declared destinations, and the bulk "Asignar seleccionados" with its own.
	 */
	renderDestination?: (caravanId: number) => ReactNode;
	renderBulkDestination?: (caravanIds: number[]) => ReactNode;
}

/** Distinct from the empty placeholder, which would otherwise share its value. */
const CLEAR_DESTINATION = '__clear__';

type SexFilter = 'ALL' | 'H' | 'M';
type SortField = 'identification' | 'weight';
type SortOrder = 'asc' | 'desc';

/**
 * Datatable adhering strictly to the canonical Pre-Service pattern (/gestation/pre-service).
 * Uses identical MUI Table proportions, header styles, body cell metrics,
 * monospace identification tags, segmented pill filters, and integrated search.
 */
export const TransferAnimalsTable: React.FC<TransferAnimalsTableProps> = ({
	caravans,
	isLoading = false,
	selectedIds,
	onSelectionChange,
	destinations,
	assignments = {},
	onAssign,
	readOnly = false,
	fieldEditor
}) => {
	const showDestinationColumn = Boolean(destinations && onAssign);
	// Registering replaces the two informative columns with the two it lets you write.
	const editing = Boolean(fieldEditor);
	const columnCount = 7 + (showDestinationColumn ? 1 : 0);
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const palette = useTransferPalette();

	const activeColor = isDark ? '#60a5fa' : '#0a6ed1';

	const [search, setSearch] = useState('');
	const [sexFilter, setSexFilter] = useState<SexFilter>('ALL');
	const [sortField, setSortField] = useState<SortField>('weight');
	const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(15);

	const counts = useMemo(
		() => ({
			all: caravans.length,
			females: caravans.filter((c) => c.sex === 'H').length,
			males: caravans.filter((c) => c.sex === 'M').length
		}),
		[caravans]
	);

	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

	// Filtered & Sorted Animals
	const visible = useMemo(() => {
		const term = search.trim().toLowerCase();

		let list = caravans.filter((caravan) => {
			if (sexFilter !== 'ALL' && caravan.sex !== sexFilter) return false;

			if (!term) return true;

			return (
				caravan.identification.toLowerCase().includes(term) ||
				(caravan.category_name ?? caravan.category ?? '').toLowerCase().includes(term)
			);
		});

		list = [...list].sort((a, b) => {
			if (sortField === 'identification') {
				const res = a.identification.localeCompare(b.identification, undefined, { numeric: true });
				return sortOrder === 'asc' ? res : -res;
			}

			if (sortField === 'weight') {
				const wA = a.current_weight ?? 0;
				const wB = b.current_weight ?? 0;
				return sortOrder === 'asc' ? wA - wB : wB - wA;
			}

			return 0;
		});

		return list;
	}, [caravans, search, sexFilter, sortField, sortOrder]);

	// Paginated slice
	const paginatedAnimals = useMemo(() => {
		const from = page * rowsPerPage;
		return visible.slice(from, from + rowsPerPage);
	}, [visible, page, rowsPerPage]);

	const currentPageIds = useMemo(() => paginatedAnimals.map((c) => c.id), [paginatedAnimals]);
	const allCurrentSelected =
		currentPageIds.length > 0 && currentPageIds.every((id) => selectedSet.has(id));
	const someCurrentSelected =
		currentPageIds.some((id) => selectedSet.has(id)) && !allCurrentSelected;

	const toggle = (id: number) => {
		if (readOnly) return;

		onSelectionChange(selectedSet.has(id) ? selectedIds.filter((v) => v !== id) : [...selectedIds, id]);
	};

	const togglePage = () => {
		if (readOnly) return;

		if (allCurrentSelected) {
			onSelectionChange(selectedIds.filter((id) => !currentPageIds.includes(id)));
			return;
		}

		onSelectionChange(Array.from(new Set([...selectedIds, ...currentPageIds])));
	};

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortOrder('desc');
		}
	};

	const handleExportCsv = () => {
		const targetAnimals = selectedIds.length > 0 ? caravans.filter((c) => selectedSet.has(c.id)) : visible;
		const headers = ['Caravana', 'Sexo', 'Peso_kg', 'Categoria', 'Estado_Sanitario', 'Condicion'];
		const rows = targetAnimals.map((c) => [
			c.identification,
			c.sex === 'H' ? 'Hembra' : c.sex === 'M' ? 'Macho' : '—',
			c.current_weight != null ? c.current_weight : '',
			c.category_name ?? c.category ?? '',
			'Apto / Trazado',
			'Normal'
		]);

		const csvContent =
			'data:text/csv;charset=utf-8,' +
			[headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

		const encodedUri = encodeURI(csvContent);
		const link = document.createElement('a');
		link.setAttribute('href', encodedUri);
		link.setAttribute('download', `transferencia_animales.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Exact Pre-Service Table Cell Styles
	const headerCellStyle = {
		fontWeight: 800,
		fontSize: '0.72rem',
		color: 'text.secondary',
		textTransform: 'uppercase' as const,
		letterSpacing: 0.5,
		py: 1.25,
		px: 1.5,
		borderRight: '1px solid',
		borderBottom: '1px solid',
		borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'
	};

	const bodyCellStyle = {
		px: 1.5,
		py: 1.25,
		borderRight: '1px solid',
		borderBottom: '1px solid',
		borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9'
	};

	const zebraBg = isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa';

	const filters: { id: SexFilter; label: string; count: number }[] = [
		{ id: 'ALL', label: 'Todos', count: counts.all },
		{ id: 'H', label: 'Hembras', count: counts.females },
		{ id: 'M', label: 'Machos', count: counts.males }
	];

	return (
		<Paper
			elevation={0}
			sx={{
				width: '100%',
				borderRadius: '8px',
				border: '1px solid',
				borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
				bgcolor: isDark ? '#1e293b' : '#ffffff',
				boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
				overflow: 'hidden'
			}}
		>
			{/* Datatable Header Toolbar (Integrated Filters, Search & Table Actions) */}
			<Box
				sx={{
					p: 1.75,
					px: 2,
					borderBottom: '1px solid',
					borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
					bgcolor: isDark ? '#1e293b' : '#ffffff'
				}}
			>
				<Stack
					direction={{ xs: 'column', md: 'row' }}
					spacing={1.5}
					justifyContent="space-between"
					alignItems={{ xs: 'stretch', md: 'center' }}
				>
					{/* Search Input - Matching PreServiceFilterBar */}
					<TextField
						size="small"
						placeholder="Buscar por caravana o categoría…"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(0);
						}}
						sx={{
							flexGrow: 1,
							maxWidth: { md: 360 },
							'& .MuiOutlinedInput-root': {
								borderRadius: '6px',
								fontSize: '0.85rem',
								bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc'
							}
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<FuseSvgIcon size={18} color="action">
										heroicons-outline:magnifying-glass
									</FuseSvgIcon>
								</InputAdornment>
							)
						}}
					/>

					{/* Right Side: Segmented Filter Pills & Action Icons */}
					<Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
						{/* Segmented Sex Filter Pills - Matching PreServiceFilterBar */}
						<Box
							sx={{
								display: 'inline-flex',
								alignItems: 'center',
								gap: 0.25,
								p: 0.25,
								borderRadius: '8px',
								border: '1px solid',
								borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
								bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
								overflowX: 'auto'
							}}
						>
							{filters.map((filter) => {
								const isSelected = sexFilter === filter.id;
								return (
									<Button
										key={filter.id}
										size="small"
										onClick={() => {
											setSexFilter(filter.id);
											setPage(0);
										}}
										sx={{
											minWidth: 0,
											px: 1.25,
											height: 26,
											borderRadius: '6px',
											fontSize: '0.72rem',
											fontWeight: isSelected ? 700 : 500,
											textTransform: 'none',
											lineHeight: 1.2,
											color: isSelected
												? activeColor
												: isDark
													? '#94a3b8'
													: '#64748b',
											bgcolor: isSelected ? alpha(activeColor, 0.12) : 'transparent',
											'&:hover': {
												bgcolor: isSelected
													? alpha(activeColor, 0.16)
													: isDark
														? 'rgba(255, 255, 255, 0.07)'
														: '#edf1f5'
											},
											transition: 'background-color 160ms ease, color 160ms ease'
										}}
									>
										{filter.label} ({filter.count})
									</Button>
								);
							})}
						</Box>

						{/* Quick Actions */}
						<Stack direction="row" spacing={0.75} alignItems="center">
							{/* Assigning two hundred head one at a time is not work: the selection
							    already in hand is the natural unit to assign in one go. */}
							{showDestinationColumn && fieldEditor?.renderBulkDestination && (
								<Box sx={{ minWidth: 240 }}>{fieldEditor.renderBulkDestination(selectedIds)}</Box>
							)}
							{showDestinationColumn && !fieldEditor?.renderBulkDestination && (
								<TextField
									select
									size="small"
									value=""
									disabled={readOnly || selectedIds.length === 0 || (destinations?.length ?? 0) === 0}
									onChange={(e) => onAssign?.(selectedIds, e.target.value === CLEAR_DESTINATION ? null : e.target.value)}
									SelectProps={{ displayEmpty: true }}
									sx={{ minWidth: 210 }}
								>
									<MenuItem value="" disabled>
										Asignar seleccionados ({selectedIds.length})…
									</MenuItem>
									{(destinations ?? []).map((destination) => (
										<MenuItem key={destination.key} value={destination.key}>
											{destination.name.trim() || 'Destino sin nombre'}
											{destination.mode === 'new' ? ' (nuevo)' : ''}
										</MenuItem>
									))}
									<MenuItem value={CLEAR_DESTINATION}>Quitar destino (se decide en la manga)</MenuItem>
								</TextField>
							)}

							<Tooltip title="Limpiar selección">
								<span>
									<IconButton
										size="small"
										disabled={readOnly || selectedIds.length === 0}
										onClick={() => onSelectionChange([])}
										sx={{
											border: '1px solid',
											borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
											borderRadius: '6px',
											p: 0.75
										}}
									>
										<FuseSvgIcon size={16}>heroicons-outline:arrow-path</FuseSvgIcon>
									</IconButton>
								</span>
							</Tooltip>

							<Tooltip title="Exportar grilla a CSV">
								<IconButton
									size="small"
									onClick={handleExportCsv}
									sx={{
										border: '1px solid',
										borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
										borderRadius: '6px',
										p: 0.75
									}}
								>
									<FuseSvgIcon size={16}>heroicons-outline:arrow-down-tray</FuseSvgIcon>
								</IconButton>
							</Tooltip>
						</Stack>
					</Stack>
				</Stack>
			</Box>

			{/* Main Datatable Container (Exact match with PreServiceBullTable) */}
			<TableContainer>
				<Table sx={{ minWidth: 960, borderCollapse: 'collapse' }} size="small">
					<TableHead sx={{ bgcolor: isDark ? '#1e293b' : '#f8fafc' }}>
						<TableRow>
							{/* Checkbox Header */}
							<TableCell
								padding="checkbox"
								sx={{
									...headerCellStyle,
									pl: 2,
									width: 48
								}}
							>
								<Checkbox
									size="small"
									checked={allCurrentSelected}
									indeterminate={someCurrentSelected}
									disabled={readOnly}
									onChange={togglePage}
									sx={{
										color: isDark ? '#64748b' : '#94a3b8',
										'&.Mui-checked, &.MuiCheckbox-indeterminate': {
											color: isDark ? '#60a5fa' : '#0a6ed1'
										}
									}}
								/>
							</TableCell>

							{/* Caravana Oficial */}
							<TableCell
								onClick={() => handleSort('identification')}
								sx={{
									...headerCellStyle,
									minWidth: 200,
									cursor: 'pointer',
									'&:hover': { bgcolor: isDark ? '#334155' : '#f1f5f9' }
								}}
							>
								<Stack direction="row" alignItems="center" justifyContent="space-between">
									<span>Caravana Oficial</span>
									<FuseSvgIcon size={14} className="text-slate-400">
										heroicons-outline:chevron-up-down
									</FuseSvgIcon>
								</Stack>
							</TableCell>

							{/* Sexo */}
							<TableCell sx={{ ...headerCellStyle, width: 120, textAlign: 'center' }}>
								<span>Sexo</span>
							</TableCell>

							{/* Peso (kg) */}
							<TableCell
								align="right"
								onClick={() => handleSort('weight')}
								sx={{
									...headerCellStyle,
									width: 140,
									cursor: 'pointer',
									'&:hover': { bgcolor: isDark ? '#334155' : '#f1f5f9' }
								}}
							>
								<Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
									<span>Peso (kg)</span>
									<FuseSvgIcon
										size={14}
										className={sortField === 'weight' ? 'text-blue-600' : 'text-slate-400'}
									>
										{sortOrder === 'desc'
											? 'heroicons-outline:arrow-down'
											: 'heroicons-outline:arrow-up'}
									</FuseSvgIcon>
								</Stack>
							</TableCell>

							{/* Categoría: while editing, the current C/S is a reference and the new one is declared. */}
							<TableCell sx={{ ...headerCellStyle, minWidth: editing ? 240 : 180 }}>
								<span>{editing ? 'C/S actual → nueva' : 'Categoría'}</span>
							</TableCell>

							{editing ? (
								<>
									<TableCell sx={{ ...headerCellStyle, width: 150 }}>
										<span>Dientes</span>
									</TableCell>
									<TableCell sx={{ ...headerCellStyle, minWidth: 200, borderRight: showDestinationColumn ? undefined : 0 }}>
										<span>Observaciones</span>
									</TableCell>
								</>
							) : (
								<>
									{/* Estado Sanitario */}
									<TableCell sx={{ ...headerCellStyle, width: 180, textAlign: 'center' }}>
										<span>Estado Sanitario</span>
									</TableCell>

									{/* Condición */}
									<TableCell sx={{ ...headerCellStyle, width: 120, textAlign: 'center', borderRight: showDestinationColumn ? undefined : 0 }}>
										<span>Condición</span>
									</TableCell>
								</>
							)}

							{/* Lote destino, sólo en modo por animal */}
							{showDestinationColumn && (
								<TableCell sx={{ ...headerCellStyle, width: 200, borderRight: 0 }}>
									<span>Lote destino</span>
								</TableCell>
							)}
						</TableRow>
					</TableHead>

					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={columnCount} sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
									Cargando animales del lote…
								</TableCell>
							</TableRow>
						) : visible.length === 0 ? (
							<TableRow>
								<TableCell colSpan={columnCount} sx={{ py: 6, textAlign: 'center' }}>
									<Box
										sx={{
											width: 48,
											height: 48,
											mx: 'auto',
											mb: 1.5,
											borderRadius: '50%',
											bgcolor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#eff6ff',
											color: isDark ? '#60a5fa' : '#0a6ed1',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center'
										}}
									>
										<FuseSvgIcon size={24}>heroicons-outline:document-magnifying-glass</FuseSvgIcon>
									</Box>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>
										{caravans.length === 0
											? 'Este lote no tiene animales para transferir'
											: 'Ningún animal coincide con los filtros aplicados'}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{caravans.length === 0
											? 'Todos los animales ya han salido del lote de origen.'
											: 'Ajusta la búsqueda o selecciona otra categoría de sexo.'}
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							paginatedAnimals.map((caravan, idx) => {
								const isSelected = selectedSet.has(caravan.id);
								const isFemale = caravan.sex === 'H';
								const isEven = idx % 2 === 1;
								const category = caravan.category_name ?? caravan.category;

								const isEditable = editing && isSelected && !readOnly;
								const rowError = editing && isSelected ? fieldEditor?.errorOf(caravan.id) : null;
								// Typing in a cell must not toggle the row it sits in.
								const stop = (e: React.MouseEvent) => e.stopPropagation();

								return (
									<React.Fragment key={caravan.id}>
									<TableRow
										hover
										selected={isSelected}
										onClick={() => toggle(caravan.id)}
										sx={{
											cursor: 'pointer',
											bgcolor: isSelected
												? isEven
													? isDark ? 'rgba(37, 99, 235, 0.16)' : '#edf4fc'
													: isDark ? 'rgba(37, 99, 235, 0.06)' : '#f8fafd'
												: isEven
													? isDark ? 'rgba(255, 255, 255, 0.025)' : '#f8fafc'
													: 'inherit',
											'&.Mui-selected': {
												bgcolor: isEven
													? isDark ? 'rgba(37, 99, 235, 0.16)' : '#edf4fc'
													: isDark ? 'rgba(37, 99, 235, 0.06)' : '#f8fafd'
											},
											'&.Mui-selected:hover': {
												bgcolor: isDark ? 'rgba(37, 99, 235, 0.22)' : '#e2edfc'
											},
											'&:hover': {
												bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'
											},
											transition: 'background-color 0.15s ease'
										}}
									>
										{/* Checkbox */}
										<TableCell
											padding="checkbox"
											onClick={(e) => e.stopPropagation()}
											sx={{ ...bodyCellStyle, pl: 2, width: 48 }}
										>
											<Checkbox
												size="small"
												checked={isSelected}
												disabled={readOnly}
												onChange={() => toggle(caravan.id)}
												sx={{
													color: isDark ? '#64748b' : '#94a3b8',
													'&.Mui-checked': {
														color: isDark ? '#60a5fa' : '#0a6ed1'
													}
												}}
											/>
										</TableCell>

										{/* Caravana Oficial - Exact PreService Tag Format */}
										<TableCell sx={{ ...bodyCellStyle, fontWeight: 700, fontSize: '0.88rem' }}>
											<Box
												sx={{
													display: 'inline-flex',
													alignItems: 'center',
													gap: 1,
													borderRadius: '6px',
													p: 0.5,
													mx: -0.5,
													'&:hover': {
														bgcolor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
														'& .caravan-tag-text': {
															color: isDark ? '#60a5fa' : '#0a6ed1',
															textDecoration: 'underline'
														}
													},
													transition: 'all 0.15s ease'
												}}
											>
												<Box
													sx={{
														p: 0.5,
														borderRadius: '6px',
														bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
														color: isDark ? '#60a5fa' : '#0a6ed1',
														display: 'flex'
													}}
												>
													<FuseSvgIcon size={16}>heroicons-outline:identification</FuseSvgIcon>
												</Box>
												<Box>
													<Typography
														className="caravan-tag-text"
														variant="body2"
														sx={{
															fontWeight: 800,
															fontFamily: 'monospace',
															lineHeight: 1.2,
															color: isDark ? '#ffffff' : '#0f172a',
															fontSize: '0.85rem'
														}}
													>
														{caravan.identification}
													</Typography>
												</Box>
											</Box>
										</TableCell>

										{/* Sexo */}
										<TableCell sx={{ ...bodyCellStyle, textAlign: 'center' }}>
											{caravan.sex ? (
												<Chip
													size="small"
													label={isFemale ? 'Hembra' : 'Macho'}
													sx={{
														fontSize: '0.72rem',
														fontWeight: 700,
														borderRadius: '6px',
														height: 22,
														bgcolor: isFemale
															? isDark
																? 'rgba(244, 114, 182, 0.15)'
																: 'rgba(244, 114, 182, 0.12)'
															: isDark
																? 'rgba(96, 165, 250, 0.15)'
																: 'rgba(96, 165, 250, 0.12)',
														color: isFemale
															? isDark
																? '#f472b6'
																: '#be185d'
															: isDark
																? '#60a5fa'
																: '#1d4ed8'
													}}
												/>
											) : (
												<Typography variant="caption" color="text.secondary">
													—
												</Typography>
											)}
										</TableCell>

										{/* Peso (kg) */}
										<TableCell
											align="right"
											sx={{
												...bodyCellStyle,
												fontWeight: 700,
												fontSize: '0.85rem',
												fontFamily: 'monospace',
												color: caravan.current_weight == null ? 'text.disabled' : 'text.primary'
											}}
										>
											{isEditable ? (
												<Box onClick={stop}>{fieldEditor?.renderWeight(caravan.id)}</Box>
											) : caravan.current_weight != null ? (
												`${formatAverage(Number(caravan.current_weight))} kg`
											) : (
												'—'
											)}
										</TableCell>

										{/* Categoría */}
										<TableCell sx={{ ...bodyCellStyle }} onClick={isEditable ? stop : undefined}>
											{isEditable ? (
												fieldEditor?.renderCategory(caravan.id)
											) : (
												<Typography variant="body2" noWrap sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
													{category || 'Sin categoría'}
												</Typography>
											)}
										</TableCell>

										{editing && (
											<>
												<TableCell sx={{ ...bodyCellStyle }} onClick={isEditable ? stop : undefined}>
													{isEditable ? (
														fieldEditor?.renderTeeth(caravan.id)
													) : (
														<Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
															{fieldEditor?.teethOf(caravan.id)}
														</Typography>
													)}
												</TableCell>
												<TableCell
													sx={{ ...bodyCellStyle, borderRight: showDestinationColumn ? undefined : 0 }}
													onClick={isEditable ? stop : undefined}
												>
													{isEditable ? (
														fieldEditor?.renderObservations(caravan.id)
													) : (
														<Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
															—
														</Typography>
													)}
												</TableCell>
											</>
										)}

										{!editing && (
										<>
										{/* Estado Sanitario */}
										<TableCell sx={{ ...bodyCellStyle, textAlign: 'center' }}>
											<Chip
												size="small"
												icon={<FuseSvgIcon size={14}>heroicons-outline:check-circle</FuseSvgIcon>}
												label="Apto / Trazado"
												sx={{
													fontSize: '0.7rem',
													fontWeight: 700,
													borderRadius: '6px',
													height: 22,
													bgcolor: isDark
														? 'rgba(52, 211, 153, 0.15)'
														: 'rgba(16, 185, 129, 0.12)',
													color: isDark ? '#34d399' : '#059669'
												}}
											/>
										</TableCell>

										{/* Condición */}
										<TableCell sx={{ ...bodyCellStyle, textAlign: 'center', borderRight: showDestinationColumn ? undefined : 0 }}>
											<Chip
												size="small"
												variant="outlined"
												label="Normal"
												sx={{
													fontSize: '0.7rem',
													fontWeight: 600,
													borderRadius: '6px',
													height: 20,
													borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
													color: 'text.secondary'
												}}
											/>
										</TableCell>
										</>
										)}

										{showDestinationColumn && (
											<TableCell sx={{ ...bodyCellStyle, borderRight: 0, minWidth: 220 }} onClick={isEditable ? stop : undefined}>
												{fieldEditor?.renderDestination ? (
													isEditable ? (
														fieldEditor.renderDestination(caravan.id)
													) : (
														<Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
															—
														</Typography>
													)
												) : (
												<TransferDestinationCell
													caravanId={caravan.id}
													assignedKey={assignments[caravan.id]}
													destinations={destinations as Cact01Destination[]}
													onAssign={(id, key) => onAssign?.([id], key)}
													disabled={readOnly}
												/>
												)}
											</TableCell>
										)}
									</TableRow>

									{rowError && (
										<TableRow>
											<TableCell
												colSpan={columnCount}
												sx={{ py: 0.75, pl: 9, color: 'error.main', fontSize: '0.75rem', fontWeight: 600, borderRight: 0 }}
											>
												{rowError}
											</TableCell>
										</TableRow>
									)}
									</React.Fragment>
								);
							})
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{/* TablePagination - Exact PreServiceBullTable pagination specs */}
			<TablePagination
				rowsPerPageOptions={[10, 15, 25, 50]}
				component="div"
				count={visible.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={(_, newPage) => setPage(newPage)}
				onRowsPerPageChange={(e) => {
					setRowsPerPage(parseInt(e.target.value, 10));
					setPage(0);
				}}
				labelRowsPerPage="Filas por página:"
				labelDisplayedRows={({ from, to, count }) =>
					`${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
				}
				sx={{
					borderTop: '1px solid',
					borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
					bgcolor: isDark ? '#1e293b' : '#ffffff'
				}}
			/>
		</Paper>
	);
};

export default TransferAnimalsTable;
