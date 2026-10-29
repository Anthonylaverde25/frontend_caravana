'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useQueryClient } from '@tanstack/react-query';
import { InternalBatchesTable } from '../components/InternalBatchesTable';
import CreateInternalBatchDialog from '../components/CreateInternalBatchDialog';

export interface InternalExitViewProps {
	subHeader?: React.ReactNode;
}

/**
 * InternalExitView Component
 * Renders lists and tables for managing internal death batches (Lotes de Egresos).
 */
function InternalExitView({ subHeader }: InternalExitViewProps = {}) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const queryClient = useQueryClient();

	const handleSuccess = () => {
		queryClient.invalidateQueries({ queryKey: ['batches'] });
	};

	return (
		<ViewLayout
			title="Lotes de Egresos"
			subtitle="Animales que salieron vendidos: quedan acá con su orden de egreso y ya no se operan."
			subHeader={subHeader}
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
						textTransform: 'none'
					}}
				>
					Nuevo Lote Egresos
				</Button>
			}
		>
			<InternalBatchesTable
				batchType="INTERNAL_EXIT"
				emptyTitle="Todavía no hay Lotes de Egresos"
				emptyDescription="El primero se crea solo al registrar el primer egreso."
				emptyIcon="heroicons-outline:view-columns"
			/>

			<CreateInternalBatchDialog
				open={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				onSuccess={handleSuccess}
				batchTypeCode="INTERNAL_EXIT"
				title="Alta Rápida - Lote de Egresos"
			/>
		</ViewLayout>
	);
}

export default InternalExitView;
