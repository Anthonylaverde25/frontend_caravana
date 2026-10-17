import { Box, Button, Chip, IconButton, Stack, Tab, Tabs, Typography } from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import type { Caravan } from '@/core/caravans/domain/entities/Caravan';
import { statusChips, type ChipTone } from './caravanDrawerModel';

export type CaravanDrawerTab = 'summary' | 'weights' | 'history';

export interface CaravanDrawerActions {
	onWeigh?: () => void;
	onMove?: () => void;
	onEdit?: () => void;
}

interface CaravanDrawerHeaderProps extends CaravanDrawerActions {
	displayId: string;
	caravan: Caravan | null | undefined;
	tab: CaravanDrawerTab;
	onTabChange: (tab: CaravanDrawerTab) => void;
	onClose: () => void;
}

const toneSx = (tone: ChipTone) => (theme: Theme) => {
	const color =
		tone === 'success'
			? theme.palette.success.main
			: tone === 'warning'
				? theme.palette.warning.main
				: tone === 'error'
					? theme.palette.error.main
					: theme.palette.text.secondary;
	const text =
		tone === 'success'
			? theme.palette.success.dark
			: tone === 'warning'
				? theme.palette.warning.dark
				: tone === 'error'
					? theme.palette.error.dark
					: theme.palette.text.secondary;

	return { height: 24, fontSize: '0.75rem', fontWeight: 600, color: text, bgcolor: alpha(color, 0.1) };
};

const separator = (
	<Typography
		component="span"
		aria-hidden="true"
		sx={{ color: 'divider', fontWeight: 700, fontSize: '0.75rem' }}
	>
		|
	</Typography>
);

const actionSx = {
	height: 36,
	borderRadius: '6px',
	fontWeight: 600,
	textTransform: 'none',
	fontSize: '0.8rem'
} as const;

/** Identity of the caravan (same pattern as the batch header), its states, actions and tabs. */
export function CaravanDrawerHeader({
	displayId,
	caravan,
	tab,
	onTabChange,
	onClose,
	onWeigh,
	onMove,
	onEdit
}: CaravanDrawerHeaderProps) {
	const chips = caravan ? statusChips(caravan) : [];
	const hasActions = !!caravan && (onWeigh || onMove || onEdit);

	return (
		<Box sx={{ px: 2.5, pt: 2.5, borderBottom: 1, borderColor: 'divider' }}>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="flex-start"
				spacing={1.5}
			>
				<Box sx={{ minWidth: 0 }}>
					<Typography
						variant="caption"
						sx={{ color: 'text.secondary' }}
					>
						Caravana
					</Typography>
					<Typography
						component="h2"
						sx={{ fontFamily: 'monospace', fontSize: '1.6rem', fontWeight: 600, lineHeight: 1.15 }}
					>
						{displayId}
					</Typography>
					{caravan && (
						<Stack
							direction="row"
							spacing={1}
							alignItems="center"
							flexWrap="wrap"
							useFlexGap
							sx={{ mt: 0.5, fontSize: '0.75rem' }}
						>
							<Typography
								component="span"
								sx={{ fontSize: 'inherit', fontWeight: 600, color: 'text.secondary' }}
							>
								{caravan.sex === 'M' ? 'Macho' : 'Hembra'}
							</Typography>
							{separator}
							<Typography
								component="span"
								sx={{
									fontSize: 'inherit',
									fontWeight: 700,
									color: 'primary.main',
									textTransform: 'uppercase',
									letterSpacing: '0.04em'
								}}
							>
								{caravan.category_name || caravan.category || 'Sin categoría'}
							</Typography>
							{separator}
							<Typography
								component="span"
								sx={{ fontSize: 'inherit', fontWeight: 600, color: 'text.secondary' }}
							>
								{caravan.batch_name || 'Sin lote'}
							</Typography>
						</Stack>
					)}
				</Box>
				<IconButton
					aria-label="Cerrar"
					onClick={onClose}
					sx={{ color: 'primary.main' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Stack>

			{chips.length > 0 && (
				<Stack
					direction="row"
					spacing={0.75}
					flexWrap="wrap"
					useFlexGap
					sx={{ mt: 1.75 }}
				>
					{chips.map((chip) => (
						<Chip
							key={chip.label}
							label={chip.label}
							size="small"
							sx={toneSx(chip.tone)}
						/>
					))}
				</Stack>
			)}

			{hasActions && (
				<Stack
					direction="row"
					spacing={1}
					sx={{ mt: 1.75 }}
				>
					{onWeigh && (
						<Button
							variant="outlined"
							color="inherit"
							onClick={onWeigh}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:scale</FuseSvgIcon>}
							sx={actionSx}
						>
							Pesar
						</Button>
					)}
					{onMove && (
						<Button
							variant="outlined"
							color="inherit"
							onClick={onMove}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:arrows-right-left</FuseSvgIcon>}
							sx={actionSx}
						>
							Mover de lote
						</Button>
					)}
					{onEdit && (
						<Button
							variant="outlined"
							color="inherit"
							onClick={onEdit}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:pencil-square</FuseSvgIcon>}
							sx={actionSx}
						>
							Editar
						</Button>
					)}
				</Stack>
			)}

			<Tabs
				value={tab}
				onChange={(_, value: CaravanDrawerTab) => onTabChange(value)}
				aria-label="Secciones de la ficha"
				sx={{
					mt: 1,
					minHeight: 44,
					'& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 600, px: 1.5, minWidth: 0 }
				}}
			>
				<Tab
					value="summary"
					label="Resumen"
				/>
				<Tab
					value="weights"
					label="Pesos"
					disabled={!caravan}
				/>
				<Tab
					value="history"
					label="Historial"
					disabled={!caravan}
				/>
			</Tabs>
		</Box>
	);
}

export default CaravanDrawerHeader;
