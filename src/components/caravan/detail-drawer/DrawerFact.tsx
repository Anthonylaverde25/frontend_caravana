import type { ReactNode } from 'react';
import { Typography } from '@mui/material';

interface DrawerFactProps {
	label: string;
	children: ReactNode;
	mono?: boolean;
	color?: string;
}

/** A dt/dd pair of a two-column definition list (label left, value right). */
export function DrawerFact({ label, children, mono = false, color }: DrawerFactProps) {
	return (
		<>
			<Typography
				component="dt"
				sx={{ fontSize: '0.8rem', color: 'text.secondary' }}
			>
				{label}
			</Typography>
			<Typography
				component="dd"
				sx={{
					m: 0,
					fontSize: '0.8rem',
					fontWeight: 600,
					textAlign: 'right',
					fontFamily: mono ? 'monospace' : undefined,
					color
				}}
			>
				{children}
			</Typography>
		</>
	);
}

export default DrawerFact;
