import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

/** Shown while a turn is on its way; a turn may chain several reads, so it can take a while. */
export function ThinkingIndicator() {
	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
			<CircularProgress
				size={14}
				thickness={5}
			/>
			<Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
				XIMON está consultando tus registros…
			</Typography>
		</Box>
	);
}

export default ThinkingIndicator;
