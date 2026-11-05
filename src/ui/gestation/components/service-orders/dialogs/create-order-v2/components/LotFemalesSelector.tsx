import React, { useMemo, useState } from 'react';
import { Button, Chip, InputAdornment, Stack, TextField } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Batch } from '@/core/batches/domain/entities/Batch';
import type { PendingTactoFemale } from '@/features/gestation/hooks/useServiceOrderIssuance';
import { Caravan } from '@/core/caravans/domain/entities/Caravan';
import type { SheetGridHeight } from '@/components/sheet-grid/SheetGrid';
import BatchQuickTransferDialog from '@/ui/batches/components/details/BatchQuickTransferDialog';
import { LotFemales, registrableFemales } from '../lotFemales';
import { buildLotGroups, LotGroup } from '../lotGroups';
import { lotFemaleCount } from '../orderSheetPayload';
import { OrderSelection } from '../useCreateOrderV2Wizard';
import { OrderSheetMode, ServiceMethodType } from '../types';
import LotFemalesGrid from './LotFemalesGrid';
import type { PlannedSemenCells } from './LotFemaleRow';

export interface LotFemalesSelectorProps {
	batches: Batch[];
	allCaravans: Caravan[];
	femalesByBatch: Map<number, LotFemales>;
	owingTacto: ReadonlyMap<number, PendingTactoFemale>;
	mode: OrderSheetMode;
	type: ServiceMethodType;
	selection: OrderSelection;
	maxHeight?: SheetGridHeight;
	/** Shown right above the grid. */
	toolbar?: React.ReactNode;
	/** AI orders: the semen planned for each female. */
	semen?: PlannedSemenCells;
}

/**
 * The Cría batches of the sheet, grouped as a grid: each marked batch becomes its own order and
 * unfolds its females. By the rules of the service they enter all together or picked one by one.
 */
export const LotFemalesSelector: React.FC<LotFemalesSelectorProps> = ({
	batches,
	allCaravans,
	femalesByBatch,
	owingTacto,
	mode,
	type,
	selection,
	maxHeight,
	toolbar,
	semen
}) => {
	const [search, setSearch] = useState('');
	const [settingApart, setSettingApart] = useState<{ batch: Batch; ids: number[] } | null>(null);
	const registering = mode === 'register';
	const picksOnly = registering || type === 'AI';
	const term = search.trim().toLowerCase();

	const registrable = useMemo(() => (registering ? registrableFemales(allCaravans) : []), [registering, allCaravans]);
	const groups = useMemo(
		() =>
			buildLotGroups({
				batches,
				femalesByBatch,
				selected: selection.selectedBatches,
				registering,
				registrable,
				term
			}),
		[batches, femalesByBatch, selection.selectedBatches, registering, registrable, term]
	);

	const lots = Array.from(selection.selectedBatches.values());
	const totalFemales = lots.reduce((sum, lot) => sum + lotFemaleCount(lot, femalesByBatch.get(lot.batchId)), 0);

	const markLot = ({ batch, pickable }: LotGroup) =>
		selection.toggleBatch(
			batch.id,
			batch.name,
			pickable.map((f) => f.id!),
			picksOnly ? 'partial' : 'complete'
		);

	const markVisible = () =>
		groups.forEach((group) => {
			const { batch, state, rows } = group;

			if (!state) {
				markLot(group);
			} else if (state.mode === 'partial') {
				selection.setCaravansInBatch(batch.id, [
					...new Set([...state.selectedCaravanIds, ...rows.map((f) => f.id!)])
				]);
			}
		});

	const dropVisible = () =>
		groups.forEach(({ batch, state }) => {
			if (state) selection.toggleBatch(batch.id, batch.name, [], state.mode);
		});

	return (
		<Stack spacing={1.5}>
			<Stack
				direction={{ xs: 'column', lg: 'row' }}
				spacing={1.5}
				alignItems={{ lg: 'center' }}
				justifyContent="space-between"
			>
				<TextField
					size="small"
					placeholder="Buscar lote o caravana…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					sx={{ minWidth: { sm: 220 }, flex: { sm: 1 } }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<FuseSvgIcon
									size={16}
									color="action"
								>
									heroicons-outline:magnifying-glass
								</FuseSvgIcon>
							</InputAdornment>
						)
					}}
				/>
				<Stack
					direction="row"
					spacing={1}
					alignItems="center"
				>
					{lots.length > 0 && (
						<Button
							size="small"
							color="inherit"
							onClick={() =>
								lots.forEach((lot) => selection.toggleBatch(lot.batchId, lot.batchName, [], lot.mode))
							}
							sx={{ textTransform: 'none', fontSize: '0.78rem', color: 'text.secondary' }}
						>
							Desmarcar todo
						</Button>
					)}
					{groups.length > 0 && (
						<Button
							size="small"
							variant="outlined"
							onClick={markVisible}
							sx={{ textTransform: 'none', fontSize: '0.78rem', fontWeight: 600, height: 34 }}
						>
							Marcar visibles ({groups.length})
						</Button>
					)}
				</Stack>
			</Stack>

			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
				flexWrap="wrap"
				useFlexGap
				sx={{
					px: 1.5,
					py: 1,
					borderRadius: '6px',
					bgcolor: 'action.hover',
					border: '1px solid',
					borderColor: 'divider'
				}}
			>
				<Chip
					size="small"
					color="primary"
					label={`${lots.length} orden(es) a generar`}
					sx={{ fontWeight: 700, fontSize: '0.8rem' }}
				/>
				<Chip
					size="small"
					variant="outlined"
					label={`${totalFemales} vientre(s)`}
					sx={{ fontWeight: 600, fontSize: '0.78rem' }}
				/>
			</Stack>

			{toolbar}

			<LotFemalesGrid
				groups={groups}
				searching={term !== ''}
				registering={registering}
				picksOnly={picksOnly}
				selection={selection}
				registrable={registrable}
				owingTacto={owingTacto}
				maxHeight={maxHeight}
				semen={semen}
				onMarkLot={markLot}
				onMarkVisible={markVisible}
				onDropVisible={dropVisible}
				onSetApart={(batch, ids) => setSettingApart({ batch, ids })}
			/>

			<BatchQuickTransferDialog
				open={settingApart !== null}
				onClose={() => setSettingApart(null)}
				batch={settingApart?.batch}
				initialSelectedIds={settingApart?.ids}
			/>
		</Stack>
	);
};

export default LotFemalesSelector;
