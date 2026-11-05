import { Button, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface HerdCaravansSelectionBarProps {
	count: number;
	onClear: () => void;
	/** Only with one operable caravan ticked: a weighing belongs to one animal. */
	onWeigh?: () => void;
	onTransfer?: () => void;
	onSell?: () => void;
	onDeath?: () => void;
	onBreeding?: () => void;
	onCastrate?: () => void;
}

const actionSx = {
	height: 30,
	px: 1.25,
	fontWeight: 700,
	textTransform: 'none',
	color: 'primary.dark',
	borderRadius: '6px'
} as const;

/** What can be done with the caravans ticked in the table; shown only while some are. */
export function HerdCaravansSelectionBar({
	count,
	onClear,
	onWeigh,
	onTransfer,
	onSell,
	onDeath,
	onBreeding,
	onCastrate
}: HerdCaravansSelectionBarProps) {
	const actions = [
		onWeigh && { label: 'Pesar', icon: 'heroicons-outline:scale', onClick: onWeigh },
		onTransfer && { label: 'Trasladar', icon: 'heroicons-outline:arrows-right-left', onClick: onTransfer },
		onSell && { label: 'Vender', icon: 'heroicons-outline:banknotes', onClick: onSell },
		onDeath && { label: 'Registrar muerte', icon: 'heroicons-outline:x-circle', onClick: onDeath },
		onBreeding && { label: 'Aptitud reproductiva', icon: 'heroicons-outline:heart', onClick: onBreeding },
		onCastrate && { label: 'Castrar', icon: 'heroicons-outline:scissors', onClick: onCastrate }
	].filter(Boolean) as { label: string; icon: string; onClick: () => void }[];

	return (
		<Stack
			role="toolbar"
			aria-label="Acciones sobre la selección"
			direction="row"
			alignItems="center"
			flexWrap="wrap"
			gap={0.5}
			sx={{
				px: { xs: 1.5, md: 2.5 },
				py: 0.75,
				bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : '#E8F1EC'),
				borderTop: 1,
				borderBottom: 1,
				borderColor: 'divider'
			}}
		>
			<Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'primary.dark', mx: 1 }}>
				{`${count} ${count === 1 ? 'seleccionada' : 'seleccionadas'}`}
			</Typography>
			{actions.map((action) => (
				<Button
					key={action.label}
					size="small"
					onClick={action.onClick}
					startIcon={<FuseSvgIcon size={16}>{action.icon}</FuseSvgIcon>}
					sx={actionSx}
				>
					{action.label}
				</Button>
			))}
			<Button
				size="small"
				onClick={onClear}
				sx={{ ...actionSx, ml: 'auto', color: 'text.secondary' }}
			>
				Quitar selección
			</Button>
		</Stack>
	);
}

export default HerdCaravansSelectionBar;
