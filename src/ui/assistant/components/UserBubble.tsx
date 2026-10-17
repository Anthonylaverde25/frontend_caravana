import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/** The user's question, right-aligned in the brand color. */
export function UserBubble({ text, at }: { text: string; at: string }) {
	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
			<Box
				sx={{
					maxWidth: '85%',
					p: 1.5,
					px: 2,
					borderRadius: '12px',
					borderBottomRightRadius: '2px',
					bgcolor: 'primary.main',
					color: 'primary.contrastText'
				}}
			>
				<Typography
					variant="body2"
					sx={{ lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
				>
					{text}
				</Typography>
			</Box>
			<Typography sx={{ mt: 0.5, px: 0.5, color: 'text.disabled', fontSize: '0.65rem' }}>{at}</Typography>
		</Box>
	);
}

export default UserBubble;
