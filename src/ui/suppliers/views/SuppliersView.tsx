import { Box, Button, Stack, Paper } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { SuppliersTable } from '@/ui/suppliers/components/SuppliersTable';
import CreateSupplierDialog from '@/ui/suppliers/components/CreateSupplierDialog';

/**
 * SuppliersView Component
 * Main page for managing suppliers and associated establishments.
 * Standardized using ViewLayout with canonical modal creation flow.
 */
function SuppliersView() {
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
			title="Gestión de Proveedores"
			subtitle="Administra la base de datos de proveedores, información de contacto y orígenes de compra."
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
						Nuevo Proveedor
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
						bgcolor: 'background.paper',
					}}
				>
					<SuppliersTable />
				</Paper>
			</Box>

			{/* Dialog modal para Alta de Proveedor */}
			<CreateSupplierDialog
				open={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
			/>
		</ViewLayout>
	);
}

export default SuppliersView;