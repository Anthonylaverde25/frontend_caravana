import Paper from '@mui/material/Paper';
import JwtSignInForm from '@auth/services/jwt/components/JwtSignInForm';
import SignInPageTitle from '../ui/SignInPageTitle';
import AuthPagesMessageSection from '../ui/AuthPagesMessageSection';
import { Box, Typography } from '@mui/material';

/**
 * The RXNA Sistema Ganadero sign in page view.
 */
function SignInPageView() {
	return (
		<div className="flex min-w-0 flex-auto flex-col items-center sm:flex-row sm:justify-center md:items-start md:justify-start h-screen">
			{/* Left Authentication Form Panel */}
			<Paper
				elevation={0}
				className="relative h-full w-full px-6 py-8 sm:h-auto sm:w-auto sm:rounded-2xl sm:p-12 sm:shadow-xl md:flex md:h-full md:w-1/2 md:items-center md:justify-center md:rounded-none md:p-16 md:shadow-none ltr:border-r rtl:border-l overflow-hidden"
				sx={{
					backgroundColor: (theme) => theme.palette.background.paper,
					borderColor: (theme) => theme.palette.divider
				}}
			>
				{/* Top subtle brand accent line for mobile & small screens */}
				<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-800 sm:hidden" />

				<div className="mx-auto flex w-full max-w-sm flex-col gap-6 sm:mx-0">
					<SignInPageTitle />

					<Box className="w-full mt-1">
						<JwtSignInForm />
					</Box>

					<Box className="mt-6 border-t border-divider pt-5 flex items-center justify-between text-xs text-text-secondary">
						<Typography variant="caption" color="text.secondary">
							RXNA Agrotech &copy; {new Date().getFullYear()}
						</Typography>
						<Typography variant="caption" sx={{ color: 'text.disabled' }}>
							v16.0
						</Typography>
					</Box>
				</div>
			</Paper>

			{/* Right Agrotech Hero Section */}
			<AuthPagesMessageSection />
		</div>
	);
}

export default SignInPageView;
