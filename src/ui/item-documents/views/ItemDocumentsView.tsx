import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Pagination, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useItemDocuments } from '@/features/stock/hooks/useItemDocuments';
import { ITEM_DOCUMENT_TYPES, ItemDocumentType } from '@/core/stock/domain/entities/ItemDocument';
import ItemDocumentsGrid from '../components/list/ItemDocumentsGrid';

const TEXT_BUTTON = { fontWeight: 600, color: 'primary.main', textTransform: 'none' } as const;

/** `/item-documents`: every stock operation of the company, in load order (D4). */
export default function ItemDocumentsView() {
	const navigate = useNavigate();
	const [type, setType] = useState<ItemDocumentType | 'ALL'>('ALL');
	const [dates, setDates] = useState({ from: '', to: '' });
	const [page, setPage] = useState(1);
	const { data, isLoading } = useItemDocuments({ type: type === 'ALL' ? undefined : type, from: dates.from || undefined, to: dates.to || undefined, page });
	const pages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;

	return (
		<ViewLayout
			title="Movimientos de stock"
			subtitle="Ingresos por compra, stock inicial, consumos, conteos, devoluciones y anulaciones."
			actions={
				<Button variant="text" onClick={() => navigate('/item-documents/new/initial-stock')}
					startIcon={<FuseSvgIcon size={20}>heroicons-outline:archive-box-arrow-down</FuseSvgIcon>} sx={TEXT_BUTTON}>
					Stock inicial
				</Button>
			}
		>
			<Stack spacing={2} component="main">
				<Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems={{ lg: 'center' }}>
					<ToggleButtonGroup size="small" exclusive value={type} onChange={(_, v) => { if (v) { setType(v); setPage(1); } }}
						sx={{ flexWrap: 'wrap', '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, px: 1.5 } }}>
						<ToggleButton value="ALL">Todos</ToggleButton>
						{ITEM_DOCUMENT_TYPES.map((t) => (
							<ToggleButton key={t.value} value={t.value}>
								{t.filterLabel}
							</ToggleButton>
						))}
					</ToggleButtonGroup>
					<TextField size="small" type="date" label="Desde" value={dates.from} InputLabelProps={{ shrink: true }}
						onChange={(e) => { setDates({ ...dates, from: e.target.value }); setPage(1); }} />
					<TextField size="small" type="date" label="Hasta" value={dates.to} InputLabelProps={{ shrink: true }}
						onChange={(e) => { setDates({ ...dates, to: e.target.value }); setPage(1); }} />
				</Stack>
				<ItemDocumentsGrid documents={data?.data ?? []} loading={isLoading} emptyMessage="No hay movimientos con estos filtros."
					onOpen={(d) => navigate(`/item-documents/${d.id}`)} />
				{pages > 1 && <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} sx={{ alignSelf: 'center' }} />}
			</Stack>
		</ViewLayout>
	);
}
