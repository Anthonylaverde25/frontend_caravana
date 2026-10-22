import type { ReactNode } from 'react';
import { TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { EntityRef } from '@/core/assistant/domain/AssistantTypes';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import SheetGridEmptyRow from '@/components/sheet-grid/SheetGridEmptyRow';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import EntityCellLink from '../../blocks/EntityCellLink';
import { useEntityDrawer } from '../EntityDrawerContext';

export interface EntityListColumn<T> {
	key: string;
	label: string;
	width?: number;
	align?: 'left' | 'right';
	/** Ear tags and codes: monospace and bold, like the identification cell of the grids. */
	tag?: boolean;
	value: (row: T) => string;
	/** The record this cell opens on top of the current drawer. */
	link?: (row: T) => EntityRef | null;
}

interface EntityListGridProps<T> {
	title: string;
	columns: EntityListColumn<T>[];
	rows: T[];
	rowKey: (row: T) => string | number;
	empty: string;
	footer?: ReactNode;
}

/** A read-only list inside an entity drawer, with the spreadsheet grid look; linked cells open their record. */
export function EntityListGrid<T>({ title, columns, rows, rowKey, empty, footer }: EntityListGridProps<T>) {
	const { headSx, textCellSx, zebraBg } = useGridCellStyles();
	const drawer = useEntityDrawer();

	return (
		<>
			<Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 1 }}>{title}</Typography>
			<SheetGrid
				minWidth={columns.reduce((sum, c) => sum + (c.width ?? 100), 0)}
				maxHeight={480}
			>
				<TableHead>
					<TableRow>
						{columns.map((column) => (
							<TableCell
								key={column.key}
								align={column.align}
								sx={{ ...headSx, width: column.width }}
							>
								{column.label}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.length === 0 ? (
						<SheetGridEmptyRow colSpan={columns.length}>{empty}</SheetGridEmptyRow>
					) : (
						rows.map((row, index) => (
							<TableRow
								key={rowKey(row)}
								sx={{ bgcolor: index % 2 === 1 ? zebraBg : undefined }}
							>
								{columns.map((column) => {
									const text = column.value(row);
									const ref = drawer && column.link ? column.link(row) : null;

									return (
										<TableCell
											key={column.key}
											align={column.align}
											sx={{
												...textCellSx,
												whiteSpace: 'nowrap',
												fontVariantNumeric: 'tabular-nums',
												...(column.tag && { fontFamily: 'monospace', fontWeight: 700 })
											}}
										>
											{ref && drawer ? (
												<EntityCellLink
													text={text}
													onOpen={() =>
														drawer.openEntity({ ...ref, label: ref.label ?? text })
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
			</SheetGrid>
			{footer}
		</>
	);
}

export default EntityListGrid;
