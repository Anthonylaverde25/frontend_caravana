import { Box, Stack } from '@mui/material';
import PageBreadcrumb from './PageBreadcrumb';
import PageTitle from './PageTitle';
import { ReactNode } from 'react';

export type ViewHeaderProps = {
	title?: string;
	subtitle?: string;
	actions?: ReactNode;
	showBreadcrumb?: boolean;
	className?: string;
};

/**
 * ViewHeader Component
 * A standardized minimalist header for views.
 */
function ViewHeader(props: ViewHeaderProps) {
	const { title, subtitle, actions, showBreadcrumb = true, className = '' } = props;

	return (
		<Box
			component="header"
			className={`mt-5  border flex flex-col mb-8 w-full ${className}`}
		>
			{showBreadcrumb && (
				<Box className="mb-4">
					<PageBreadcrumb
						className="border-0 px-0"
						borderColor="transparent"
					/>
				</Box>
			)}

			<Stack
				direction={{ xs: 'column', sm: 'row' }}
				spacing={2}
				justifyContent="space-between"
				alignItems={{ xs: 'flex-start', sm: 'center' }}
				className="w-full"
			>
				<PageTitle
					title={title}
					subtitle={subtitle}
				/>

				{actions && (
					<Box className="flex items-center gap-2">
						{actions}
					</Box>
				)}
			</Stack>
		</Box>
	);
}

export default ViewHeader;
