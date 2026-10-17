import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Box, Button, Paper, Stack } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CreateBatchDialog from 'src/ui/batches/components/CreateBatchDialog';
import HerdBatchList from '../components/list/HerdBatchList';
import HerdCaravanSearch from '../components/search/HerdCaravanSearch';
import { useHerdCaravanDialogs } from '../hooks/useHerdCaravanDialogs';

/**
 * Own herd: the batches are the base, and each one opens to its caravans. It replaced /caravans and
 * /batches/own. `?new=caravan` (the "Nueva Caravana" quick action) opens the caravan form.
 */
function HerdView() {
	const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
	const dialogs = useHerdCaravanDialogs();
	const [searchParams, setSearchParams] = useSearchParams();
	const { openCreate } = dialogs;

	useEffect(() => {
		if (searchParams.get('new') !== 'caravan') return;

		openCreate();
		setSearchParams({}, { replace: true });
	}, [searchParams, setSearchParams, openCreate]);

	return (
		<ViewLayout
			title="Hacienda Propia"
			subtitle="Tus lotes y sus caravanas en un solo lugar. Expandí un lote para ver sus últimos ingresos."
			actions={
				<Stack
					direction={{ xs: 'column', md: 'row' }}
					spacing={1.5}
					alignItems={{ xs: 'stretch', md: 'center' }}
				>
					<HerdCaravanSearch />
					<Button
						variant="text"
						startIcon={<FuseSvgIcon size={20}>heroicons-outline:tag</FuseSvgIcon>}
						onClick={() => dialogs.openCreate()}
						sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
					>
						Insertar caravana
					</Button>
					<Button
						variant="contained"
						startIcon={<FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>}
						onClick={() => setIsCreateBatchOpen(true)}
						sx={{
							bgcolor: 'primary.main',
							borderRadius: '6px',
							px: 3,
							fontWeight: 700,
							textTransform: 'none'
						}}
					>
						Nuevo lote
					</Button>
				</Stack>
			}
		>
			<Box component="main">
				<Paper
					elevation={0}
					sx={{ borderRadius: '8px', border: 1, borderColor: 'divider', overflow: 'hidden' }}
				>
					<HerdBatchList
						onCreateBatch={() => setIsCreateBatchOpen(true)}
						dialogs={dialogs}
					/>
				</Paper>
			</Box>

			<CreateBatchDialog
				open={isCreateBatchOpen}
				onClose={() => setIsCreateBatchOpen(false)}
			/>
		</ViewLayout>
	);
}

export default HerdView;
