import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { BlockSize, TableBlock } from '@/core/assistant/domain/AssistantTypes';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { useEntityDrawer } from '../entity-drawer/EntityDrawerContext';
import EntityCellLink from './EntityCellLink';
import { formatCell } from './formatCell';

/** Columns holding an ear tag get the grid's identification look (monospace, bold, primary). */
const IDENTIFICATION_KEYS = new Set(['caravana', 'madre', 'cria', 'toro']);

/**
 * A read-only dataset, drawn with the app's spreadsheet grid tokens. Rows come straight from the
 * API; the model only picked the columns. A cell whose column names an entity and whose row carries
 * its id opens that record's detail.
 */
export function TableBlockView({ block, size = 'compact' }: { block: TableBlock; size?: BlockSize }) {
	const { cellSx, headerBg, zebraBg } = useGridCellStyles();
	const entityDrawer = useEntityDrawer();
	const shown = block.rows.length;

	return (
		<Box>
			{block.title && (
				<Typography
					sx={{
						fontSize: '0.8rem',
						fontWeight: 700,
						color: 'text.primary',
						mb: 0.75
					}}
				>
					{block.title}
				</Typography>
			)}
			<Paper
				elevation={0}
				sx={{
					border: 1,
					borderColor: 'divider',
					borderRadius: '4px',
					overflow: 'hidden'
				}}
			>
				<TableContainer sx={{ maxHeight: size === 'full' ? 560 : 340 }}>
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
								{block.columns.map((column) => (
									<TableCell
										key={column.key}
										sx={{
											...cellSx,
											bgcolor: headerBg,
											fontWeight: 700,
											px: 1.5,
											py: 1,
											fontSize: '0.75rem',
											whiteSpace: 'nowrap'
										}}
									>
										{column.label}
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{block.rows.map((row, rowIndex) => (
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
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>
			<Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', mt: 0.5 }}>
				{shown === block.total_rows
					? `${block.total_rows} ${block.total_rows === 1 ? 'fila' : 'filas'}`
					: `Mostrando ${shown} de ${block.total_rows} filas`}
			</Typography>
		</Box>
	);
}

export default TableBlockView;
