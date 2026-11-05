import { Box, TableBody, TableCell, TableFooter, TableHead, TableRow, Tooltip } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { BatchCategoryCount } from '@/core/batches/domain/entities/BatchOverview';
import { categoryColor, formatWeight } from 'src/ui/batches/components/category-weight/categoryWeightModel';
import { EMPTY_VALUE } from '../../../utils/herdFormat';

interface HerdBatchCompositionTableProps {
	categories: BatchCategoryCount[];
	/** The lightest and the heaviest animal weighed, already formatted. */
	range: string;
}

const edgeLeft = { pl: 3, pr: 0.75 } as const;
const edgeRight = { pl: 0.75, pr: 3 } as const;
const middle = { px: 0.75 } as const;

/** Who is in the batch and what each category weighs today, in a sheet that runs edge to edge. */
export function HerdBatchCompositionTable({ categories, range }: HerdBatchCompositionTableProps) {
	const { isDark, headSx, textCellSx, headerBg } = useGridCellStyles();
	const head = { ...headSx, height: 32, py: 0, boxSizing: 'border-box' } as const;
	const cell = { ...textCellSx, height: 36, fontSize: '0.78rem', bgcolor: 'background.paper' } as const;
	const foot = { ...textCellSx, height: 32, fontSize: '0.78rem', color: 'text.primary', bgcolor: headerBg } as const;
	const totalHead = categories.reduce((sum, category) => sum + category.count, 0);
	const totalWeighed = categories.reduce((sum, category) => sum + category.weighed_count, 0);

	return (
		<SheetGrid
			minWidth={280}
			borderless
			sx={{ height: 'auto', borderTop: 1, borderColor: 'divider' }}
		>
			<TableHead>
				<TableRow>
					<TableCell sx={{ ...head, ...edgeLeft }}>Categoría</TableCell>
					<TableCell
						align="right"
						sx={{ ...head, ...middle, width: 40 }}
					>
						Cab.
					</TableCell>
					<TableCell
						align="right"
						sx={{ ...head, ...middle, width: 62 }}
					>
						Pesadas
					</TableCell>
					<TableCell
						align="right"
						sx={{ ...head, ...edgeRight, width: 74, whiteSpace: 'nowrap' }}
					>
						kg/cab
					</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{categories.map((category) => {
					const name = category.name ?? 'Sin categoría';
					const few = category.count > 0 && category.weighed_count / category.count < 0.5;

					return (
						<TableRow key={category.category_id ?? 'none'}>
							<TableCell
								title={name}
								className="truncate"
								sx={{ ...cell, ...edgeLeft, maxWidth: 0, fontWeight: 500 }}
							>
								<Box
									component="span"
									sx={{
										display: 'inline-block',
										width: 10,
										height: 3,
										mr: 0.75,
										verticalAlign: 'middle',
										borderRadius: '2px',
										bgcolor: categoryColor(category.category_id, isDark)
									}}
								/>
								{name}
							</TableCell>
							<TableCell
								align="right"
								sx={{ ...cell, ...middle }}
							>
								{category.count}
							</TableCell>
							<TableCell
								align="right"
								sx={{ ...cell, ...middle }}
							>
								{few && (
									<Tooltip
										title={`Promedio sobre ${category.weighed_count} de ${category.count} cabezas`}
									>
										<Box
											component="span"
											sx={{
												mr: 0.5,
												display: 'inline-flex',
												verticalAlign: 'text-bottom',
												color: 'warning.dark'
											}}
										>
											<FuseSvgIcon size={14}>heroicons-outline:exclamation-triangle</FuseSvgIcon>
										</Box>
									</Tooltip>
								)}
								{category.weighed_count}
							</TableCell>
							<TableCell
								align="right"
								sx={{ ...cell, ...edgeRight, fontWeight: 600 }}
							>
								{category.average_weight === null ? EMPTY_VALUE : formatWeight(category.average_weight)}
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell sx={{ ...foot, ...edgeLeft, fontWeight: 600 }}>Total</TableCell>
					<TableCell
						align="right"
						sx={{ ...foot, ...middle, fontWeight: 600 }}
					>
						{totalHead}
					</TableCell>
					<TableCell
						align="right"
						sx={{ ...foot, ...middle, fontWeight: 600 }}
					>
						{totalWeighed}
					</TableCell>
					<TableCell
						align="right"
						sx={{ ...foot, ...edgeRight, color: 'text.secondary' }}
					>
						{EMPTY_VALUE}
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell
						colSpan={2}
						sx={{ ...foot, ...edgeLeft, fontSize: '0.75rem', color: 'text.secondary', borderRight: 0 }}
					>
						Rango de pesos
					</TableCell>
					<TableCell
						colSpan={2}
						align="right"
						sx={{ ...foot, ...edgeRight, fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap' }}
					>
						{range}
					</TableCell>
				</TableRow>
			</TableFooter>
		</SheetGrid>
	);
}

export default HerdBatchCompositionTable;
