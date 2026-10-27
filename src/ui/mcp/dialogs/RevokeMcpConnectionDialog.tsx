import { useState } from 'react';
import { Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { McpConnection } from '@/core/mcp/domain/McpConnection';
import { useRevokeMcpConnection } from '@/features/mcp/hooks/useMcpConnections';
import CatalogDialogFrame from '@/ui/items/components/CatalogDialogFrame';
import { readApiErrors } from '@/ui/items/components/apiErrors';

export default function RevokeMcpConnectionDialog({ connection, onClose }: { connection: McpConnection | null; onClose: () => void }) {
	const { enqueueSnackbar } = useSnackbar();
	const { mutateAsync, isPending } = useRevokeMcpConnection();
	const [error, setError] = useState<string | null>(null);

	const submit = async () => {
		if (!connection) return;
		try {
			await mutateAsync(connection.id);
			enqueueSnackbar(`Conexión "${connection.name}" revocada.`, { variant: 'success' });
			setError(null);
			onClose();
		} catch (e) {
			setError(readApiErrors(e, 'No se pudo revocar la conexión.').domain);
		}
	};

	return (
		<CatalogDialogFrame open={!!connection} title="Revocar conexión" onClose={onClose} onSubmit={submit} submitLabel="Revocar" pending={isPending} error={error}>
			<Typography sx={{ fontSize: '0.9rem' }}>
				<strong>{connection?.name}</strong> dejará de poder consultar los datos del establecimiento desde su próxima pregunta.
				Para volver a conectarlo hay que autorizarlo de nuevo.
			</Typography>
		</CatalogDialogFrame>
	);
}
