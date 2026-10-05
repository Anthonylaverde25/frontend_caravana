import { Box, Button, Stack, Paper } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { BatchesTable } from '../components/BatchesTable';
import CreateBatchDialog from '../components/CreateBatchDialog';
import EntryStartActions from '@/ui/entry-orders/components/EntryStartActions';

/**
 * BatchesView Component
 * Main page for managing batches (Lotes).
 * Standardized using ViewLayout.
 */
function BatchesView() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	const filter = location.pathname.includes('/own')
		? 'own'
		: location.pathname.includes('/external')
			? 'external'
			: 'all';

	const title = filter === 'own'
		? 'Lotes Propios'
		: filter === 'external'
			? 'Lotes de Proveedores Externos'
			: 'Gestión de Lotes (Batches)';

	const subtitle = filter === 'own'
		? 'Control centralizado de tropas y lotes generados en finca propia.'
		: filter === 'external'
			? 'Compras de hacienda por proveedor: cada lote nace de una orden de ingreso y recibe sus caravanas con el DTE.'
			: 'Control centralizado de agrupaciones de ganado por establecimiento.';

	return (
		<ViewLayout
			title={title}
			subtitle={subtitle}
			actions={
				filter === 'external' ? (
					// A batch of a provider is a purchase: it starts as an entry order, waiting for its DTE.
					<Stack
						direction="row"
						spacing={1.5}
						alignItems="center"
					>
						<Button
							variant="text"
							onClick={() => navigate('/entry-orders')}
							startIcon={<FuseSvgIcon size={20}>heroicons-outline:truck</FuseSvgIcon>}
							sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
						>
							Órdenes de ingreso
						</Button>
						<EntryStartActions />
					</Stack>
				) : (
					<Stack
						direction="row"
						spacing={1.5}
					>
						<Button
							variant="text"
							startIcon={<FuseSvgIcon size={20}>heroicons-outline:arrow-down-tray</FuseSvgIcon>}
							sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
						>
							Exportar
						</Button>
						<Button
							variant="contained"
							startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>}
							onClick={() => setIsDialogOpen(true)}
							sx={{
								bgcolor: 'primary.main',
								borderRadius: '6px',
								px: 3,
								fontWeight: 700,
								textTransform: 'none',
							}}
						>
							Nuevo Lote
						</Button>
					</Stack>
				)
			}
		>
			<Box component="main">
				<Paper
					elevation={0}
					sx={{
						borderRadius: '8px',
						border: 1,
						borderColor: 'divider',
						overflow: 'hidden',
					}}
				>
					<BatchesTable filter={filter} />
				</Paper>
			</Box>

			<CreateBatchDialog
				open={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
			/>
		</ViewLayout>
	);
}

export default BatchesView;
