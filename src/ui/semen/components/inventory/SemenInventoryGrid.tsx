import { Button, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { SemenInventoryRow } from '@/core/semen/domain/entities/Semen';
import { IdentifyTarget } from '../identify/IdentifySemenLotDialog';
import SemenItemRows from './SemenItemRows';
import { SEMEN_GRID_COLUMNS } from './semenGrid';

interface SemenInventoryGridProps {
	rows: SemenInventoryRow[];
	loading: boolean;
	warehouseId: number | null;
	emptyMessage: string;
	onOpenLot: (lotId: number) => void;
	onIdentify: (target: IdentifyTarget) => void;
	onReceive: () => void;
}


/** One group per semen (sire + type) with its lots and its straws without lot (plan 4.7). */
export default function SemenInventoryGrid({ rows, loading, warehouseId, emptyMessage, onOpenLot, onIdentify, onReceive }: SemenInventoryGridProps) {
	const { headSx, indexSx } = useGridCellStyles();

	return (
		<SheetGrid minWidth={900} maxHeight={{ xs: 560, lg: 'calc(100vh - 330px)' }}>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={{ ...headSx, width: 170 }}>Partida</TableCell>
					<TableCell sx={{ ...headSx, width: 120 }}>Colección</TableCell>
					<TableCell sx={headSx}>Primer ingreso</TableCell>
					<TableCell sx={{ ...headSx, width: 240 }}>Pajuelas por termo</TableCell>
					<TableCell sx={{ ...headSx, width: 100 }} align="right">Total</TableCell>
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{!loading && rows.length === 0 && (
					<SheetGridEmptyRow colSpan={SEMEN_GRID_COLUMNS}>
						{emptyMessage}{' '}
						<Button size="small" onClick={onReceive} sx={{ textTransform: 'none', fontWeight: 700 }}>Ingresar semen</Button>
					</SheetGridEmptyRow>
				)}
				{rows.map((row) => (
					<SemenItemRows key={row.item.id} row={row} warehouseId={warehouseId} onOpenLot={onOpenLot} onIdentify={onIdentify} />
				))}
			</TableBody>
		</SheetGrid>
	);
}
