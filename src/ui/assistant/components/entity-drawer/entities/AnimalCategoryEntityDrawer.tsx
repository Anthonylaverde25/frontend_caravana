import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import type { CaravanSummary } from '@/core/caravans/domain/entities/CaravanSummary';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { useCaravansSummary } from '@/features/caravans/hooks/useCaravansSummary';
import EntityDrawerShell from '../EntityDrawerShell';
import EntityListGrid, { type EntityListColumn } from '../components/EntityListGrid';
import type { EntityDrawerProps } from './entityDrawerProps';

const PAGE_SIZE = 50;
const numberFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

const COLUMNS: EntityListColumn<CaravanSummary>[] = [
	{
		key: 'tag',
		label: 'Caravana',
		width: 170,
		tag: true,
		value: (c) => c.identification ?? c.label,
		link: (c) => ({ kind: 'caravan', id: c.id })
	},
	{ key: 'sex', label: 'Sexo', width: 80, value: (c) => (c.sex === 'H' ? 'Hembra' : 'Macho') },
	{ key: 'sub', label: 'Subcategoría', value: (c) => c.subcategory_name ?? '—' },
	{
		key: 'weight',
		label: 'Peso actual (kg)',
		align: 'right',
		value: (c) => (c.current_weight != null ? numberFormat.format(c.current_weight) : '—')
	},
	{
		key: 'batch',
		label: 'Lote',
		width: 180,
		value: (c) => c.batch_name ?? '—',
		link: (c) => (c.batch_id ? { kind: 'batch', id: c.batch_id } : null)
	}
];

/**
 * The caravans of one animal category: a category is a grouping, not a record, so its detail is the
 * list behind the figure that was clicked. Within one batch's table it keeps to that batch.
 */
export function AnimalCategoryEntityDrawer({ id, label, scope, open, onClose, onNavigate }: EntityDrawerProps) {
	const [page, setPage] = useState(1);
	const batchId = scope?.batch_id ?? undefined;
	const { data: batch } = useBatch(batchId);
	const { data, isLoading, isError } = useCaravansSummary({
		categoryId: id,
		batchId,
		page,
		perPage: PAGE_SIZE
	});
	const meta = data?.meta;

	return (
		<EntityDrawerShell
			open={open}
			onClose={onClose}
			icon="heroicons-outline:tag"
			title={label ?? 'Categoría'}
			subtitle={[meta ? `${meta.total} caravana(s)` : null, batch ? `lote ${batch.name}` : null]
				.filter(Boolean)
				.join(' · ')}
			isLoading={isLoading}
			isError={isError}
			screen={
				batchId
					? { route: `/herd/batches/${batchId}`, label: 'Abrir lote' }
					: { route: '/herd', label: 'Abrir hacienda' }
			}
			onNavigate={onNavigate}
		>
			{data && (
				<EntityListGrid
					title="Caravanas"
					columns={COLUMNS}
					rows={data.data}
					rowKey={(c) => c.id}
					empty="No hay caravanas de esta categoría."
					footer={
						meta &&
						meta.last_page > 1 && (
							<Stack
								direction="row"
								alignItems="center"
								justifyContent="flex-end"
								spacing={1}
								sx={{ mt: 1 }}
							>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									{meta.from}–{meta.to} de {meta.total}
								</Typography>
								<Button
									size="small"
									disabled={page <= 1}
									onClick={() => setPage(page - 1)}
									sx={{ textTransform: 'none' }}
								>
									Anterior
								</Button>
								<Button
									size="small"
									disabled={page >= meta.last_page}
									onClick={() => setPage(page + 1)}
									sx={{ textTransform: 'none' }}
								>
									Siguiente
								</Button>
							</Stack>
						)
					}
				/>
			)}
		</EntityDrawerShell>
	);
}

export default AnimalCategoryEntityDrawer;
