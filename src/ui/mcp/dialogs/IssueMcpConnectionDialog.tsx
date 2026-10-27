import { useEffect, useState } from 'react';
import { MenuItem, Stack, TextField } from '@mui/material';
import { IssuedMcpConnection, MCP_TTL_OPTIONS } from '@/core/mcp/domain/McpConnection';
import { useIssueMcpConnection } from '@/features/mcp/hooks/useMcpConnections';
import CatalogDialogFrame from '@/ui/items/components/CatalogDialogFrame';
import { readApiErrors } from '@/ui/items/components/apiErrors';

interface IssueMcpConnectionDialogProps {
	open: boolean;
	onClose: () => void;
	onIssued: (issued: IssuedMcpConnection) => void;
}

const DEFAULT_TTL = 90;

/** A token to paste into a client that takes headers (Gemini CLI, Claude Code). Validated on click. */
export default function IssueMcpConnectionDialog({ open, onClose, onIssued }: IssueMcpConnectionDialogProps) {
	const { mutateAsync, isPending } = useIssueMcpConnection();
	const [name, setName] = useState('');
	const [ttlDays, setTtlDays] = useState<number>(DEFAULT_TTL);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [domain, setDomain] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setName('');
			setTtlDays(DEFAULT_TTL);
			setErrors({});
			setDomain(null);
		}
	}, [open]);

	const submit = async () => {
		if (name.trim().length < 3) {
			setErrors({ name: 'Poné un nombre para reconocer la conexión (por ejemplo, "Gemini oficina").' });
			return;
		}
		try {
			onIssued(await mutateAsync({ name, ttlDays }));
		} catch (error) {
			const { fields, domain: message } = readApiErrors(error, 'No se pudo crear la conexión.');
			setErrors(fields);
			setDomain(message);
		}
	};

	return (
		<CatalogDialogFrame open={open} title="Nueva conexión con token" onClose={onClose} onSubmit={submit} submitLabel="Crear conexión" pending={isPending} error={domain}>
			<Stack spacing={3}>
				<TextField
					label="Nombre"
					placeholder="Gemini oficina"
					variant="filled"
					fullWidth
					required
					value={name}
					onChange={(e) => setName(e.target.value)}
					error={!!errors.name}
					helperText={errors.name ?? 'Para reconocerla en la lista y revocarla si hace falta.'}
					sx={{ bgcolor: 'action.hover' }}
				/>
				<TextField
					select
					label="Vigencia"
					variant="filled"
					fullWidth
					value={ttlDays}
					onChange={(e) => setTtlDays(Number(e.target.value))}
					error={!!errors.ttl_days}
					helperText={errors.ttl_days ?? 'Al vencer, el cliente deja de poder consultar y hay que crear otra.'}
					sx={{ bgcolor: 'action.hover' }}
				>
					{MCP_TTL_OPTIONS.map((days) => (
						<MenuItem key={days} value={days}>{`${days} días`}</MenuItem>
					))}
				</TextField>
			</Stack>
		</CatalogDialogFrame>
	);
}
