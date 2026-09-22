import { ReactNode } from 'react';
import { Box, Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from '@mui/material';

export interface SimpleColumn<T> {
	key: string;
	header: string;
	align?: 'left' | 'right';
	width?: number | string;
	render: (row: T) => ReactNode;
}

interface SimpleTableProps<T> {
	columns: SimpleColumn<T>[];
	rows: T[];
	getRowKey: (row: T) => string;
	/** Rows rendered muted (e.g. a batch without pregnancy check). */
	isRowMuted?: (row: T) => boolean;
	footer?: ReactNode[];
}

const EDGE_PX = 3;

/** Read-only table used inside flush WidgetCards. Numeric columns align right with tabular figures. */
export function SimpleTable<T>({ columns, rows, getRowKey, isRowMuted, footer }: SimpleTableProps<T>) {
	const pad = (index: number) => ({
		pl: index === 0 ? EDGE_PX : 1.5,
		pr: index === columns.length - 1 ? EDGE_PX : 1.5
	});

	return (
		<Box sx={{ overflowX: 'auto' }}>
			<Table
				size="small"
				sx={{ '& td, & th': { fontVariantNumeric: 'tabular-nums', borderColor: 'divider' } }}
			>
				<TableHead>
					<TableRow sx={{ bgcolor: 'action.hover' }}>
						{columns.map((col, i) => (
							<TableCell
								key={col.key}
								align={col.align ?? 'left'}
								sx={{
									...pad(i),
									py: 1.25,
									width: col.width,
									fontSize: '0.75rem',
									fontWeight: 600,
									letterSpacing: '0.05em',
									textTransform: 'uppercase',
									color: 'text.secondary',
									whiteSpace: 'nowrap'
								}}
							>
								{col.header}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row) => (
						<TableRow
							key={getRowKey(row)}
							sx={{ bgcolor: isRowMuted?.(row) ? 'action.hover' : 'transparent' }}
						>
							{columns.map((col, i) => (
								<TableCell
									key={col.key}
									align={col.align ?? 'left'}
									sx={{ ...pad(i), py: 1.75, fontSize: '0.875rem', verticalAlign: 'middle' }}
								>
									{col.render(row)}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
				{footer && (
					<TableFooter>
						<TableRow sx={{ bgcolor: 'action.hover', borderTop: 2, borderColor: 'divider' }}>
							{footer.map((cell, i) => (
								<TableCell
									key={columns[i]?.key ?? i}
									align={columns[i]?.align ?? 'left'}
									sx={{
										...pad(i),
										py: 1.5,
										fontSize: '0.875rem',
										fontWeight: 700,
										color: 'text.primary'
									}}
								>
									{cell}
								</TableCell>
							))}
						</TableRow>
					</TableFooter>
				)}
			</Table>
		</Box>
	);
}

/** Two-line cell: primary text plus a secondary caption. */
export function StackedCell({ primary, secondary }: { primary: ReactNode; secondary?: ReactNode }) {
	return (
		<Box>
			<Box sx={{ fontWeight: 600, color: 'text.primary' }}>{primary}</Box>
			{secondary && <Box sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>{secondary}</Box>}
		</Box>
	);
}

export default SimpleTable;
