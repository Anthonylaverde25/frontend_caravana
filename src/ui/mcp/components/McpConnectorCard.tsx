import { Box, Stack, Typography } from '@mui/material';
import CopyableValue from './CopyableValue';

/**
 * The recommended way in: add the establishment as a custom connector in Claude or Gemini. The
 * client then opens this system's consent screen (OAuth); no token is copied by hand.
 */
export default function McpConnectorCard({ serverUrl }: { serverUrl: string }) {
	return (
		<Box sx={{ border: 1, borderColor: 'divider', borderRadius: '8px', p: 2 }}>
			<Stack spacing={1.25}>
				<Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Agregar como conector (recomendado)</Typography>
				<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
					En Claude (Configuración → Conectores → Agregar conector personalizado) o en Gemini, pegá esta dirección. Se abrirá
					esta aplicación para que elijas la empresa y autorices el acceso de solo lectura.
				</Typography>
				<CopyableValue value={serverUrl} />
			</Stack>
		</Box>
	);
}
