import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import SheetGrid from '@/components/sheet-grid/SheetGrid';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import type { WeightRecord } from './BatchWeightChart';
import { eventLabel } from './batchWeightChartOptions';
import { formatDay, formatWeight } from './category-weight/categoryWeightModel';

interface BatchWeightHistoryTableProps {
    /** Oldest first, as the chart draws them. */
    records: WeightRecord[];
}

/** The figures behind the chart, newest first. */
export function BatchWeightHistoryTable({ records }: BatchWeightHistoryTableProps) {
    const { headSx, indexSx, textCellSx, zebraBg } = useGridCellStyles();
    const figure = (value: number | null | undefined, digits: number) => (value != null ? formatWeight(value, digits) : '—');

    return (
        <SheetGrid minWidth={640} maxHeight={360}>
            <TableHead>
                <TableRow>
                    <TableCell sx={indexSx}>#</TableCell>
                    <TableCell sx={{ ...headSx, width: 110 }}>Fecha</TableCell>
                    <TableCell sx={headSx}>Evento</TableCell>
                    <TableCell sx={{ ...headSx, width: 120 }} align="right">Promedio (kg/cab)</TableCell>
                    <TableCell sx={{ ...headSx, width: 110 }} align="right">Kg totales</TableCell>
                    <TableCell sx={{ ...headSx, width: 90 }} align="right">Cabezas</TableCell>
                    <TableCell sx={{ ...headSx, width: 90 }} align="right">Pesadas</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {[...records].reverse().map((record, index) => (
                    <TableRow key={record.id} sx={{ bgcolor: index % 2 === 1 ? zebraBg : 'inherit' }}>
                        <TableCell sx={indexSx}>{index + 1}</TableCell>
                        <TableCell sx={textCellSx}>{formatDay(record.weighing_date)}</TableCell>
                        <TableCell sx={textCellSx}>{eventLabel(record.type)}</TableCell>
                        <TableCell sx={{ ...textCellSx, fontWeight: 600 }} align="right">{figure(record.weight, 1)}</TableCell>
                        <TableCell sx={textCellSx} align="right">{figure(record.total_weight, 0)}</TableCell>
                        <TableCell sx={textCellSx} align="right">{record.caravans_count ?? '—'}</TableCell>
                        <TableCell sx={textCellSx} align="right">{record.weighed_count ?? '—'}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </SheetGrid>
    );
}

export default BatchWeightHistoryTable;
