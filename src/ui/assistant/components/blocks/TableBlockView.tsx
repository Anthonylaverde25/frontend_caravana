import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { BlockSize, TableBlock, TableCell as TableCellValue } from '@/core/assistant/domain/AssistantTypes';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { useEntityDrawer } from '../entity-drawer/EntityDrawerContext';
import EntityCellLink from './EntityCellLink';
import { formatCell } from './formatCell';
import { exportDatasetToCsv, exportDatasetToPdf } from '../../utils/exportDataset';

/** Columns holding an ear tag get the grid's identification look (monospace, bold, primary). */
const IDENTIFICATION_KEYS = new Set(['caravana', 'madre', 'cria', 'toro']);

/** Keys that represent summable numeric quantities or amounts. */
const SUMMABLE_KEYS = new Set([
	'costo_total',
	'costo',
	'cantidad',
	'cabezas',
	'cabezas_tratadas',
	'peso_total',
	'total'
]);

/** Format currency numbers for summary cells. */
function formatSumCell(key: string, value: number): string {
	if (key.includes('costo') || key.includes('monto') || key.includes('precio')) {
		return `$ ${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	}
	return value.toLocaleString('es-AR', { maximumFractionDigits: 2 });
}

/**
 * A rich read-only dataset view with spreadsheet grid styling, column sorting,
 * client-side text filtering, summary totals row, and export to CSV/Excel and PDF.
 */
export function TableBlockView({ block, size = 'compact' }: { block: TableBlock; size?: BlockSize }) {
	const { cellSx, headerBg, zebraBg } = useGridCellStyles();
	const entityDrawer = useEntityDrawer();

	const [filterText, setFilterText] = useState('');
	const [sortKey, setSortKey] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

	// Handle sort toggle
	const handleHeaderClick = (key: string) => {
		if (sortKey !== key) {
			setSortKey(key);
			setSortDirection('asc');
		} else if (sortDirection === 'asc') {
			setSortDirection('desc');
		} else {
			setSortKey(null);
			setSortDirection('asc');
		}
	};

	// Filter rows client-side
	const filteredRows = useMemo(() => {
		if (!filterText.trim()) {
			return block.rows;
		}
		const query = filterText.toLowerCase().trim();
		return block.rows.filter((row) =>
			block.columns.some((col) => {
				const val = row[col.key];
				if (val === null || val === undefined) return false;
				return String(val).toLowerCase().includes(query);
			})
		);
	}, [block.rows, block.columns, filterText]);

	// Sort rows
	const sortedRows = useMemo(() => {
		if (!sortKey) return filteredRows;

		return [...filteredRows].sort((a, b) => {
			const valA = a[sortKey];
			const valB = b[sortKey];

			if (valA === valB) return 0;
			if (valA === null || valA === undefined) return 1;
			if (valB === null || valB === undefined) return -1;

			if (typeof valA === 'number' && typeof valB === 'number') {
				return sortDirection === 'asc' ? valA - valB : valB - valA;
			}

			const strA = String(valA).toLowerCase();
			const strB = String(valB).toLowerCase();
			return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
		});
	}, [filteredRows, sortKey, sortDirection]);

	// Calculate sums for summable columns
	const sums = useMemo(() => {
		const result: Record<string, number> = {};
		let hasAnySum = false;

		for (const col of block.columns) {
			if (SUMMABLE_KEYS.has(col.key)) {
				let total = 0;
				let count = 0;
				for (const row of sortedRows) {
					const val = row[col.key];
					if (typeof val === 'number') {
						total += val;
						count++;
					}
				}
				if (count > 0) {
					result[col.key] = total;
					hasAnySum = true;
				}
			}
		}

		return hasAnySum ? result : null;
	}, [block.columns, sortedRows]);

	// Prepare dataset for export (matching currently visible/filtered rows)
	const exportableBlock: TableBlock = useMemo(
		() => ({
			...block,
			rows: sortedRows,
			total_rows: sortedRows.length
		}),
		[block, sortedRows]
	);

	const isFull = size === 'full';
	const shownCount = sortedRows.length;

	return (
		<Box>
			{/* Header Toolbar: Title, Filter, Export Action Buttons */}
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', sm: 'row' },
					alignItems: { xs: 'stretch', sm: 'center' },
					justifyContent: 'space-between',
					gap: 1,
					mb: 1
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
					{block.title && (
						<Typography
							sx={{
								fontSize: isFull ? '0.9rem' : '0.8rem',
								fontWeight: 700,
								color: 'text.primary'
							}}
						>
							{block.title}
						</Typography>
					)}
					<Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
						{filterText
							? `${shownCount} de ${block.total_rows} filas`
							: `${block.total_rows} ${block.total_rows === 1 ? 'fila' : 'filas'}`}
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
					{/* Quick Search Field */}
					{block.rows.length > 3 && (
						<TextField
							size="small"
							placeholder="Buscar en tabla..."
							value={filterText}
							onChange={(e) => setFilterText(e.target.value)}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<FuseSvgIcon size={14} sx={{ color: 'text.disabled' }}>
											heroicons-outline:magnifying-glass
										</FuseSvgIcon>
									</InputAdornment>
								),
								sx: {
									fontSize: '0.75rem',
									height: 28,
									minWidth: { xs: '100%', sm: 140 },
									bgcolor: 'background.paper',
									'& .MuiInputBase-input': { py: 0.5, px: 0.5 }
								}
							}}
						/>
					)}

					{/* Export to CSV / Excel */}
					<Tooltip title="Descargar como planilla (CSV / Excel UTF-8)">
						{isFull ? (
							<Button
								size="small"
								variant="outlined"
								onClick={() => exportDatasetToCsv(exportableBlock)}
								startIcon={<FuseSvgIcon size={14}>heroicons-outline:table-cells</FuseSvgIcon>}
								sx={{
									fontSize: '0.72rem',
									textTransform: 'none',
									py: 0.4,
									px: 1,
									height: 28,
									borderColor: 'divider',
									color: 'text.secondary',
									'&:hover': { borderColor: 'primary.main', color: 'primary.main' }
								}}
							>
								Excel / CSV
							</Button>
						) : (
							<IconButton
								size="small"
								onClick={() => exportDatasetToCsv(exportableBlock)}
								sx={{
									p: 0.5,
									border: 1,
									borderColor: 'divider',
									borderRadius: '4px',
									bgcolor: 'background.paper'
								}}
							>
								<FuseSvgIcon size={14} sx={{ color: 'text.secondary' }}>
									heroicons-outline:table-cells
								</FuseSvgIcon>
							</IconButton>
						)}
					</Tooltip>

					{/* Export to PDF */}
					<Tooltip title="Descargar como documento PDF">
						{isFull ? (
							<Button
								size="small"
								variant="outlined"
								onClick={() => exportDatasetToPdf(exportableBlock)}
								startIcon={<FuseSvgIcon size={14}>heroicons-outline:document-text</FuseSvgIcon>}
								sx={{
									fontSize: '0.72rem',
									textTransform: 'none',
									py: 0.4,
									px: 1,
									height: 28,
									borderColor: 'divider',
									color: 'text.secondary',
									'&:hover': { borderColor: 'primary.main', color: 'primary.main' }
								}}
							>
								PDF
							</Button>
						) : (
							<IconButton
								size="small"
								onClick={() => exportDatasetToPdf(exportableBlock)}
								sx={{
									p: 0.5,
									border: 1,
									borderColor: 'divider',
									borderRadius: '4px',
									bgcolor: 'background.paper'
								}}
							>
								<FuseSvgIcon size={14} sx={{ color: 'text.secondary' }}>
									heroicons-outline:document-text
								</FuseSvgIcon>
							</IconButton>
						)}
					</Tooltip>
				</Box>
			</Box>

			{/* Main Table Container */}
			<Paper
				elevation={0}
				sx={{
					border: 1,
					borderColor: 'divider',
					borderRadius: '4px',
					overflow: 'hidden'
				}}
			>
				<TableContainer sx={{ maxHeight: isFull ? 560 : 340 }}>
					<Table
						stickyHeader
						size="small"
						sx={{
							borderCollapse: 'collapse',
							minWidth: Math.max(320, block.columns.length * 110)
						}}
					>
						<TableHead>
							<TableRow>
								{block.columns.map((column) => {
									const isSorted = sortKey === column.key;
									return (
										<TableCell
											key={column.key}
											onClick={() => handleHeaderClick(column.key)}
											sx={{
												...cellSx,
												bgcolor: headerBg,
												fontWeight: 700,
												px: 1.5,
												py: 1,
												fontSize: '0.75rem',
												whiteSpace: 'nowrap',
												cursor: 'pointer',
												userSelect: 'none',
												'&:hover': {
													bgcolor: 'action.hover'
												}
											}}
										>
											<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
												<span>{column.label}</span>
												{isSorted && (
													<FuseSvgIcon size={12} sx={{ color: 'primary.main' }}>
														{sortDirection === 'asc'
															? 'heroicons-outline:chevron-up'
															: 'heroicons-outline:chevron-down'}
													</FuseSvgIcon>
												)}
											</Box>
										</TableCell>
									);
								})}
							</TableRow>
						</TableHead>
						<TableBody>
							{sortedRows.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={block.columns.length}
										sx={{ textAlign: 'center', py: 3, color: 'text.disabled', fontSize: '0.8rem' }}
									>
										No se encontraron registros coincidentes
									</TableCell>
								</TableRow>
							) : (
								sortedRows.map((row, rowIndex) => (
									<TableRow
										key={rowIndex}
										sx={{ bgcolor: rowIndex % 2 === 1 ? zebraBg : undefined }}
									>
										{block.columns.map((column) => {
											const isTag = IDENTIFICATION_KEYS.has(column.key);
											const text = formatCell(row[column.key]);
											const refId = column.entity ? block.refs?.[rowIndex]?.[column.key] : undefined;
											const kind = column.entity;

											return (
												<TableCell
													key={column.key}
													sx={{
														...cellSx,
														px: 1.5,
														py: 0.75,
														fontSize: '0.8rem',
														whiteSpace: 'nowrap',
														...(isTag && {
															fontFamily: 'monospace',
															fontWeight: 700,
															color: 'primary.main'
														})
													}}
												>
													{entityDrawer && kind && refId != null ? (
														<EntityCellLink
															text={text}
															onOpen={() =>
																entityDrawer.openEntity({
																	kind,
																	id: refId,
																	label: text,
																	scope: column.scope
																})
															}
														/>
													) : (
														text
													)}
												</TableCell>
											);
										})}
									</TableRow>
								))
							)}
						</TableBody>

						{/* Summary Footer Totals Row */}
						{sums && sortedRows.length > 0 && (
							<TableFooter>
								<TableRow sx={{ bgcolor: headerBg, borderTop: 2, borderColor: 'divider' }}>
									{block.columns.map((column, colIdx) => {
										const hasSum = sums[column.key] !== undefined;
										const isFirst = colIdx === 0;

										return (
											<TableCell
												key={column.key}
												sx={{
													...cellSx,
													px: 1.5,
													py: 1,
													fontSize: '0.78rem',
													fontWeight: 700,
													color: 'text.primary',
													whiteSpace: 'nowrap'
												}}
											>
												{hasSum
													? formatSumCell(column.key, sums[column.key])
													: isFirst
														? 'Totales (∑)'
														: ''}
											</TableCell>
										);
									})}
								</TableRow>
							</TableFooter>
						)}
					</Table>
				</TableContainer>
			</Paper>
		</Box>
	);
}

export default TableBlockView;
