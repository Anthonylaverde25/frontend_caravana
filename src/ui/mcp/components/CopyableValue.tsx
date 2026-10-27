import { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface CopyableValueProps {
	value: string;
	/** Multi-line values (config snippets) wrap and keep their line breaks. */
	multiline?: boolean;
}

/** A read-only value in monospace with a copy button: URLs, tokens and config snippets. */
export default function CopyableValue({ value, multiline = false }: CopyableValueProps) {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		await navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, bgcolor: 'action.hover', borderRadius: '6px', px: 1.5, py: 1 }}>
			<Typography
				component="pre"
				sx={{
					m: 0,
					flex: 1,
					minWidth: 0,
					fontFamily: 'monospace',
					fontSize: '0.78rem',
					whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
					overflowX: 'auto',
					wordBreak: multiline ? 'break-all' : 'normal'
				}}
			>
				{value}
			</Typography>
			<Tooltip title={copied ? 'Copiado' : 'Copiar'}>
				<IconButton size="small" onClick={copy} sx={{ color: 'primary.main' }} aria-label="Copiar">
					<FuseSvgIcon size={18}>{copied ? 'heroicons-outline:check' : 'heroicons-outline:clipboard-document'}</FuseSvgIcon>
				</IconButton>
			</Tooltip>
		</Box>
	);
}
