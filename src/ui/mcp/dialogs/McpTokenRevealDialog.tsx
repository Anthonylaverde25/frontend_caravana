import { useEffect, useState } from 'react';
import { Alert, Stack, Typography } from '@mui/material';
import { IssuedMcpConnection } from '@/core/mcp/domain/McpConnection';
import CatalogDialogFrame from '@/ui/items/components/CatalogDialogFrame';
import CopyableValue from '../components/CopyableValue';
import McpClientSnippets from '../components/McpClientSnippets';

/**
 * The only time the token is visible. Closing asks once more, since the token cannot be shown again.
 */
export default function McpTokenRevealDialog({ issued, onClose }: { issued: IssuedMcpConnection | null; onClose: () => void }) {
	const [confirming, setConfirming] = useState(false);

	useEffect(() => setConfirming(false), [issued]);

	const close = () => (confirming ? onClose() : setConfirming(true));

	return (
		<CatalogDialogFrame
			open={!!issued}
			title={issued ? `Conexión "${issued.connection.name}" creada` : ''}
			onClose={close}
			onSubmit={close}
			submitLabel={confirming ? 'Sí, ya lo copié' : 'Listo'}
			maxWidth="md"
			error={confirming ? 'Al cerrar, el token no se puede volver a ver. ¿Ya lo copiaste?' : null}
		>
			{issued && (
				<Stack spacing={2}>
					<Alert severity="warning" sx={{ fontSize: '0.8rem', py: 0.5 }}>
						Copiá el token ahora: por seguridad no se vuelve a mostrar. Si lo perdés, revocá esta conexión y creá otra.
					</Alert>
					<Stack spacing={0.75}>
						<Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Token</Typography>
						<CopyableValue value={issued.plainTextToken} />
					</Stack>
					<Stack spacing={0.75}>
						<Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Configuración del cliente</Typography>
						<McpClientSnippets serverUrl={issued.serverUrl} token={issued.plainTextToken} />
					</Stack>
				</Stack>
			)}
		</CatalogDialogFrame>
	);
}
