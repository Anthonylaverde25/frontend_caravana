import type { PendingTactoFemale } from '@/features/gestation/hooks/useServiceOrderIssuance';
import React, { useState } from 'react';
import { Checkbox, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import SheetGrid, { SheetGridHeight } from '@/components/sheet-grid/SheetGrid';
import SheetGridEmptyRow from '@/components/sheet-grid/SheetGridEmptyRow';
import { useGridCellStyles } from '@/components/sheet-grid/useGridCellStyles';
import { LotGroup } from '../lotGroups';
import { OrderSelection } from '../useCreateOrderV2Wizard';
import LotGroupRows from './LotGroupRows';
import type { PlannedSemenCells } from './LotFemaleRow';

interface LotFemalesGridProps {
	groups: LotGroup[];
	searching: boolean;
	registering: boolean;
	picksOnly: boolean;
	selection: OrderSelection;
	registrable: Caravan[];
	owingTacto: ReadonlyMap<number, PendingTactoFemale>;
	maxHeight?: SheetGridHeight;
	semen?: PlannedSemenCells;
	onMarkLot: (group: LotGroup) => void;
	onMarkVisible: () => void;
	onDropVisible: () => void;
	onSetApart: (batch: Batch, ids: number[]) => void;
}

/** The batches of the selector, each with its checkbox and, once marked, its females. */
export const LotFemalesGrid: React.FC<LotFemalesGridProps> = ({
	groups,
	searching,
	registering,
	picksOnly,
	selection,
	registrable,
	owingTacto,
	maxHeight,
	semen,
	onMarkLot,
	onMarkVisible,
	onDropVisible,
	onSetApart
}) => {
	const { headSx } = useGridCellStyles();
	const [folded, setFolded] = useState<Set<number>>(new Set());
	const columns = 5 + (semen ? 1 : 0);
	const marked = groups.filter((group) => group.state).length;

	const toggleFolded = (batchId: number) =>
		setFolded((prev) => {
			const next = new Set(prev);

			if (next.has(batchId)) next.delete(batchId);
			else next.add(batchId);

			return next;
		});

	return (
		<SheetGrid
			minWidth={560 + (semen ? 260 : 0)}
			maxHeight={maxHeight}
		>
			<TableHead>
				<TableRow>
					<TableCell
						align="center"
						sx={{ ...headSx, width: 44, px: 0 }}
					>
						<Tooltip title="Todos los lotes visibles">
							<span>
								<Checkbox
									size="small"
									checked={groups.length > 0 && marked === groups.length}
									indeterminate={marked > 0 && marked < groups.length}
									disabled={groups.length === 0}
									onChange={(e) => (e.target.checked ? onMarkVisible() : onDropVisible())}
								/>
							</span>
						</Tooltip>
					</TableCell>
					<TableCell sx={{ ...headSx, minWidth: 170 }}>Caravana</TableCell>
					<TableCell sx={{ ...headSx, width: 170 }}>Categoría</TableCell>
					<TableCell sx={{ ...headSx, width: 170 }}>Raza</TableCell>
					{semen && <TableCell sx={{ ...headSx, width: 260 }}>Semen previsto</TableCell>}
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{groups.length === 0 ? (
					<SheetGridEmptyRow colSpan={columns}>
						{searching
							? 'Ningún lote o caravana coincide con la búsqueda.'
							: 'No se encontraron lotes de Cría.'}
					</SheetGridEmptyRow>
				) : (
					groups.map((group) => (
						<LotGroupRows
							key={group.batch.id}
							group={group}
							columns={columns}
							open={searching || !folded.has(group.batch.id)}
							searching={searching}
							registering={registering}
							picksOnly={picksOnly}
							selection={selection}
							registrable={registrable}
							owingTacto={owingTacto}
							semen={semen}
							onMark={() => onMarkLot(group)}
							onToggleFolded={() => toggleFolded(group.batch.id)}
							onSetApart={onSetApart}
						/>
					))
				)}
			</TableBody>
		</SheetGrid>
	);
};

export default LotFemalesGrid;
