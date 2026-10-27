import { useState } from 'react';
import { Alert, Button, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { IssuedMcpConnection, McpConnection } from '@/core/mcp/domain/McpConnection';
import { useMcpConnections } from '@/features/mcp/hooks/useMcpConnections';
import McpConnectionsGrid from '@/ui/mcp/components/McpConnectionsGrid';
import McpConnectorCard from '@/ui/mcp/components/McpConnectorCard';
import IssueMcpConnectionDialog from '@/ui/mcp/dialogs/IssueMcpConnectionDialog';
import McpTokenRevealDialog from '@/ui/mcp/dialogs/McpTokenRevealDialog';
import RevokeMcpConnectionDialog from '@/ui/mcp/dialogs/RevokeMcpConnectionDialog';
import SettingsSection from '../SettingsSection';

/**
 * AI clients (Claude, Gemini) connected over MCP by the current user in the active company:
 * add one as a connector (OAuth) or create a token by hand, and revoke them.
 */
export default function AiConnectionsSection() {
	const { data, isLoading } = useMcpConnections();
	const [issuing, setIssuing] = useState(false);
	const [issued, setIssued] = useState<IssuedMcpConnection | null>(null);
	const [revoking, setRevoking] = useState<McpConnection | null>(null);

	const onIssued = (result: IssuedMcpConnection) => {
		setIssuing(false);
		setIssued(result);
	};

	return (
		<SettingsSection
			id="ai-connections"
			actions={
				<Button
					variant="contained"
					onClick={() => setIssuing(true)}
					startIcon={<FuseSvgIcon size={20}>heroicons-outline:key</FuseSvgIcon>}
					sx={{ bgcolor: 'primary.main', borderRadius: '6px', px: 3, fontWeight: 700, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: 'primary.dark' } }}
				>
					Crear token
				</Button>
			}
		>
			<Alert severity="info" sx={{ fontSize: '0.8rem', py: 0.5 }}>
				Las conexiones sólo consultan datos de esta empresa con tus permisos; nunca cargan ni modifican nada. Cada usuario ve y
				revoca las suyas.
			</Alert>
			{data && <McpConnectorCard serverUrl={data.serverUrl} />}
			<Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Tus conexiones</Typography>
			{!isLoading && (
				<Stack>
					<McpConnectionsGrid connections={data?.connections ?? []} onRevoke={setRevoking} />
				</Stack>
			)}
			<IssueMcpConnectionDialog open={issuing} onClose={() => setIssuing(false)} onIssued={onIssued} />
			<McpTokenRevealDialog issued={issued} onClose={() => setIssued(null)} />
			<RevokeMcpConnectionDialog connection={revoking} onClose={() => setRevoking(null)} />
		</SettingsSection>
	);
}
