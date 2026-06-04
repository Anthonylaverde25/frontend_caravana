import { Box, Button, Stack, Paper } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useState } from 'react';
import { useLocation } from 'react-router';
import { BatchesTable } from '../components/BatchesTable';
import CreateBatchDialog from '../components/CreateBatchDialog';

/**
 * BatchesView Component
 * Main page for managing batches (Lotes).
 * Standardized using ViewLayout.
 */
function BatchesView() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const location = useLocation();

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
			? 'Control de lotes asociados a proveedores externos.'
			: 'Control centralizado de agrupaciones de ganado por establecimiento.';

	return (
		<ViewLayout
			title={title}
			subtitle={subtitle}
			actions={
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
