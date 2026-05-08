import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Chip, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import clsx from 'clsx';
import { ReactNode } from 'react';
import Link from '@fuse/core/Link';

export type PageTitleProps = {
	className?: string;
	title?: string;
	subtitle?: string;
	backUrl?: string;
	backTitle?: string;
	badgeTitle?: string | ReactNode;
};

function PageTitle(props: PageTitleProps) {
	const { className = '', title, subtitle, backUrl, badgeTitle } = props;

	return (
		<div className={clsx('flex items-center gap-2', className)}>
			{backUrl && (
				<Button
					component={Link}
					to={backUrl}
					variant="text"
					size="small"
					sx={{ 
						minWidth: 40,
						width: 40,
						height: 40,
						p: 0,
						borderRadius: 1, 
						color: 'text.secondary',
						'&:hover': {
							backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
							color: 'primary.main',
						},
						transition: (theme) => theme.transitions.create(['background-color', 'color'], {
							duration: theme.transitions.duration.short,
						}),
					}}
				>
					<FuseSvgIcon size={20}>heroicons-outline:arrow-left</FuseSvgIcon>
				</Button>
			)}
			
			<div className="flex flex-col">
				<div className="flex items-center gap-1">
					{title && <Typography className="truncate text-xl font-bold">{title}</Typography>}
					{badgeTitle && badgeTitle !== '' && (
						<Chip
							className="truncate rounded-md"
							label={badgeTitle}
							color="secondary"
							size="small"
						/>
					)}
				</div>
				{subtitle && (
					<Typography
						className="truncate"
						color="text.secondary"
					>
						{subtitle}
					</Typography>
				)}
			</div>
		</div>
	);
}

export default PageTitle;
