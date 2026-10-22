import { Box, Button, Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ReadLinesPrompt } from './image/useReadLines';

const primarySx = {
	bgcolor: 'primary.main',
	color: 'primary.contrastText',
	px: 3.5,
	fontWeight: 700,
	borderRadius: '6px',
	textTransform: 'none',
	boxShadow: 'none',
	'&:hover': { bgcolor: 'primary.dark' }
} as const;

/** The sheet already has rows when an image is read (Delivery G, Q1): what to do with them. */
export default function ReplaceLinesDialog({ open, typed, incoming, onChoose }: ReadLinesPrompt) {
	const rows = (n: number) => `${n} ${n === 1 ? 'renglón' : 'renglones'}`;

	return (
		<Dialog
			open={open}
			onClose={() => onChoose('keep')}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' }
			}}
		>
			<Box
				sx={{
					p: 2,
					px: 3,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: 1,
					borderColor: 'divider'
				}}
			>
				<Typography
					variant="h6"
					sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
				>
					La hoja ya tiene renglones
				</Typography>
				<IconButton
					onClick={() => onChoose('keep')}
					sx={{ color: 'primary.main' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<DialogContent sx={{ p: 3 }}>
				<Typography sx={{ fontSize: '0.9rem' }}>
					Cargaste {rows(typed)} y de la imagen se leyeron {rows(incoming)}. ¿Qué hacemos con los que ya
					están?
				</Typography>
			</DialogContent>
			<Box
				sx={{
					p: 2,
					px: 3,
					bgcolor: 'background.default',
					borderTop: 1,
					borderColor: 'divider',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}
			>
				<Button
					variant="text"
					onClick={() => onChoose('keep')}
					sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
				>
					Dejarlos y no cargar los leídos
				</Button>
				<Box sx={{ display: 'flex', gap: 1 }}>
					<Button
						variant="outlined"
						onClick={() => onChoose('append')}
						sx={{ fontWeight: 600, textTransform: 'none', borderRadius: '6px' }}
					>
						Agregar al final
					</Button>
					<Button
						variant="contained"
						onClick={() => onChoose('replace')}
						sx={primarySx}
					>
						Reemplazar
					</Button>
				</Box>
			</Box>
		</Dialog>
	);
}
