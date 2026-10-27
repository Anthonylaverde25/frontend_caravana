import { useState } from 'react';
import { Stack, Tab, Tabs, Typography } from '@mui/material';
import CopyableValue from './CopyableValue';

interface Snippet {
	label: string;
	where: string;
	build: (url: string, token: string) => string;
}

/**
 * Ready-to-paste configuration for the clients that take a bearer token in a header. Clients that
 * support connectors (claude.ai, Claude Desktop) are better added by URL, with OAuth.
 */
const SNIPPETS: Snippet[] = [
	{
		label: 'Gemini CLI',
		where: 'En ~/.gemini/settings.json',
		build: (url, token) =>
			JSON.stringify({ mcpServers: { ganadero: { httpUrl: url, headers: { Authorization: `Bearer ${token}` } } } }, null, 2)
	},
	{
		label: 'Claude Code',
		where: 'En una terminal',
		build: (url, token) => `claude mcp add --transport http ganadero ${url} --header "Authorization: Bearer ${token}"`
	},
	{
		label: 'Otro cliente',
		where: 'Cualquier cliente MCP con transporte HTTP',
		build: (url, token) => `URL: ${url}\nHeader: Authorization: Bearer ${token}`
	}
];

export default function McpClientSnippets({ serverUrl, token }: { serverUrl: string; token: string }) {
	const [tab, setTab] = useState(0);
	const snippet = SNIPPETS[tab];

	return (
		<Stack spacing={1}>
			<Tabs value={tab} onChange={(_, value: number) => setTab(value)} variant="scrollable" sx={{ minHeight: 36 }}>
				{SNIPPETS.map((s) => (
					<Tab key={s.label} label={s.label} sx={{ minHeight: 36, textTransform: 'none', fontWeight: 600 }} />
				))}
			</Tabs>
			<Typography variant="caption" sx={{ color: 'text.secondary' }}>
				{snippet.where}
			</Typography>
			<CopyableValue value={snippet.build(serverUrl, token)} multiline />
		</Stack>
	);
}
