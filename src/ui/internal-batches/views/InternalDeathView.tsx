'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useQueryClient } from '@tanstack/react-query';
import { InternalBatchesTable } from '../components/InternalBatchesTable';
import CreateInternalBatchDialog from '../components/CreateInternalBatchDialog';

/**
 * InternalDeathView Component
 * Renders lists and tables for managing internal death batches (Lotes de Muertes).
 */
function InternalDeathView() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	const handleSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ['batches'] });
	};

	return (
		<ViewLayout
			title="Lotes de Muertes"
			subtitle="Gestión y control de lotes dedicados a muertes o bajas internas."
			actions={
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
					Nuevo Lote Muertes
				</Button>
			}
		>
			<InternalBatchesTable
				batchType="INTERNAL_DEATH"
				emptyTitle="No Internal Death Batches"
				emptyDescription="There are no internal death batches configured yet. When you define batches of this type, they will appear here."
				emptyIcon="heroicons-outline:view-columns"
			/>

			<CreateInternalBatchDialog
				open={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				onSuccess={handleSuccess}
				batchTypeCode="INTERNAL_DEATH"
				title="Alta Rápida - Lote de Muertes"
			/>
		</ViewLayout>
	);
}

export default InternalDeathView;
