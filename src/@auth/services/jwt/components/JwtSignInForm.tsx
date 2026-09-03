import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import _ from 'lodash';
import {
	TextField,
	FormControl,
	FormControlLabel,
	Checkbox,
	Button,
	InputAdornment,
	IconButton,
	Box,
	CircularProgress
} from '@mui/material';
import Link from '@fuse/core/Link';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useJwtAuth from '../useJwtAuth';

const schema = z.object({
	email: z
		.string()
		.email('Ingrese un correo electrónico válido')
		.nonempty('El correo electrónico es requerido'),
	password: z
		.string()
		.min(4, 'La contraseña debe tener al menos 4 caracteres')
		.nonempty('Ingrese su contraseña'),
	remember: z.boolean().optional()
});

type FormType = z.infer<typeof schema>;

const defaultValues: FormType = {
	email: 'test@example.com',
	password: 'password123',
	remember: true
};

function JwtSignInForm() {
	const { signIn } = useJwtAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	const { control, formState, handleSubmit, setError } = useForm<FormType>({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	function onSubmit(formData: FormType) {
		setLoading(true);
		const { email, password } = formData;

		signIn({ email, password })
			.catch((error) => {
				const errorData = error?.data as {
					type: 'email' | 'password' | 'remember' | `root.${string}` | 'root';
					message: string;
				}[];

				errorData?.forEach?.((err) => {
					setError(err.type, {
						type: 'manual',
						message: err.message
					});
				});
			})
			.finally(() => {
				setLoading(false);
			});
	}

	return (
		<form
			name="loginForm"
			noValidate
			className="flex w-full flex-col justify-center"
			onSubmit={handleSubmit(onSubmit)}
		>
			{/* Email Field - SAP Fiori Filled Variant */}
			<Controller
				name="email"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						className="mb-5"
						label="Correo Electrónico o Usuario"
						autoFocus
						type="email"
						variant="filled"
						error={!!errors.email}
						helperText={errors?.email?.message}
						required
						fullWidth
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<FuseSvgIcon size={20} color="action">
										heroicons-outline:mail
									</FuseSvgIcon>
								</InputAdornment>
							)
						}}
					/>
				)}
			/>

			{/* Password Field - SAP Fiori Filled Variant */}
			<Controller
				name="password"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						className="mb-4"
						label="Contraseña"
						type={showPassword ? 'text' : 'password'}
						variant="filled"
						error={!!errors.password}
						helperText={errors?.password?.message}
						required
						fullWidth
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<FuseSvgIcon size={20} color="action">
										heroicons-outline:lock-closed
									</FuseSvgIcon>
								</InputAdornment>
							),
							endAdornment: (
								<InputAdornment position="end">
									<IconButton
										aria-label="Alternar visibilidad de contraseña"
										onClick={() => setShowPassword((prev) => !prev)}
										edge="end"
										size="small"
									>
										<FuseSvgIcon size={20} color="action">
											{showPassword ? 'heroicons-outline:eye-off' : 'heroicons-outline:eye'}
										</FuseSvgIcon>
									</IconButton>
								</InputAdornment>
							)
						}}
					/>
				)}
			/>

			{/* Remember Me & Forgot Password */}
			<Box className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center mb-6">
				<Controller
					name="remember"
					control={control}
					render={({ field }) => (
						<FormControl>
							<FormControlLabel
								label="Recordar credenciales"
								control={
									<Checkbox
										size="small"
										color="primary"
										checked={field.value}
										onChange={(e) => field.onChange(e.target.checked)}
									/>
								}
							/>
						</FormControl>
					)}
				/>

				<Link
					className="text-sm font-semibold color-primary underline-offset-4 hover:underline"
					to="/#"
				>
					¿Olvidó su contraseña?
				</Link>
			</Box>

			{/* Action Button */}
			<Button
				variant="contained"
				className="w-full py-3 text-sm font-bold shadow-md transition-all duration-200"
				disabled={_.isEmpty(dirtyFields) || !isValid || loading}
				type="submit"
				size="large"
				endIcon={
					!loading && (
						<FuseSvgIcon size={18} className="transition-transform group-hover:translate-x-1">
							heroicons-outline:arrow-right
						</FuseSvgIcon>
					)
				}
				sx={{
					background: 'linear-gradient(135deg, #0E3D26 0%, #164E33 100%)',
					color: '#FFFFFF',
					borderRadius: '8px',
					height: 48,
					textTransform: 'none',
					letterSpacing: '0.02em',
					fontSize: '0.95rem',
					boxShadow: '0 4px 14px 0 rgba(14, 61, 38, 0.25)',
					'&:hover': {
						background: 'linear-gradient(135deg, #135233 0%, #1D734B 100%)',
						boxShadow: '0 6px 20px 0 rgba(14, 61, 38, 0.35)'
					},
					'&:disabled': {
						background: 'rgba(0, 0, 0, 0.12)',
						color: 'rgba(0, 0, 0, 0.26)'
					}
				}}
			>
				{loading ? <CircularProgress size={22} color="inherit" /> : 'Iniciar Sesión'}
			</Button>
		</form>
	);
}

export default JwtSignInForm;
