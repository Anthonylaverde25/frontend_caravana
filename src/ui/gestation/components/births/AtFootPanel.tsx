import React, { useCallback, useMemo, useState } from 'react';
import { Paper, Stack, Typography } from '@mui/material';
import type { BirthHistoryRecord } from '@/features/gestation/hooks/useBirthHistory';
import type { WeaningOrderSummary } from '@/features/weaning-orders/types';
import TagCalvesDialog from '@/ui/herd/components/tag-calves/TagCalvesDialog';
import { CommitmentFilter, SexFilter, isWeaningCode } from './birthsTypes';
import { batchKeyOf, useAtFootGroups } from './useAtFootGroups';
import BirthsFilterBar from './BirthsFilterBar';
import BirthsSelectionBanner, { SelectionKind } from './BirthsSelectionBanner';
import BirthsBatchGroupCard from './BirthsBatchGroupCard';

interface AtFootPanelProps {
	atFoot: BirthHistoryRecord[];
	orders: WeaningOrderSummary[];
	batchKey: string | 'all';
	onBatchChange: (key: string | 'all') => void;
	onWean: (target: 'new' | 'register', calfIds: number[]) => void;
	onOpenOrder: (orderId: number) => void;
	onRegisterWeaned: (orderId: number, calfIds: number[]) => void;
	onExecute: (orderId: number) => void;
}

/**
 * "Crías al pie": every calf still nursing, by batch, the free ones apart from the ones an open
 * order holds. Free calves start an order or a registered weaning; the calves of a weaning order are
 * weaned with it, some of them or all.
 */
export const AtFootPanel: React.FC<AtFootPanelProps> = ({
	atFoot,
	orders,
	batchKey,
	onBatchChange,
	onWean,
	onOpenOrder,
	onRegisterWeaned,
	onExecute
}) => {
	const [search, setSearch] = useState('');
	const [commitment, setCommitment] = useState<CommitmentFilter>('all');
	const [sex, setSex] = useState<SexFilter>('ALL');
	const [selected, setSelected] = useState<Set<number>>(new Set());
	const [tagging, setTagging] = useState<{ id: number; name: string } | null>(null);

	const groups = useAtFootGroups(atFoot, orders, { search, batchKey, commitment, sex });

	const batchOptions = useMemo(() => {
		const map = new Map<string, { key: string; name: string; count: number }>();

		atFoot.forEach((record) => {
			const key = batchKeyOf(record);
			const option = map.get(key) ?? { key, name: record.calf_batch_name ?? record.mother_batch_name ?? 'Sin lote asignado', count: 0 };
			option.count += 1;
			map.set(key, option);
		});

		return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
	}, [atFoot]);

	const commitmentCounts = useMemo(() => {
		const scoped = batchKey === 'all' ? atFoot : atFoot.filter((r) => batchKeyOf(r) === batchKey);

		return {
			all: scoped.length,
			free: scoped.filter((r) => !r.open_order_code).length,
			weaning: scoped.filter((r) => isWeaningCode(r.open_order_code)).length
		};
	}, [atFoot, batchKey]);

	const byCalf = useMemo(() => new Map(atFoot.map((r) => [r.calf_id, r])), [atFoot]);
	const chosen = useMemo(() => [...selected].map((id) => byCalf.get(id)).filter((r): r is BirthHistoryRecord => Boolean(r)), [selected, byCalf]);

	const selection = useMemo<SelectionKind>(() => {
		const codes = new Set(chosen.map((r) => r.open_order_code ?? ''));

		if (codes.size === 1 && codes.has('')) return { kind: 'free' };

		if (codes.size === 1) {
			const code = [...codes][0];
			const order = orders.find((o) => o.code === code);

			if (order) return { kind: 'order', orderId: order.id, code };
		}

		return { kind: 'mixed' };
	}, [chosen, orders]);

	const summary = useMemo(() => {
		const males = chosen.filter((r) => r.calf_sex === 'M').length;
		const females = chosen.filter((r) => r.calf_sex === 'H').length;
		const batches = new Set(chosen.map(batchKeyOf)).size;
		const where = selection.kind === 'order' ? `En ${selection.code}` : 'Sin orden';

		return `${where} · ${batches} ${batches === 1 ? 'lote' : 'lotes'} · ♂ ${males} · ♀ ${females}`;
	}, [chosen, selection]);

	const toggle = useCallback((calfId: number) => {
		setSelected((prev) => {
			const next = new Set(prev);

			if (next.has(calfId)) next.delete(calfId);
			else next.add(calfId);

			return next;
		});
	}, []);

	const setMany = useCallback((calfIds: number[], on: boolean) => {
		setSelected((prev) => {
			const next = new Set(prev);
			calfIds.forEach((id) => (on ? next.add(id) : next.delete(id)));

			return next;
		});
	}, []);

	const clear = () => setSelected(new Set());

	return (
		<Stack spacing={2}>
			<BirthsFilterBar
				searchQuery={search}
				onSearchChange={setSearch}
				batchKey={batchKey}
				onBatchChange={onBatchChange}
				batchOptions={batchOptions}
				commitment={commitment}
				onCommitmentChange={setCommitment}
				commitmentCounts={commitmentCounts}
				sex={sex}
				onSexChange={setSex}
			/>

			<BirthsSelectionBanner
				selectedCount={chosen.length}
				summary={summary}
				selection={selection}
				onWean={(target) => onWean(target, [...selected])}
				onRegisterWeaned={(orderId) => onRegisterWeaned(orderId, [...selected])}
				onClearSelection={clear}
			/>

			{groups.length === 0 ? (
				<Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: '8px' }}>
					<Typography variant="h6" color="text.secondary" gutterBottom>
						No hay crías al pie.
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{atFoot.length > 0
							? 'Probá ajustando la búsqueda o los filtros.'
							: 'Ninguna cría está lactando: las destetadas se consultan en sus órdenes de destete.'}
					</Typography>
				</Paper>
			) : (
				groups.map((group, index) => (
					<BirthsBatchGroupCard
						key={group.key}
						group={group}
						defaultExpanded={index === 0}
						selected={selected}
						onToggle={toggle}
						onSetMany={setMany}
						onOpenOrder={onOpenOrder}
						onRegisterWeaned={onRegisterWeaned}
						onExecute={onExecute}
						onTagCalves={setTagging}
					/>
				))
			)}

			{tagging && <TagCalvesDialog open onClose={() => setTagging(null)} batch={tagging} />}
		</Stack>
	);
};

export default AtFootPanel;
