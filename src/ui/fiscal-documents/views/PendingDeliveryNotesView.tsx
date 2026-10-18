import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Stack } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSnackbar } from 'notistack';
import ViewLayout from 'src/components/ViewLayout';
import { usePendingDeliveryNotes } from '@/features/fiscal/hooks/useDeliveryNotes';
import { PendingDeliveryNote } from '@/core/fiscal/domain/entities/DeliveryNote';
import PendingDeliveryNotesToolbar, { PendingFilter } from '../components/delivery-notes/PendingDeliveryNotesToolbar';
import PendingDeliveryNotesGrid from '../components/delivery-notes/PendingDeliveryNotesGrid';

const PRIMARY_BUTTON = {
	bgcolor: 'primary.main',
	borderRadius: '6px',
	px: 3,
	fontWeight: 700,
	textTransform: 'none',
	boxShadow: 'none',
	'&:hover': { bgcolor: 'primary.dark' }
} as const;

const matches = (note: PendingDeliveryNote, filter: PendingFilter): boolean =>
	filter === 'ALL' || (filter === 'UNPRICED' ? !note.isValued : note.linesWithIssues > 0);

/**
 * `/fiscal-documents/delivery-notes`: what arrived with a delivery note and has no invoice yet (DC12).
 * Marked notes of one provider are converted together into their invoice (DC5); validated on click.
 */
export default function PendingDeliveryNotesView() {
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();
	const { data: notes = [], isLoading } = usePendingDeliveryNotes();
	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState<PendingFilter>('ALL');
	const [selected, setSelected] = useState<number[]>([]);

	const counts = useMemo(
		() => ({
			ALL: notes.length,
			UNPRICED: notes.filter((n) => matches(n, 'UNPRICED')).length,
			CONSUMED: notes.filter((n) => matches(n, 'CONSUMED')).length
		}),
		[notes]
	);
	const term = search.trim().toLowerCase();
	const shown = notes.filter(
		(n) => matches(n, filter) && (!term || `${n.providerName ?? ''} ${n.label}`.toLowerCase().includes(term))
	);

	const convert = () => {
		const chosen = notes.filter((n) => selected.includes(n.id));
		const providers = [...new Set(chosen.map((n) => n.providerName))];

		if (chosen.length === 0) {
			enqueueSnackbar('Marcá al menos un remito.', { variant: 'warning' });
			return;
		}

		if (providers.length > 1) {
			enqueueSnackbar(
				`Un remito se convierte con otros del mismo proveedor: marcaste ${providers.join(' y ')}.`,
				{ variant: 'warning' }
			);
			return;
		}

		navigate(`/fiscal-documents/new?deliveryNotes=${chosen.map((n) => n.id).join(',')}`);
	};

	return (
		<ViewLayout
			title="Remitos a facturar"
			subtitle="Lo recibido con remito que todavía no tiene factura. Marcá los de un proveedor y convertilos en su factura."
			backUrl="/fiscal-documents"
			showBackButton
			backTitle="Comprobantes"
			actions={
				<Stack
					direction="row"
					spacing={1}
				>
					<Button
						onClick={() => navigate('/fiscal-documents/new?type=DELIVERY_NOTE')}
						startIcon={<FuseSvgIcon size={18}>heroicons-outline:truck</FuseSvgIcon>}
						sx={{ fontWeight: 600, textTransform: 'none' }}
					>
						Cargar remito
					</Button>
					<Button
						variant="contained"
						onClick={convert}
						startIcon={<FuseSvgIcon size={20}>heroicons-outline:document-check</FuseSvgIcon>}
						sx={PRIMARY_BUTTON}
					>
						Convertir a factura{selected.length > 0 ? ` (${selected.length})` : ''}
					</Button>
				</Stack>
			}
		>
			<Stack
				spacing={2}
				component="main"
			>
				<PendingDeliveryNotesToolbar
					search={search}
					onSearch={setSearch}
					filter={filter}
					onFilter={setFilter}
					counts={counts}
				/>
				<PendingDeliveryNotesGrid
					notes={shown}
					loading={isLoading}
					selected={selected}
					onSelect={setSelected}
					onOpen={(note) => navigate(`/fiscal-documents/${note.id}`)}
				/>
			</Stack>
		</ViewLayout>
	);
}
