import { Box, Button, Stack, Paper } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useState } from 'react';
import { BatchesTable } from '../components/BatchesTable';
import CreateBatchDialog from '../components/CreateBatchDialog';

/**
 * BatchesView Component
 * Main page for managing batches (Lotes).
 * Standardized using ViewLayout.
 */
function BatchesView() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	return (
		<ViewLayout
			title="Gestión de Lotes (Batches)"
			subtitle="Control centralizado de agrupaciones de ganado por establecimiento."
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
					<BatchesTable />
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
