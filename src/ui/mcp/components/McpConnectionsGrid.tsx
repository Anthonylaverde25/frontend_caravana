import { Chip, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { SheetGrid } from 'src/components/sheet-grid/SheetGrid';
import { SheetGridEmptyRow } from 'src/components/sheet-grid/SheetGridEmptyRow';
import { SheetGridStatusCell } from 'src/components/sheet-grid/SheetGridStatusCell';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { MCP_STATUS_LABEL, McpConnection, mcpConnectionStatus } from '@/core/mcp/domain/McpConnection';
import { formatDate } from '@/core/stock/domain/rules/quantityFormat';
import RowActionsMenu from '@/ui/items/components/settings/RowActionsMenu';

interface McpConnectionsGridProps {
	connections: McpConnection[];
	onRevoke: (connection: McpConnection) => void;
}

const COLUMNS = 8;
const STATUS_COLOR = { active: 'success', expired: 'default', revoked: 'default' } as const;

/** One row per AI client connection of the user; revoked and expired ones stay, in grey, as a record. */
export default function McpConnectionsGrid({ connections, onRevoke }: McpConnectionsGridProps) {
	const { headSx, indexSx, textCellSx } = useGridCellStyles();

	return (
		<SheetGrid minWidth={820} maxHeight={{ xs: 520, lg: 'calc(100vh - 420px)' }}>
			<TableHead>
				<TableRow>
					<TableCell sx={indexSx}>#</TableCell>
					<TableCell sx={headSx}>Nombre</TableCell>
					<TableCell sx={{ ...headSx, width: 110 }}>Tipo</TableCell>
					<TableCell sx={{ ...headSx, width: 110 }}>Creada</TableCell>
					<TableCell sx={{ ...headSx, width: 110 }}>Último uso</TableCell>
					<TableCell sx={{ ...headSx, width: 110 }}>Vence</TableCell>
					<TableCell sx={{ ...headSx, width: 110 }}>Estado</TableCell>
					<TableCell sx={{ ...headSx, width: 48 }} />
				</TableRow>
			</TableHead>
			<TableBody>
				{connections.length === 0 && <SheetGridEmptyRow colSpan={COLUMNS}>Todavía no conectaste ningún cliente de IA.</SheetGridEmptyRow>}
				{connections.map((connection, index) => {
					const status = mcpConnectionStatus(connection);
					const muted = status === 'active' ? {} : { color: 'text.disabled' };
					return (
						<TableRow key={connection.id} hover>
							<TableCell sx={indexSx}>{index + 1}</TableCell>
							<TableCell sx={{ ...textCellSx, fontWeight: 600, ...muted }}>{connection.name}</TableCell>
							<TableCell sx={{ ...textCellSx, ...muted }}>{connection.source === 'oauth' ? 'Conector' : 'Token'}</TableCell>
							<TableCell sx={{ ...textCellSx, ...muted }}>{formatDate(connection.createdAt)}</TableCell>
							<TableCell sx={{ ...textCellSx, ...muted }}>{connection.lastUsedAt ? formatDate(connection.lastUsedAt) : 'Nunca'}</TableCell>
							<TableCell sx={{ ...textCellSx, ...muted }}>{formatDate(connection.expiresAt)}</TableCell>
							<TableCell sx={textCellSx}>
								<Chip size="small" label={MCP_STATUS_LABEL[status]} color={STATUS_COLOR[status]} variant="outlined" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
							</TableCell>
							<SheetGridStatusCell>
								{status === 'active' && <RowActionsMenu actions={[{ label: 'Revocar', onClick: () => onRevoke(connection) }]} />}
							</SheetGridStatusCell>
						</TableRow>
					);
				})}
			</TableBody>
		</SheetGrid>
	);
}
