import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { CategoryCurve, formatDay, formatWeight, massAsOf } from './categoryWeightModel';

interface BatchCategoryWeightTableProps {
	curves: CategoryCurve[];
	days: string[];
}

/** The figures behind the chart, newest first. A dash: that category was not weighed that day. */
export function BatchCategoryWeightTable({ curves, days }: BatchCategoryWeightTableProps) {
	const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();

	return (
		<SheetGrid
			minWidth={280 + curves.length * 130}
			maxHeight={360}
		>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={{ ...headSx, width: 110 }}>Fecha</TableCell>
					{curves.map((curve) => (
						<TableCell
							key={curve.key}
							sx={headSx}
							align="right"
						>{`${curve.name} (kg)`}</TableCell>
					))}
					<TableCell
						sx={{ ...headSx, width: 120 }}
						align="right"
					>
						Kg totales
					</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{[...days].reverse().map((day, index) => (
					<TableRow
						key={day}
						sx={{ bgcolor: index % 2 === 1 ? zebraBg : 'inherit' }}
					>
						<TableCell sx={indexSx}>{index + 1}</TableCell>
						<TableCell sx={textCellSx}>{formatDay(day)}</TableCell>
						{curves.map((curve) => {
							const point = curve.points.find((candidate) => candidate.weighing_date === day);

							return (
								<TableCell
									key={curve.key}
									sx={{ ...textCellSx, color: point ? 'text.primary' : 'text.disabled' }}
									align="right"
								>
									{point ? formatWeight(point.average_weight) : '—'}
								</TableCell>
							);
						})}
						<TableCell
							sx={{ ...textCellSx, fontWeight: 600 }}
							align="right"
						>
							{formatWeight(massAsOf(curves, day), 0)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</SheetGrid>
	);
}

export default BatchCategoryWeightTable;
