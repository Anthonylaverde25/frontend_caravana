import Typography from '@mui/material/Typography';
import Logo from '@/components/theme-layouts/components/Logo';
import { Box } from '@mui/material';

function SignInPageTitle() {
	return (
		<Box className="w-full flex flex-col items-start gap-4">
			<Logo />

			<Box className="mt-3 flex flex-col gap-1.5">
				<Box className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
					<span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
					PORTAL OPERATIVO GANADERO
				</Box>

				<Typography
					variant="h5"
					className="font-extrabold tracking-tight mt-1"
					sx={{ color: 'text.primary', fontWeight: 800 }}
				>
					Acceso al Sistema
				</Typography>

				<Typography variant="body2" sx={{ color: 'text.secondary' }}>
					Ingrese sus credenciales corporativas para gestionar el rodeo y operaciones de campo.
				</Typography>
			</Box>
		</Box>
	);
}

export default SignInPageTitle;
