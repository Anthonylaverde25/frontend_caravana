import React from 'react';
import { Paper, Stack, Box, Typography, Button, IconButton, Tooltip, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface BirthsSelectionBannerProps {
	selectedCount: number;
	onWean: (target: 'new' | 'register') => void;
	onClearSelection: () => void;
}

export const BirthsSelectionBanner: React.FC<BirthsSelectionBannerProps> = ({
	selectedCount,
	onWean,
	onClearSelection
}) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const active = isDark ? '#60a5fa' : '#0a6ed1';

	if (selectedCount === 0) return null;

	return (
		<Paper
			elevation={0}
			sx={{
				p: 1.5,
				px: 2,
				borderRadius: '8px',
				border: '1px solid',
				borderColor: alpha(active, isDark ? 0.28 : 0.22),
				bgcolor: alpha(active, isDark ? 0.1 : 0.05),
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				flexWrap: 'wrap',
				gap: 1.5
			}}
		>
			<Stack
				direction="row"
				spacing={1.5}
				alignItems="center"
			>
				<Box
					sx={{
						px: 1.25,
						py: 0.5,
						borderRadius: '6px',
						bgcolor: alpha(active, 0.18),
						color: active,
						fontSize: '0.75rem',
						fontWeight: 800,
						whiteSpace: 'nowrap'
					}}
				>
					{selectedCount} {selectedCount === 1 ? 'cría seleccionada' : 'crías seleccionadas'}
				</Box>
				<Typography
					variant="body2"
					sx={{ fontWeight: 600, color: 'text.primary' }}
				>
					Crías al pie listas para ordenar o registrar destete
				</Typography>
			</Stack>

			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
				flexWrap="wrap"
			>
				<Button
					variant="outlined"
					size="small"
					onClick={() => onWean('register')}
					startIcon={<FuseSvgIcon size={16}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
					sx={{
						textTransform: 'none',
						fontWeight: 700,
						borderRadius: '6px',
						height: 32,
						px: 2,
						whiteSpace: 'nowrap'
					}}
				>
					Registrar destete ({selectedCount})
				</Button>

				<Button
					variant="contained"
					size="small"
					disableElevation
					onClick={() => onWean('new')}
					startIcon={<FuseSvgIcon size={16}>heroicons-outline:document-plus</FuseSvgIcon>}
					sx={{
						textTransform: 'none',
						fontWeight: 700,
						borderRadius: '6px',
						height: 32,
						px: 2,
						whiteSpace: 'nowrap'
					}}
				>
					Nueva orden de destete ({selectedCount})
				</Button>

				<Tooltip title="Limpiar Selección">
					<IconButton
						size="small"
						onClick={onClearSelection}
						sx={{ height: 32, width: 32, color: 'text.secondary' }}
					>
						<FuseSvgIcon size={18}>heroicons-outline:x-circle</FuseSvgIcon>
					</IconButton>
				</Tooltip>
			</Stack>
		</Paper>
	);
};

export default BirthsSelectionBanner;
