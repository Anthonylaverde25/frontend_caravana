import { Box, Paper, Typography } from '@mui/material';
import ViewLayout from 'src/components/ViewLayout';

/**
 * FarmsView Component
 * Management of farms/establishments.
 * Standardized using ViewLayout.
 */
function FarmsView() {
	return (
		<ViewLayout
			title="Gestión de Establecimientos"
			subtitle="Administra las sedes, campos y sus correspondientes RENSPAs."
		>
			<Box component="main">
				<Paper
					elevation={0}
					sx={{
						p: 4,
						borderRadius: '8px',
						border: '1px solid #d8dde6',
						bgcolor: '#ffffff',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						minHeight: '400px',
					}}
				>
					<Typography
						variant="h6"
						color="text.secondary"
					>
						Lista de Establecimientos (Próximamente)
					</Typography>
				</Paper>
			</Box>
		</ViewLayout>
	);
}

export default FarmsView;
