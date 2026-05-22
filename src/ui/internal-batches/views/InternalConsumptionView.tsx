'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useQueryClient } from '@tanstack/react-query';
import { InternalBatchesTable } from '../components/InternalBatchesTable';
import CreateInternalBatchDialog from '../components/CreateInternalBatchDialog';

/**
 * InternalConsumptionView Component
 * Renders lists and tables for managing internal consumption batches (Lotes de Consumo Interno).
 */
function InternalConsumptionView() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	const handleSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ['batches'] });
	};

	return (
		<ViewLayout
			title="Lotes de Consumo Interno"
			subtitle="Gestión y control de lotes dedicados al consumo interno."
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
					Nuevo Lote Consumo
				</Button>
			}
		>
			<InternalBatchesTable
				batchType="INTERNAL_CONSUMPTION"
				emptyTitle="No Internal Consumption Batches"
				emptyDescription="There are no internal consumption batches configured yet. When you define batches of this type, they will appear here."
				emptyIcon="heroicons-outline:plus-circle"
			/>

			<CreateInternalBatchDialog
				open={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				onSuccess={handleSuccess}
				batchTypeCode="INTERNAL_CONSUMPTION"
				title="Alta Rápida - Lote Consumo Interno"
			/>
		</ViewLayout>
	);
}

export default InternalConsumptionView;
