import { useState } from 'react';
import { Box, Dialog, IconButton, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface ImageThumbnailProps {
	url: string | null;
	fileName: string;
	size?: 'compact' | 'default';
}

/** The uploaded paper in small; a click shows it whole. A PDF shows its name only. */
export default function ImageThumbnail({ url, fileName, size = 'default' }: ImageThumbnailProps) {
	const [open, setOpen] = useState(false);
	const isCompact = size === 'compact';
	const frame = isCompact
		? { width: 30, height: 36, flexShrink: 0, borderRadius: '4px', border: 1, borderColor: 'divider' }
		: { width: 64, height: 84, flexShrink: 0, borderRadius: '4px', border: 1, borderColor: 'divider' };

	if (!url) {
		return (
			<Tooltip title={fileName}>
				<Box
					sx={{
						...frame,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						bgcolor: 'background.paper',
						transition: 'transform 0.15s ease, border-color 0.15s ease',
						'&:hover': {
							borderColor: 'primary.main',
							transform: isCompact ? 'scale(1.05)' : undefined
						}
					}}
				>
					<FuseSvgIcon
						size={isCompact ? 18 : 26}
						sx={{ color: 'text.secondary' }}
					>
						heroicons-outline:document-text
					</FuseSvgIcon>
				</Box>
			</Tooltip>
		);
	}

	return (
		<>
			<Tooltip title="Ver la imagen completa">
				<Box
					component="button"
					type="button"
					onClick={() => setOpen(true)}
					aria-label={`Ver ${fileName}`}
					sx={{ ...frame, p: 0, cursor: 'zoom-in', overflow: 'hidden', bgcolor: 'background.paper' }}
				>
					<Box
						component="img"
						src={url}
						alt=""
						sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
					/>
				</Box>
			</Tooltip>
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				maxWidth="md"
				PaperProps={{ sx: { borderRadius: '8px' } }}
			>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						px: 2,
						py: 1,
						borderBottom: 1,
						borderColor: 'divider'
					}}
				>
					<Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{fileName}</Typography>
					<IconButton
						size="small"
						onClick={() => setOpen(false)}
						sx={{ color: 'primary.main' }}
					>
						<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
					</IconButton>
				</Box>
				<Box
					component="img"
					src={url}
					alt={fileName}
					sx={{ display: 'block', maxWidth: '100%', maxHeight: '80vh' }}
				/>
			</Dialog>
		</>
	);
}
