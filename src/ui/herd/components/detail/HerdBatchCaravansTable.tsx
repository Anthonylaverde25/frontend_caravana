import { useEffect, useState } from 'react';
import { Box, TablePagination, Typography } from '@mui/material';
import type { CaravanSummarySort } from '@/core/caravans/domain/entities/CaravanSummary';
import { useCaravansSummary } from '@/features/caravans/hooks/useCaravansSummary';
import HerdCaravanTable from '../shared/HerdCaravanTable';
import HerdCaravanTableSkeleton from '../shared/HerdCaravanTableSkeleton';
import HerdCaravansToolbar, { type HerdSexFilter } from './HerdCaravansToolbar';
import HerdCaravansSelectionBar from './HerdCaravansSelectionBar';
import type { HerdCaravanDialogsState } from '../../hooks/useHerdCaravanDialogs';
import { UNASSIGNED_BATCH } from '../../utils/herdFormat';

const DEBOUNCE_MS = 300;

interface HerdBatchCaravansTableProps {
	batchId: number | typeof UNASSIGNED_BATCH;
	initialSearch?: string;
	highlightId?: number | null;
	dialogs: HerdCaravanDialogsState;
	/** Moves the ticked caravans to another batch; absent where there is no batch to move from. */
	onBulkTransfer?: (caravanIds: number[]) => void;
}

/**
 * Every caravan of the batch, paginated by the server: only the page on screen is downloaded.
 * Full width on the sheet, no box: filters on top, a selection bar while rows are ticked.
 */
export function HerdBatchCaravansTable({
	batchId,
	initialSearch = '',
	highlightId,
	dialogs,
	onBulkTransfer
}: HerdBatchCaravansTableProps) {
	const [searchInput, setSearchInput] = useState(initialSearch);
	const [search, setSearch] = useState(initialSearch);
	const [sex, setSex] = useState<HerdSexFilter>('ALL');
	const [sort, setSort] = useState<CaravanSummarySort>('recent');
	const [page, setPage] = useState(0);
	const [perPage, setPerPage] = useState(25);
	const [selectedIds, setSelectedIds] = useState<number[]>([]);

	useEffect(() => {
		const handle = setTimeout(() => setSearch(searchInput), DEBOUNCE_MS);
		return () => clearTimeout(handle);
	}, [searchInput]);

	// A new filter starts again from the first page.
	useEffect(() => setPage(0), [search, sex, sort, perPage]);
	// The selection belongs to the page on screen.
	useEffect(() => setSelectedIds([]), [search, sex, sort, perPage, page, batchId]);

	const { data, isLoading, isFetching, isError } = useCaravansSummary({
		batchId,
		search,
		sex,
		sort,
		page: page + 1,
		perPage
	});
	const rows = data?.data ?? [];
	const total = data?.meta.total ?? null;
	// A dead or sold animal is looked at, never operated on.
	const selectedOperable = rows.filter((row) => selectedIds.includes(row.id) && !row.is_dead && !row.exit);
	const clearSelection = () => setSelectedIds([]);

	return (
		<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
			<HerdCaravansToolbar
				search={searchInput}
				sex={sex}
				sort={sort}
				total={total}
				onSearchChange={setSearchInput}
				onSexChange={setSex}
				onSortChange={setSort}
			/>
			{selectedIds.length > 0 && (
				<HerdCaravansSelectionBar
					count={selectedIds.length}
					onClear={clearSelection}
					onWeigh={
						selectedIds.length === 1 && selectedOperable.length === 1
							? () => dialogs.openWeigh(selectedOperable[0])
							: undefined
					}
					onTransfer={
						onBulkTransfer ? () => onBulkTransfer(selectedOperable.map((row) => row.id)) : undefined
					}
					onSell={() => dialogs.openSell(selectedOperable, clearSelection)}
					onDeath={() => dialogs.openDeath(selectedOperable, clearSelection)}
					onBreeding={() =>
						dialogs.openBreeding(
							rows.filter((row) => selectedIds.includes(row.id)),
							clearSelection
						)
					}
					onCastrate={() => dialogs.openCastrate(selectedOperable, clearSelection)}
				/>
			)}

			{isLoading ? (
				<HerdCaravanTableSkeleton
					rowCount={Math.min(perPage, 8)}
					selectable
					showBatch={batchId === UNASSIGNED_BATCH}
				/>
			) : isError ? (
				<Typography
					color="error"
					sx={{ px: 3.5, py: 3 }}
				>
					No se pudieron cargar las caravanas.
				</Typography>
			) : rows.length === 0 ? (
				<Typography
					color="text.secondary"
					sx={{ px: 3.5, py: 3 }}
				>
					{search || sex !== 'ALL'
						? 'Ninguna caravana coincide con los filtros.'
						: 'El lote todavía no tiene caravanas.'}
				</Typography>
			) : (
				<Box sx={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
					<HerdCaravanTable
						rows={rows}
						highlightId={highlightId}
						onView={dialogs.openView}
						onEdit={dialogs.openEdit}
						onWeigh={dialogs.openWeigh}
						onBreeding={(caravan) => dialogs.openBreeding([caravan])}
						onDeath={(caravan) => dialogs.openDeath([caravan])}
						onSell={(caravan) => dialogs.openSell([caravan])}
						onAbort={dialogs.openAbort}
						selectedIds={selectedIds}
						onSelectionChange={setSelectedIds}
					/>
				</Box>
			)}

			<TablePagination
				component="div"
				count={total ?? 0}
				page={total && page * perPage < total ? page : 0}
				rowsPerPage={perPage}
				rowsPerPageOptions={[25, 50, 100]}
				onPageChange={(_, next) => setPage(next)}
				onRowsPerPageChange={(event) => setPerPage(Number(event.target.value))}
				labelRowsPerPage="Por página"
				labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
				sx={{ px: 1.5 }}
			/>
		</Box>
	);
}

export default HerdBatchCaravansTable;
