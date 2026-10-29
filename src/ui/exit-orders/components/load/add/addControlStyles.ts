import type { SxProps, Theme } from '@mui/material';

/**
 * The soft button of the add bar ("Agregar lotes", "Pegar lista"): the height of the filled field
 * beside it, no border, a tint that darkens on hover and while its panel is open.
 */
export const softButtonSx = (open: boolean): SxProps<Theme> => ({
	height: 40,
	px: 1.5,
	gap: 0.25,
	flex: 'none',
	borderRadius: '8px',
	textTransform: 'none',
	fontWeight: 600,
	fontSize: '0.82rem',
	whiteSpace: 'nowrap',
	color: open ? 'primary.main' : 'text.primary',
	bgcolor: open ? 'action.selected' : 'action.hover',
	'& .MuiButton-startIcon': { color: open ? 'primary.main' : 'text.secondary', mr: 0.75 },
	'&:hover': { bgcolor: 'action.selected' }
});

/** The panel a soft button opens, anchored under it. */
export const panelPaperSx: SxProps<Theme> = {
	mt: 0.75,
	borderRadius: '10px',
	boxShadow: 4,
	border: 1,
	borderColor: 'divider',
	overflow: 'hidden'
};
