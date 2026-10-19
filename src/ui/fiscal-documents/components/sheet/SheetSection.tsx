import { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { sheetLabelSx, sheetSectionSx } from './sheetStyles';

interface SheetSectionProps {
	label?: ReactNode;
	/** On the right of the label: an action ("+ Agregar") or a hint. */
	aside?: ReactNode;
	children: ReactNode;
}

/** One section of the sheet: its label and what it holds; consecutive sections are split by a line. */
export default function SheetSection({ label, aside, children }: SheetSectionProps) {
	return (
		<Box
			component="section"
			sx={sheetSectionSx}
		>
			{(label || aside) && (
				<Stack
					direction="row"
					justifyContent="space-between"
					alignItems="center"
					sx={{ mb: 1.5 }}
				>
					{label && (typeof label === 'string' ? <Typography sx={sheetLabelSx}>{label}</Typography> : label)}
					{aside}
				</Stack>
			)}
			{children}
		</Box>
	);
}
