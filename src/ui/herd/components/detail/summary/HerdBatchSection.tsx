import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface HerdBatchSectionProps {
	title: string;
	/** Actions on the data of this section, on the title line. */
	actions?: React.ReactNode;
	children?: React.ReactNode;
	dense?: boolean;
}

/**
 * One section of the batch sheet: a title with its actions and its content, no box around it.
 * Sections are set apart by a hairline, so the page reads as one sheet.
 */
export function HerdBatchSection({ title, actions, children, dense = false }: HerdBatchSectionProps) {
	return (
		<Box
			component="section"
			sx={{
				px: { xs: 2.5, md: 3.5 },
				py: dense ? 1.75 : 2.5,
				display: 'flex',
				flexDirection: 'column',
				gap: 1.75,
				minWidth: 0
			}}
		>
			<Stack
				direction="row"
				alignItems="center"
				flexWrap="wrap"
				columnGap={2.25}
				rowGap={1}
			>
				<Typography
					component="h2"
					sx={{ flex: '1 1 auto', fontSize: '0.95rem', fontWeight: 700, color: 'text.primary' }}
				>
					{title}
				</Typography>
				{actions}
			</Stack>
			{children}
		</Box>
	);
}

interface HerdBatchSectionActionProps {
	label: string;
	onClick: () => void;
	/** "plus" for an action that records something new; none for navigation. */
	icon?: 'plus' | null;
}

/** A text action on a section title line ("+ Pesar lote"). */
export function HerdBatchSectionAction({ label, onClick, icon = 'plus' }: HerdBatchSectionActionProps) {
	return (
		<Button
			variant="text"
			size="small"
			onClick={onClick}
			startIcon={icon ? <FuseSvgIcon size={16}>heroicons-outline:plus</FuseSvgIcon> : undefined}
			sx={{
				p: 0,
				minWidth: 0,
				fontWeight: 600,
				textTransform: 'none',
				'&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
			}}
		>
			{label}
		</Button>
	);
}

export default HerdBatchSection;
