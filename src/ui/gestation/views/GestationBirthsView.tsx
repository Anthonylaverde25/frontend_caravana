import { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Paper, CircularProgress, Stack } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import { useNavigate } from 'react-router';
import { useBirthHistory } from '@/features/gestation/hooks/useBirthHistory';
import { BirthsViewMode, NursingStatusFilter, BirthBatchGroup } from '../components/births/birthsTypes';
import BirthsFilterBar from '../components/births/BirthsFilterBar';
import BirthsSelectionBanner from '../components/births/BirthsSelectionBanner';
import BirthsBatchGroupCard from '../components/births/BirthsBatchGroupCard';
import BirthsFlatTable from '../components/births/BirthsFlatTable';

export default function GestationBirthsView() {
	const { data: birthHistory = [], isLoading } = useBirthHistory();
	const navigate = useNavigate();

	const [searchQuery, setSearchQuery] = useState('');
	const [selectedBatchId, setSelectedBatchId] = useState<number | 'all'>('all');
	const [nursingFilter, setNursingFilter] = useState<NursingStatusFilter>('all');
	const [selectedCalfIds, setSelectedCalfIds] = useState<number[]>([]);
	const [viewMode, setViewMode] = useState<BirthsViewMode>('hierarchy');

	const goWean = useCallback(
		(target: 'new' | 'register', calfIds?: number[]) => {
			const ids = calfIds ?? selectedCalfIds;
			navigate(`/weaning-orders/${target}`, { state: { calfIds: ids } });
		},
		[navigate, selectedCalfIds]
	);

	// Compute available batch filter options from the full history
	const batchOptions = useMemo(() => {
		const map = new Map<number, { id: number; name: string; count: number }>();
		birthHistory.forEach((r) => {
			const bId = r.calf_batch_id ?? r.mother_batch_id ?? 0;
			const bName = r.calf_batch_name ?? r.mother_batch_name ?? 'Sin Lote Asignado';
			const existing = map.get(bId) || { id: bId, name: bName, count: 0 };
			existing.count += 1;
			map.set(bId, existing);
		});
		return Array.from(map.values()).sort((a, b) => {
			if (a.id === 0) return 1;

			if (b.id === 0) return -1;

			return a.name.localeCompare(b.name);
		});
	}, [birthHistory]);

	// Filter history records based on search, batch filter, and nursing status
	const filteredHistory = useMemo(() => {
		const term = searchQuery.trim().toLowerCase();
		return birthHistory.filter((record) => {
			const batchId = record.calf_batch_id ?? record.mother_batch_id ?? 0;

			if (selectedBatchId !== 'all' && batchId !== selectedBatchId) return false;

			if (nursingFilter === 'nursing' && !record.is_nursing) return false;

			if (nursingFilter === 'weaned' && record.is_nursing) return false;

			if (term !== '') {
				const matchesMother = record.mother_identification.toLowerCase().includes(term);
				const calfTag = (record.calf_identification ?? record.calf_label ?? '').toLowerCase();
				const matchesCalf = calfTag.includes(term);
				const matchesNotes = (record.notes ?? '').toLowerCase().includes(term);
				const matchesBatch = (record.calf_batch_name ?? record.mother_batch_name ?? '')
					.toLowerCase()
					.includes(term);
				return matchesMother || matchesCalf || matchesNotes || matchesBatch;
			}

			return true;
		});
	}, [birthHistory, searchQuery, selectedBatchId, nursingFilter]);

	// Calves at foot without an open order that can be selected for weaning
	const eligibleCalves = useMemo(() => {
		return filteredHistory.filter((r) => r.is_nursing && !r.open_order_code);
	}, [filteredHistory]);

	const allEligibleIds = useMemo(() => eligibleCalves.map((c) => c.calf_id), [eligibleCalves]);

	// Group filtered records into batches for hierarchy view mode
	const batchGroups = useMemo<BirthBatchGroup[]>(() => {
		const map = new Map<number, BirthBatchGroup>();
		filteredHistory.forEach((r) => {
			const bId = r.calf_batch_id ?? r.mother_batch_id ?? 0;
			const bName = r.calf_batch_name ?? r.mother_batch_name ?? 'Sin Lote Asignado';

			if (!map.has(bId)) {
				map.set(bId, {
					batchId: bId,
					batchName: bName,
					records: [],
					totalBirths: 0,
					nursingCount: 0,
					weanedCount: 0,
					eligibleCalfIds: []
				});
			}

			const group = map.get(bId)!;
			group.records.push(r);
			group.totalBirths += 1;

			if (r.is_nursing) {
				group.nursingCount += 1;

				if (!r.open_order_code) {
					group.eligibleCalfIds.push(r.calf_id);
				}
			} else {
				group.weanedCount += 1;
			}
		});

		return Array.from(map.values()).sort((a, b) => {
			if (a.batchId === 0) return 1;

			if (b.batchId === 0) return -1;

			return a.batchName.localeCompare(b.batchName);
		});
	}, [filteredHistory]);

	// Selection handlers
	const handleToggleSelectOne = useCallback((calfId: number) => {
		setSelectedCalfIds((prev) => (prev.includes(calfId) ? prev.filter((id) => id !== calfId) : [...prev, calfId]));
	}, []);

	const handleToggleGroup = useCallback((groupIds: number[]) => {
		if (groupIds.length === 0) return;

		setSelectedCalfIds((prev) => {
			const areAllPresent = groupIds.every((id) => prev.includes(id));

			if (areAllPresent) {
				return prev.filter((id) => !groupIds.includes(id));
			}

			return Array.from(new Set([...prev, ...groupIds]));
		});
	}, []);

	const handleToggleSelectAll = useCallback(() => {
		if (selectedCalfIds.length === allEligibleIds.length && allEligibleIds.length > 0) {
			setSelectedCalfIds([]);
		} else {
			setSelectedCalfIds(allEligibleIds);
		}
	}, [selectedCalfIds, allEligibleIds]);

	if (isLoading) {
		return (
			<ViewLayout
				title="Historial de Partos y Lactancia"
				backUrl="/gestation"
				backTitle="Volver al Dashboard"
			>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						p: 12,
						gap: 2
					}}
				>
					<CircularProgress
						size={40}
						thickness={4}
					/>
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ fontWeight: 600 }}
					>
						Cargando historial de pariciones...
					</Typography>
				</Box>
			</ViewLayout>
		);
	}

	return (
		<ViewLayout
			title="Historial de Partos y Lactancia"
			backUrl="/gestation"
			backTitle="Volver al Dashboard"
		>
			<Stack spacing={2.5}>
				<BirthsFilterBar
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					selectedBatchId={selectedBatchId}
					onBatchChange={setSelectedBatchId}
					batchOptions={batchOptions}
					nursingFilter={nursingFilter}
					onNursingFilterChange={setNursingFilter}
					viewMode={viewMode}
					onToggleViewMode={() => setViewMode((prev) => (prev === 'flat' ? 'hierarchy' : 'flat'))}
					isAllSelected={allEligibleIds.length > 0 && selectedCalfIds.length === allEligibleIds.length}
					onToggleSelectAll={handleToggleSelectAll}
					hasEligibleItems={allEligibleIds.length > 0}
				/>

				<BirthsSelectionBanner
					selectedCount={selectedCalfIds.length}
					onWean={goWean}
					onClearSelection={() => setSelectedCalfIds([])}
				/>

				{filteredHistory.length === 0 ? (
					<Paper sx={{ p: 6, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: '8px' }}>
						<Typography
							variant="h6"
							color="text.secondary"
							gutterBottom
						>
							No se encontraron registros de partos.
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
						>
							{searchQuery || selectedBatchId !== 'all' || nursingFilter !== 'all'
								? 'Pruebe ajustando los criterios de búsqueda o los filtros de lote/estado.'
								: 'No se han registrado partos exitosos en el establecimiento aún.'}
						</Typography>
					</Paper>
				) : viewMode === 'hierarchy' ? (
					<Stack spacing={2.5}>
						{batchGroups.map((group) => (
							<BirthsBatchGroupCard
								key={group.batchId}
								group={group}
								selectedCalfIds={selectedCalfIds}
								defaultExpanded={true}
								onToggleSelect={handleToggleSelectOne}
								onToggleGroup={handleToggleGroup}
								onWean={goWean}
							/>
						))}
					</Stack>
				) : (
					<BirthsFlatTable
						records={filteredHistory}
						eligibleCalves={eligibleCalves}
						selectedCalfIds={selectedCalfIds}
						onToggleSelect={handleToggleSelectOne}
						onToggleSelectAll={handleToggleSelectAll}
						onWean={goWean}
					/>
				)}
			</Stack>
		</ViewLayout>
	);
}
