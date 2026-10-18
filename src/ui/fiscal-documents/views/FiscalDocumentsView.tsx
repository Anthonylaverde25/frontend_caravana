import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Pagination, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ViewLayout from 'src/components/ViewLayout';
import { useFiscalDocuments } from '@/features/fiscal/hooks/useFiscalDocuments';
import { usePendingDeliveryNotes } from '@/features/fiscal/hooks/useDeliveryNotes';
import FiscalDocumentsToolbar, { KindFilter } from '../components/list/FiscalDocumentsToolbar';
import FiscalDocumentsGrid from '../components/list/FiscalDocumentsGrid';

const PRIMARY_BUTTON = {
	bgcolor: 'primary.main',
	borderRadius: '6px',
	px: 3,
	fontWeight: 700,
	textTransform: 'none',
	boxShadow: 'none',
	'&:hover': { bgcolor: 'primary.dark' }
} as const;

/** `/fiscal-documents`: the register of the providers' invoices, credit notes, tickets and delivery notes (DS14). */
export default function FiscalDocumentsView() {
	const navigate = useNavigate();
	const [search, setSearch] = useState('');
	const [kind, setKind] = useState<KindFilter>('ALL');
	const [status, setStatus] = useState<'REGISTERED' | 'VOIDED'>('REGISTERED');
	const [dates, setDates] = useState({ from: '', to: '' });
	const [page, setPage] = useState(1);

	const { data, isLoading } = useFiscalDocuments({
		search: search.trim() || undefined,
		kind: kind === 'ALL' ? undefined : kind,
		status,
		from: dates.from || undefined,
		to: dates.to || undefined,
		page
	});
	const pages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;
	const { data: pending = [] } = usePendingDeliveryNotes();

	return (
		<ViewLayout
			title="Comprobantes de proveedores"
			subtitle="Facturas, notas de crédito, tickets y remitos. Lo que lleva stock entra al almacén al registrarlos."
			actions={
				<Stack
					direction="row"
					spacing={1}
				>
					<Button
						onClick={() => navigate('/fiscal-documents/delivery-notes')}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:truck</FuseSvgIcon>}
						sx={{
							fontWeight: 600,
							textTransform: 'none',
							color: pending.length > 0 ? 'warning.dark' : undefined
						}}
					>
						Remitos a facturar ({pending.length})
					</Button>
					<Button
						variant="contained"
						startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>}
						onClick={() => navigate('/fiscal-documents/new')}
						sx={PRIMARY_BUTTON}
					>
						Cargar comprobante
					</Button>
				</Stack>
			}
		>
			<Stack
				spacing={2}
				component="main"
			>
				<FiscalDocumentsToolbar
					search={search}
					onSearch={(v) => {
						setSearch(v);
						setPage(1);
					}}
					kind={kind}
					onKind={(v) => {
						setKind(v);
						setPage(1);
					}}
					status={status}
					onStatus={(v) => {
						setStatus(v);
						setPage(1);
					}}
					from={dates.from}
					to={dates.to}
					onDates={(from, to) => {
						setDates({ from, to });
						setPage(1);
					}}
				/>
				<FiscalDocumentsGrid
					documents={data?.data ?? []}
					loading={isLoading}
					emptyMessage={
						status === 'VOIDED'
							? 'No hay comprobantes anulados.'
							: 'Todavía no hay comprobantes con estos filtros.'
					}
					onOpen={(d) => navigate(`/fiscal-documents/${d.id}`)}
					onOpenOperation={(id) => navigate(`/item-documents/${id}`)}
				/>
				{pages > 1 && (
					<Pagination
						count={pages}
						page={page}
						onChange={(_, p) => setPage(p)}
						sx={{ alignSelf: 'center' }}
					/>
				)}
			</Stack>
		</ViewLayout>
	);
}
