import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';

const Root = styled('div')(({ theme }) => ({
	'& > .logo-icon': {
		transition: theme.transitions.create(['width', 'height'], {
			duration: theme.transitions.duration.shortest,
			easing: theme.transitions.easing.easeInOut
		})
	},
	'& > .badge': {
		transition: theme.transitions.create('opacity', {
			duration: theme.transitions.duration.shortest,
			easing: theme.transitions.easing.easeInOut
		})
	}
}));

type LogoProps = {
	className?: string;
};

/**
 * The logo component.
 */
function Logo(props: LogoProps) {
	const { className = '' } = props;
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';

	return (
		<Root className={clsx('flex flex-shrink-0 flex-grow items-center gap-3', className)}>
			<div className="flex flex-1 items-center gap-3.5">
				<img
					className="logo-icon h-12 w-12"
					src={isDark ? '/assets/images/logo/logo-light.svg' : '/assets/images/logo/logo-dark.svg'}
					alt="logo"
				/>
				<div className="logo-text flex flex-auto flex-col gap-1">
					<Typography 
						className="tracking-wider text-3xl leading-none font-black"
						style={{ color: isDark ? '#26D07C' : '#0E3D26', fontFamily: 'system-ui, -apple-system, sans-serif' }}
					>
						RXNA
					</Typography>
					<Typography
						className="tracking-widest text-[11px] uppercase leading-none font-bold"
						style={{ color: isDark ? '#A7F3D0' : '#3A6351', fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.2em' }}
					>
						Sistema Ganadero
					</Typography>
				</div>
			</div>
		</Root>
	);
}

export default Logo;
