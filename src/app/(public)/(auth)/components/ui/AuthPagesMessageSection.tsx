import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Paper, Stack } from '@mui/material';

function AuthPagesMessageSection() {
	const agroTags = [
		{ icon: 'heroicons-outline:tag', label: 'RFID ISO 11784/85' },
		{ icon: 'heroicons-outline:presentation-chart-line', label: 'Monitoreo GDP' },
		{ icon: 'heroicons-outline:sparkles', label: 'Precisión Operativa' }
	];

	const features = [
		{
			icon: 'heroicons-outline:chart-bar',
			title: 'Gestión Inteligente de Rodeos',
			description: 'Optimización de cargas animales, asignación de potreros y rotación de pasturas.'
		},
		{
			icon: 'heroicons-outline:identification',
			title: 'Trazabilidad Individual RFID',
			description: 'Lectura automatizada de caravanas electrónicas e historial genético y sanitario.'
		},
		{
			icon: 'heroicons-outline:scale',
			title: 'Control Productivo & Sanidad',
			description: 'Seguimiento de ganancia diaria de peso (GDP), servicios reproductivos y planes sanitarios.'
		}
	];

	return (
		<Box
			className="relative hidden h-full flex-auto items-center justify-center overflow-hidden p-12 md:flex lg:px-20"
			sx={{
				background: 'linear-gradient(145deg, #092C1B 0%, #064E3B 55%, #02241C 100%)',
				color: '#FFFFFF'
			}}
		>
			{/* Topographic Contour Lines SVG Pattern */}
			<svg
				className="pointer-events-none absolute inset-0 opacity-[0.07]"
				viewBox="0 0 1000 1000"
				width="100%"
				height="100%"
				preserveAspectRatio="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M-100,200 C200,100 400,350 700,250 C1000,150 1100,300 1200,250"
					fill="none"
					stroke="#FFFFFF"
					strokeWidth="2"
				/>
				<path
					d="M-100,320 C250,220 450,470 750,370 C1050,270 1150,420 1200,370"
					fill="none"
					stroke="#FFFFFF"
					strokeWidth="2"
				/>
				<path
					d="M-100,440 C180,340 380,590 680,490 C980,390 1080,540 1200,490"
					fill="none"
					stroke="#FFFFFF"
					strokeWidth="2"
				/>
				<path
					d="M-100,560 C220,460 420,710 720,610 C1020,510 1120,660 1200,610"
					fill="none"
					stroke="#FFFFFF"
					strokeWidth="2"
				/>
				<path
					d="M-100,680 C280,580 480,830 780,730 C1080,630 1180,780 1200,730"
					fill="none"
					stroke="#FFFFFF"
					strokeWidth="2"
				/>
				<path
					d="M-100,800 C150,700 350,950 650,850 C950,750 1050,900 1200,850"
					fill="none"
					stroke="#FFFFFF"
					strokeWidth="2"
				/>
			</svg>

			{/* Subtle RXNA Bull Head Brand Watermark in Upper Corner */}
			<Box
				component="img"
				src="/assets/images/logo/logo-light.svg"
				alt=""
				className="pointer-events-none absolute -right-16 -top-16 w-96 h-96 opacity-[0.04] select-none"
			/>

			{/* Soft Ambient Radial Glow */}
			<div
				className="pointer-events-none absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
				style={{
					background: 'radial-gradient(circle, #34D399 0%, rgba(6, 78, 59, 0) 70%)'
				}}
			/>

			{/* Main Content Container */}
			<div className="relative z-10 w-full max-w-xl">
				{/* Category Pill Badge */}
				<Box className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-emerald-300 backdrop-blur-md mb-5 border border-emerald-400/20">
					<FuseSvgIcon size={16} color="inherit">
						heroicons-outline:shield-check
					</FuseSvgIcon>
					PLATAFORMA GANADERA DE PRECISIÓN
				</Box>

				{/* Title & Subtitle */}
				<Typography variant="h3" className="font-extrabold tracking-tight leading-tight text-white mb-3">
					Automatización y Control Ganadero
				</Typography>

				<Typography variant="body1" className="text-emerald-100/80 leading-relaxed mb-6 text-base">
					Impulsando la rentabilidad y eficiencia de su establecimiento con tecnología de trazabilidad de última generación.
				</Typography>

				{/* Micro Agro Tags */}
				<Box className="flex flex-wrap gap-2 mb-8">
					{agroTags.map((tag, idx) => (
						<Box
							key={idx}
							className="inline-flex items-center gap-1.5 rounded-md bg-emerald-950/60 px-2.5 py-1 text-xs font-medium text-emerald-200/90 border border-emerald-500/20 backdrop-blur-sm"
						>
							<FuseSvgIcon size={14} className="text-emerald-400">
								{tag.icon}
							</FuseSvgIcon>
							<span>{tag.label}</span>
						</Box>
					))}
				</Box>

				{/* Feature Highlight Cards */}
				<Stack gap={2} className="mb-8">
					{features.map((feat, idx) => (
						<Paper
							key={idx}
							elevation={0}
							className="group flex items-start gap-4 p-4 rounded-xl backdrop-blur-md transition-all duration-200 hover:bg-white/12 hover:translate-x-1"
							sx={{
								backgroundColor: 'rgba(255, 255, 255, 0.06)',
								border: '1px solid rgba(255, 255, 255, 0.1)',
								borderLeft: '3px solid rgba(52, 211, 153, 0.6)'
							}}
						>
							<Box className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 group-hover:bg-emerald-500/30 transition-colors">
								<FuseSvgIcon size={22}>{feat.icon}</FuseSvgIcon>
							</Box>
							<Box>
								<Typography variant="subtitle2" className="font-bold text-white text-[15px]">
									{feat.title}
								</Typography>
								<Typography variant="body2" className="text-emerald-100/70 text-xs mt-0.5 leading-normal">
									{feat.description}
								</Typography>
							</Box>
						</Paper>
					))}
				</Stack>

				{/* Footer Trust Badge */}
				<Box className="flex items-center justify-between border-t border-white/10 pt-5 text-xs text-emerald-200/60">
					<span className="flex items-center gap-1.5">
						<FuseSvgIcon size={14} className="text-emerald-400">
							heroicons-outline:lock-closed
						</FuseSvgIcon>
						Conexión Encriptada TLS 1.3 / SSL
					</span>
					<span>RXNA Agrotech Enterprise</span>
				</Box>
			</div>
		</Box>
	);
}

export default AuthPagesMessageSection;
