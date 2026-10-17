import { Typography } from '@mui/material';

/** A value that does not apply to the row, in muted text so it does not compete with real data. */
export function NotApplicable() {
	return (
		<Typography
			component="span"
			variant="caption"
			sx={{ color: 'text.disabled', fontStyle: 'italic' }}
		>
			No aplica
		</Typography>
	);
}

export default NotApplicable;
