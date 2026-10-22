import { useState } from 'react';
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Divider,
	IconButton,
	Popover,
	Stack,
	Tooltip,
	Typography
} from '@mui/material';
import { alpha, Theme } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { formatCuit } from '@/core/shared/domain/cuit';
import { RecognitionStatus } from '@/core/fiscal/domain/entities/ProviderRecognition';
import { getLinesBreakdown, headline, notes, sourceLabel } from './imageReadCopy';
import { ImageRecognition } from './useImageRecognition';
import ImageThumbnail from './ImageThumbnail';

const TONE: Record<RecognitionStatus, { color: 'success' | 'info' | 'warning' | 'error'; icon: string }> = {
	MATCHED: { color: 'success', icon: 'heroicons-outline:check-circle' },
	NEW: { color: 'info', icon: 'heroicons-outline:user-plus' },
	ROLE_MISSING: { color: 'warning', icon: 'heroicons-outline:exclamation-triangle' },
	UNREADABLE: { color: 'error', icon: 'heroicons-outline:exclamation-triangle' }
};

/**
 * Ultra-compact, high-density toolbar showing OCR recognition feedback without taking
 * valuable vertical canvas from the fiscal lines table.
 */
export default function ImageReadPanel({ image }: { image: ImageRecognition }) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const r = image.recognition;

	if (!r || !image.file) return null;

	const tone = TONE[r.status];
	const source = sourceLabel(r);
	const breakdown = getLinesBreakdown(r);
	const allNotes = notes(r);

	const issuerName = r.provider?.name ?? r.issuer.legalName ?? r.issuer.name ?? 'Emisor desconocido';
	const issuerCuit = r.issuer.cuit ? formatCuit(r.issuer.cuit) : null;

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
							size={12}
							color="inherit"
						/>
					) : undefined
				}
			>
				Habilitar rubro insumos
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
		<>
			<Box
				component="section"
				aria-label="Resumen de lectura OCR"
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: 1.5,
					px: { xs: 1.5, sm: 2 },
					py: 0.75,
					minHeight: 44,
					borderBottom: 1,
					borderColor: (theme: Theme) => alpha(theme.palette[tone.color].main, 0.22),
					bgcolor: (theme: Theme) => alpha(theme.palette[tone.color].main, 0.05),
					flexWrap: { xs: 'wrap', md: 'nowrap' }
				}}
			>
				{/* Left Group: Thumbnail + Status icon + Vendor recognition + Breakdown */}
				<Stack
					direction="row"
					spacing={1.25}
					alignItems="center"
					sx={{ minWidth: 0, flex: 1, flexWrap: 'wrap', rowGap: 0.75 }}
				>
					<ImageThumbnail
						url={image.previewUrl}
						fileName={image.file.name}
						size="compact"
					/>

					<FuseSvgIcon
						size={18}
						sx={{ color: `${tone.color}.main`, flexShrink: 0 }}
					>
						{tone.icon}
					</FuseSvgIcon>

					{/* Recognition Label */}
					<Stack
						direction="row"
						spacing={0.75}
						alignItems="center"
						sx={{ minWidth: 0, flexShrink: 0 }}
					>
						{r.status === 'MATCHED' ? (
							<>
								<Typography sx={{ fontSize: '0.80rem', fontWeight: 600, color: 'text.secondary' }}>
									Reconocido:
								</Typography>
								<Tooltip title={issuerName}>
									<Typography
										sx={{
											fontSize: '0.82rem',
											fontWeight: 700,
											color: 'text.primary',
											maxWidth: { xs: 160, sm: 220, md: 280 },
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis'
										}}
									>
										{issuerName}
									</Typography>
								</Tooltip>
							</>
						) : r.status === 'NEW' ? (
							<>
								<Typography sx={{ fontSize: '0.80rem', fontWeight: 700, color: 'info.main' }}>
									Nuevo proveedor:
								</Typography>
								<Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'text.primary' }}>
									{issuerName} {issuerCuit ? `(${issuerCuit})` : ''}
								</Typography>
							</>
						) : r.status === 'ROLE_MISSING' ? (
							<>
								<Typography sx={{ fontSize: '0.80rem', fontWeight: 700, color: 'warning.main' }}>
									Insumos no habilitados:
								</Typography>
								<Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'text.primary' }}>
									{issuerName}
								</Typography>
							</>
						) : (
							<Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'error.main' }}>
								{headline(r)}
							</Typography>
						)}

						{source && (
							<Chip
								size="small"
								label={source}
								variant="outlined"
								sx={{
									height: 20,
									fontSize: '0.65rem',
									fontWeight: 600,
									bgcolor: 'background.paper',
									borderColor: 'divider',
									flexShrink: 0
								}}
							/>
						)}
					</Stack>

					{/* Separator */}
					<Box
						sx={{
							width: '1px',
							height: 18,
							bgcolor: 'divider',
							display: { xs: 'none', sm: 'block' },
							flexShrink: 0
						}}
					/>

					{/* Lines breakdown badges */}
					{breakdown && (
						<Stack
							direction="row"
							spacing={0.75}
							alignItems="center"
							sx={{ flexShrink: 0 }}
						>
							<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}>
								{breakdown.total} {breakdown.total === 1 ? 'renglón' : 'renglones'}:
							</Typography>
							{breakdown.exact > 0 && (
								<Tooltip title={`${breakdown.exact} renglones emparejados exactamente con tu catálogo`}>
									<Chip
										size="small"
										label={`${breakdown.exact} exactos`}
										sx={{
											height: 20,
											fontSize: '0.68rem',
											fontWeight: 700,
											bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
											color: 'success.dark',
											border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.25)}`
										}}
									/>
								</Tooltip>
							)}
							{breakdown.ai > 0 && (
								<Tooltip title={`${breakdown.ai} sugerencias por IA pendientes de verificar`}>
									<Chip
										size="small"
										label={`${breakdown.ai} sugeridos`}
										sx={{
											height: 20,
											fontSize: '0.68rem',
											fontWeight: 700,
											bgcolor: (theme) => alpha(theme.palette.info.main, 0.12),
											color: 'info.dark',
											border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.25)}`
										}}
									/>
								</Tooltip>
							)}
							{breakdown.none > 0 && (
								<Tooltip title={`${breakdown.none} renglones sin emparejar con el catálogo`}>
									<Chip
										size="small"
										label={`${breakdown.none} a revisar`}
										sx={{
											height: 20,
											fontSize: '0.68rem',
											fontWeight: 700,
											bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
											color: 'warning.dark',
											border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.25)}`
										}}
									/>
								</Tooltip>
							)}
						</Stack>
					)}

					{/* Warning chip if receiver mismatch */}
					{r.receiverMismatch && r.receiver && (
						<Tooltip
							title={`Comprobante emitido a nombre de ${formatCuit(r.receiver.cuit)}, no de tu empresa (${formatCuit(r.companyCuit ?? '')})`}
						>
							<Chip
								size="small"
								icon={
									<FuseSvgIcon
										size={13}
										sx={{ color: 'warning.dark' }}
									>
										heroicons-outline:exclamation-triangle
									</FuseSvgIcon>
								}
								label="Receptor no coincide"
								sx={{
									height: 20,
									fontSize: '0.68rem',
									fontWeight: 700,
									bgcolor: (theme) => alpha(theme.palette.warning.main, 0.14),
									color: 'warning.dark',
									border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
								}}
							/>
						</Tooltip>
					)}
				</Stack>

				{/* Right Group: Action button + Info button + Dismiss button */}
				<Stack
					direction="row"
					spacing={0.75}
					alignItems="center"
					sx={{ flexShrink: 0 }}
				>
					{action}

					<Tooltip title="Ver detalles del escaneo">
						<IconButton
							size="small"
							onClick={(e) => setAnchorEl(e.currentTarget)}
							aria-label="Ver detalles del escaneo"
							sx={{
								width: 28,
								height: 28,
								color: 'text.secondary',
								bgcolor: 'background.paper',
								border: 1,
								borderColor: 'divider',
								'&:hover': { bgcolor: 'action.hover', color: 'text.primary' }
							}}
						>
							<FuseSvgIcon size={16}>heroicons-outline:information-circle</FuseSvgIcon>
						</IconButton>
					</Tooltip>

					<Tooltip title="Ocultar aviso">
						<IconButton
							size="small"
							aria-label="Ocultar aviso"
							onClick={image.dismiss}
							sx={{
								width: 28,
								height: 28,
								color: 'text.secondary',
								bgcolor: 'background.paper',
								border: 1,
								borderColor: 'divider',
								'&:hover': { bgcolor: 'action.hover', color: 'error.main' }
							}}
						>
							<FuseSvgIcon size={14}>heroicons-outline:x-mark</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				</Stack>
			</Box>

			{/* Floating Popover with complete OCR diagnosis without occupying canvas height */}
			<Popover
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				PaperProps={{
					sx: {
						p: 2,
						width: 380,
						maxWidth: '90vw',
						borderRadius: '8px',
						boxShadow: '0 4px 20px -2px rgba(0,0,0,0.15)'
					}
				}}
			>
				<Stack spacing={1.5}>
					<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
						<Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>
							Detalles del procesamiento OCR
						</Typography>
						<IconButton
							size="small"
							onClick={() => setAnchorEl(null)}
							sx={{ width: 24, height: 24 }}
						>
							<FuseSvgIcon size={14}>heroicons-outline:x-mark</FuseSvgIcon>
						</IconButton>
					</Box>

					<Divider />

					{/* File Info */}
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
						<Typography sx={{ fontSize: '0.70rem', color: 'text.secondary', fontWeight: 600 }}>
							ARCHIVO LEÍDO
						</Typography>
						<Typography sx={{ fontSize: '0.78rem', fontWeight: 600 }}>{image.file.name}</Typography>
					</Box>

					{/* Issuer info */}
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
						<Typography sx={{ fontSize: '0.70rem', color: 'text.secondary', fontWeight: 600 }}>
							EMISOR DETECTADO
						</Typography>
						{issuerCuit && (
							<Typography sx={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 600 }}>
								CUIT: {issuerCuit} {source ? `(${source})` : ''}
							</Typography>
						)}
						{r.issuer.legalName && (
							<Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
								Razón Social: {r.issuer.legalName}
							</Typography>
						)}
						{r.issuer.address && (
							<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
								Dirección: {r.issuer.address}
							</Typography>
						)}
					</Box>

					{/* Receiver info */}
					{r.receiver && (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
							<Typography sx={{ fontSize: '0.70rem', color: 'text.secondary', fontWeight: 600 }}>
								RECEPTOR DETECTADO
							</Typography>
							<Typography sx={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>
								CUIT: {formatCuit(r.receiver.cuit)}
								{r.companyCuit === r.receiver.cuit ? ' (Tu empresa)' : ''}
							</Typography>
						</Box>
					)}

					{/* Diagnostic notes */}
					{allNotes.length > 0 && (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pt: 0.5 }}>
							<Typography sx={{ fontSize: '0.70rem', color: 'text.secondary', fontWeight: 600 }}>
								OBSERVACIONES
							</Typography>
							{allNotes.map((note) => (
								<Typography
									key={note.text}
									sx={{
										fontSize: '0.75rem',
										color: note.tone === 'warn' ? 'warning.dark' : 'text.secondary',
										fontWeight: note.tone === 'warn' ? 600 : 400
									}}
								>
									• {note.text}
								</Typography>
							))}
						</Box>
					)}
				</Stack>
			</Popover>
		</>
	);
}

const btnSx = {
	textTransform: 'none',
	fontWeight: 700,
	fontSize: '0.75rem',
	borderRadius: '6px',
	height: 28,
	px: 1.5,
	boxShadow: 'none',
	whiteSpace: 'nowrap'
} as const;
