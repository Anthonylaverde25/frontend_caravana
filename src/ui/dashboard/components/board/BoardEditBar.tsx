import { Box, Button, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { DASHBOARD_COLORS } from '../../theme/dashboardTokens';

/** color="inherit" keeps these buttons out of ContrastThemeContext's global primary-button overrides. */
const BAR_TEXT = '#FFFFFF';

interface BoardEditBarProps {
	boardName: string;
	onDiscard: () => void;
	onSave: () => void;
}

export function BoardEditBar({ boardName, onDiscard, onSave }: BoardEditBarProps) {
	return (
		<Box
			role="region"
			aria-label="Modo edición"
			sx={{
				position: 'sticky',
				top: 0,
				zIndex: 5,
				display: 'flex',
				alignItems: 'center',
				gap: 2,
				px: { xs: 2, sm: 3 },
				py: 1.25,
				bgcolor: DASHBOARD_COLORS.accent,
				color: BAR_TEXT
			}}
		>
			<FuseSvgIcon size={18}>heroicons-outline:pencil-square</FuseSvgIcon>
			<Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
				<Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>{`Editando “${boardName}”`}</Typography>
				<Typography sx={{ fontSize: '0.75rem', opacity: 0.85 }}>
					Los cambios se aplican al guardar. Arrastrá un widget o usá las flechas para moverlo.
				</Typography>
			</Box>
			<Box sx={{ flexGrow: 1 }} />
			<Button
				variant="text"
				color="inherit"
				onClick={onDiscard}
				sx={{
					color: BAR_TEXT,
					fontWeight: 600,
					textTransform: 'none',
					'&:hover': { bgcolor: 'rgba(255,255,255,0.12)' }
				}}
			>
				Descartar
			</Button>
			<Button
				variant="contained"
				color="inherit"
				onClick={onSave}
				sx={{
					bgcolor: BAR_TEXT,
					color: DASHBOARD_COLORS.accent,
					px: 3.5,
					fontWeight: 700,
					borderRadius: '6px',
					textTransform: 'none',
					boxShadow: 'none',
					'&:hover': { bgcolor: '#E3EEE7', boxShadow: 'none' }
				}}
			>
				Guardar tablero
			</Button>
		</Box>
	);
}

export default BoardEditBar;
