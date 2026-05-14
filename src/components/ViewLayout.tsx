import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import ViewHeader from './ViewHeader';
import { ReactNode } from 'react';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.palette.divider,
		'& > .container': {
			maxWidth: 'none !important',
			width: '100% !important',
			padding: '0 !important',
			margin: '0 !important',
		},
	},
	'& .FusePageSimple-content': {
		display: 'flex',
		flexDirection: 'column',
		flex: '1 1 auto',
		padding: 0,
		backgroundColor: theme.palette.background.default,
		'& > .container': {
			maxWidth: 'none !important',
			width: '100% !important',
			padding: '0 !important',
			margin: '0 !important',
			display: 'flex',
			flexDirection: 'column',
			flex: '1 1 auto',
		},
	},
}));

interface ViewLayoutProps {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
	headerClassName?: string;
}

/**
 * ViewLayout Component
 * A reusable layout wrapper for consistent full-width views with a standardized header.
 */
function ViewLayout({
	title,
	subtitle,
	actions,
	children,
	className = 'p-4',
	headerClassName = 'p-3',
}: ViewLayoutProps) {
	return (
		<Root
			header={
				<ViewHeader
					title={title}
					subtitle={subtitle}
					actions={actions}
					className={headerClassName}
				/>
			}
			content={<Box className={className}>{children}</Box>}
		/>
	);
}

export default ViewLayout;
