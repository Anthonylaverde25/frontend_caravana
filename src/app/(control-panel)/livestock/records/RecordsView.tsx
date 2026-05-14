import { Box, Button } from '@mui/material';
import { useRef } from 'react';
import { useNavigate } from 'react-router';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CaravanDataTable, { CaravanDataTableRef } from 'src/components/caravan/CaravanDataTable';

/**
 * RecordsView Component
 * Standardized header with "Add" action and minimalist data table.
 * Refactored to use ViewLayout for consistency.
 */
function RecordsView() {
	const tableRef = useRef<CaravanDataTableRef>(null);
	const navigate = useNavigate();

	const handleAddClick = () => {
		tableRef.current?.openAddDialog();
	};

	const handleBulkWeightEntry = (batchId: number) => {
		navigate(`/caravans/bulk-weight/${batchId}`);
	};

	const handleWeightSheet = (batchId: number | number[]) => {
		const idParam = Array.isArray(batchId) ? batchId.join(',') : batchId;
		navigate(`/caravans/weight-sheet/${idParam}`);
	};

	return (
		<ViewLayout
			title="Caravanas en Posesión"
			subtitle="Visualiza y gestiona todos tus registros de animales procesados y guardados en el sistema."
			actions={
				<Button
					variant="contained"
					color="primary"
					startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>}
					onClick={handleAddClick}
					sx={{ fontWeight: 700, borderRadius: '8px', px: 3 }}
				>
					Insertar Caravana
				</Button>
			}
		>
			<Box>
				<CaravanDataTable
					ref={tableRef}
					onBulkWeightEntry={handleBulkWeightEntry}
					onWeightSheet={handleWeightSheet}
				/>
			</Box>
		</ViewLayout>
	);
}

export default RecordsView;
