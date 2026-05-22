'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useQueryClient } from '@tanstack/react-query';
import { InternalBatchesTable } from '../components/InternalBatchesTable';
import CreateInternalBatchDialog from '../components/CreateInternalBatchDialog';

/**
 * QuarantineView Component
 * Renders lists and tables for managing quarantine batches (Lotes de Cuarentena).
 */
function QuarantineView() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	const handleSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ['batches'] });
	};

	return (
		<ViewLayout
			title="Lotes de Cuarentena"
			subtitle="Gestión y control de lotes dedicados a cuarentena sanitaria."
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
					Nuevo Lote Cuarentena
				</Button>
			}
		>
			<InternalBatchesTable
				batchType="QUARANTINE"
				emptyTitle="No Quarantine Batches"
				emptyDescription="There are no quarantine batches configured yet. When you define batches of this type, they will appear here."
				emptyIcon="heroicons-outline:view-columns"
			/>

			<CreateInternalBatchDialog
				open={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				onSuccess={handleSuccess}
				batchTypeCode="QUARANTINE"
				title="Alta Rápida - Lote de Cuarentena"
			/>
		</ViewLayout>
	);
}

export default QuarantineView;
