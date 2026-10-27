import { Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Company } from '@/contexts/CompanyContext';
import type { McpAuthorizationRequest } from '@/core/mcp/domain/McpConnection';

interface McpConsentCardProps {
	request: McpAuthorizationRequest;
	companies: Company[];
	companyId: number | '';
	onCompanyChange: (id: number) => void;
	onApprove: () => void;
	onDeny: () => void;
	pending: boolean;
	error: string | null;
}

const ALLOWED = [
	'Consultar existencias, lotes, caravanas, órdenes y stock de la empresa elegida.',
	'Ver sólo lo que tu usuario ya puede ver en el sistema.'
];
const NEVER = ['Cargar, modificar ni borrar datos.', 'Ver otras empresas o establecimientos.'];

/** What the user approves: who asks, for which company, and what it can and cannot do. */
export default function McpConsentCard(props: McpConsentCardProps) {
	const { request, companies, companyId, onCompanyChange, onApprove, onDeny, pending, error } = props;

	return (
		<Stack spacing={2.5}>
			<Box>
				<Typography sx={{ fontSize: '1.1rem', fontWeight: 600 }}>{request.clientName} quiere conectarse</Typography>
				<Typography variant="body2" sx={{ color: 'text.secondary' }}>
					Al autorizar, volverás a {request.redirectHost}.
				</Typography>
			</Box>
			<TextField select label="Empresa" variant="filled" fullWidth value={companyId} onChange={(e) => onCompanyChange(Number(e.target.value))}
				sx={{ bgcolor: 'action.hover' }} helperText="La conexión queda fija a esta empresa.">
				{companies.map((c) => (
					<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
				))}
			</TextField>
			<PermissionList icon="heroicons-outline:check-circle" color="success.main" items={ALLOWED} />
			<PermissionList icon="heroicons-outline:no-symbol" color="text.secondary" items={NEVER} />
			{error && <Typography sx={{ color: 'error.main', fontSize: '0.85rem' }}>{error}</Typography>}
			<Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
				<Button variant="text" onClick={onDeny} disabled={pending} sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}>
					Cancelar
				</Button>
				<Button variant="contained" onClick={onApprove} disabled={pending}
					sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', px: 3.5, fontWeight: 700, borderRadius: '6px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}>
					Autorizar acceso
				</Button>
			</Stack>
		</Stack>
	);
}

function PermissionList({ icon, color, items }: { icon: string; color: string; items: string[] }) {
	return (
		<Stack spacing={0.75}>
			{items.map((item) => (
				<Stack key={item} direction="row" spacing={1} alignItems="flex-start">
					<FuseSvgIcon size={18} sx={{ color, mt: '1px' }}>{icon}</FuseSvgIcon>
					<Typography variant="body2">{item}</Typography>
				</Stack>
			))}
		</Stack>
	);
}
