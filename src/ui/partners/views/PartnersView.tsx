import { Box, Button, Stack, Paper } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { PartnersTable } from '@/ui/partners/components/PartnersTable';
import CreatePartnerDialog from '@/ui/partners/components/CreatePartnerDialog';

/**
 * PartnersView Component
 * "Clientes y proveedores": who sells to us and who buys from us, their contact persons and the
 * origin farms of livestock sellers.
 * Standardized using ViewLayout with canonical modal creation flow.
 */
function PartnersView() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();

	useEffect(() => {
		if (searchParams.get('action') === 'create' || searchParams.get('new') === 'true') {
			setIsDialogOpen(true);
			const newParams = new URLSearchParams(searchParams);
			newParams.delete('action');
			newParams.delete('new');
			setSearchParams(newParams, { replace: true });
		}
	}, [searchParams, setSearchParams]);

	return (
		<ViewLayout
			title="Clientes y proveedores"
			subtitle="Quién nos vende y quién nos compra hacienda o artículos: sus personas de contacto y sus campos de origen."
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
							boxShadow: 'none',
							'&:hover': { bgcolor: 'primary.dark' }
						}}
					>
						Nuevo
					</Button>
				</Stack>
			}
		>
			<Box component="main">
				<PartnersTable />
			</Box>

			{/* Alta de cliente o proveedor */}
			<CreatePartnerDialog
				open={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
			/>
		</ViewLayout>
	);
}

export default PartnersView;