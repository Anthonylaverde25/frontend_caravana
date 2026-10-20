import { Box, Button, Chip, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, Theme } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { formatCuit } from '@/core/shared/domain/cuit';
import { RecognitionStatus } from '@/core/fiscal/domain/entities/ProviderRecognition';
import { headline, notes, sourceLabel } from './imageReadCopy';
import { ImageRecognition } from './useImageRecognition';
import ImageThumbnail from './ImageThumbnail';

const TONE: Record<RecognitionStatus, { color: 'success' | 'info' | 'warning' | 'error'; icon: string }> = {
	MATCHED: { color: 'success', icon: 'heroicons-outline:check-circle' },
	NEW: { color: 'info', icon: 'heroicons-outline:user-plus' },
	ROLE_MISSING: { color: 'warning', icon: 'heroicons-outline:exclamation-triangle' },
	UNREADABLE: { color: 'error', icon: 'heroicons-outline:exclamation-triangle' }
};

/** "Leído de la imagen": who issued the paper, against the portfolio, and what to do about it. */
export default function ImageReadPanel({ image }: { image: ImageRecognition }) {
	const r = image.recognition;

	if (!r || !image.file) return null;

	const tone = TONE[r.status];
	const source = sourceLabel(r);
	const issuerFacts = [
		r.issuer.cuit && formatCuit(r.issuer.cuit),
		r.issuer.legalName ?? r.issuer.name,
		r.issuer.address
	].filter(Boolean);
	const action = {
		NEW: (
			<Button
				size="small"
				variant="contained"
				onClick={image.createProvider}
				sx={btnSx}
			>
				Crear proveedor
			</Button>
		),
		ROLE_MISSING: (
			<Button
				size="small"
				variant="contained"
				onClick={image.enableRole}
				disabled={image.enablingRole}
				sx={btnSx}
				startIcon={
					image.enablingRole ? (
						<CircularProgress
							size={14}
							color="inherit"
						/>
					) : undefined
				}
			>
				Habilitar artículos y servicios
			</Button>
		),
		UNREADABLE: r.suggestedCuit ? (
			<Button
				size="small"
				variant="contained"
				onClick={image.useSuggested}
				sx={btnSx}
			>
				Usar {formatCuit(r.suggestedCuit)}
			</Button>
		) : null,
		MATCHED: null
	}[r.status];

	return (
		<Box
			component="section"
			aria-label="Leído de la imagen"
			sx={{
				display: 'flex',
				gap: 2,
				alignItems: 'flex-start',
				px: { xs: 2, sm: 2.5 },
				py: 1.5,
				borderBottom: 1,
				borderColor: 'divider',
				bgcolor: (theme: Theme) => alpha(theme.palette[tone.color].main, 0.06)
			}}
		>
			<ImageThumbnail
				url={image.previewUrl}
				fileName={image.file.name}
			/>
			<Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
				<Stack
					direction="row"
					spacing={1}
					alignItems="center"
					flexWrap="wrap"
					useFlexGap
				>
					<FuseSvgIcon
						size={18}
						sx={{ color: `${tone.color}.main` }}
					>
						{tone.icon}
					</FuseSvgIcon>
					<Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>{headline(r)}</Typography>
					{source && (
						<Chip
							size="small"
							label={source}
							variant="outlined"
							sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
						/>
					)}
				</Stack>
				{issuerFacts.length > 0 && (
					<Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
						Emisor:{' '}
						<Box
							component="span"
							sx={{ fontFamily: 'monospace', fontWeight: 600 }}
						>
							{issuerFacts[0]}
						</Box>
						{issuerFacts.slice(1).map((fact) => ` · ${fact}`)}
					</Typography>
				)}
				{r.status === 'MATCHED' && (
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
						Quedó seleccionado en la hoja; podés cambiarlo.
					</Typography>
				)}
				{r.status === 'UNREADABLE' && !r.suggestedCuit && (
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
						Elegí el proveedor a mano en "Razón social".
					</Typography>
				)}
				{notes(r).map((note) => (
					<Typography
						key={note.text}
						sx={{
							fontSize: '0.75rem',
							fontWeight: note.tone === 'warn' ? 600 : 400,
							color: note.tone === 'warn' ? 'warning.dark' : 'text.secondary'
						}}
					>
						{note.text}
					</Typography>
				))}
				{r.receiver && !r.receiverMismatch && (
					<Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
						Receptor: {formatCuit(r.receiver.cuit)}
						{r.companyCuit === r.receiver.cuit ? ' (tu empresa)' : ''}
					</Typography>
				)}
			</Box>
			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
				sx={{ flexShrink: 0 }}
			>
				{action}
				<Tooltip title="Cerrar lo leído">
					<IconButton
						size="small"
						aria-label="Cerrar lo leído"
						onClick={image.dismiss}
					>
						<FuseSvgIcon size={16}>heroicons-outline:x-mark</FuseSvgIcon>
					</IconButton>
				</Tooltip>
			</Stack>
		</Box>
	);
}

const btnSx = {
	textTransform: 'none',
	fontWeight: 700,
	borderRadius: '6px',
	boxShadow: 'none',
	whiteSpace: 'nowrap'
} as const;
