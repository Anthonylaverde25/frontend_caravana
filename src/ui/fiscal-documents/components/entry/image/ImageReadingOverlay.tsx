import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface ImageReadingOverlayProps {
	fileName: string;
	onCancel: () => void;
}

/** Over the sheet while the document is read (a photo may take several seconds). */
export default function ImageReadingOverlay({ fileName, onCancel }: ImageReadingOverlayProps) {
	return (
		<Box
			role="status"
			aria-live="polite"
			sx={{
				position: 'absolute',
				inset: 0,
				zIndex: 2,
				bgcolor: (theme) => alpha(theme.palette.background.paper, 0.86),
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 1.5,
				borderRadius: '8px'
			}}
		>
			<CircularProgress size={34} />
			<Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Leyendo el comprobante…</Typography>
			<Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', textAlign: 'center', maxWidth: 420 }}>
				{fileName}: se busca el CUIT del emisor en el QR de ARCA y se lee el papel con IA.
			</Typography>
			<Button
				onClick={onCancel}
				sx={{ textTransform: 'none', fontWeight: 600 }}
			>
				Cancelar
			</Button>
		</Box>
	);
}
