import React from 'react';
import { Box, Button, IconButton, Paper, Stack, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

/** What the selection is made of decides what can be done with it. */
export type SelectionKind =
	| { kind: 'free' }
	| { kind: 'order'; orderId: number; code: string }
	| { kind: 'mixed' };

interface BirthsSelectionBannerProps {
	selectedCount: number;
	summary: string;
	selection: SelectionKind;
	onWean: (target: 'new' | 'register') => void;
	onRegisterWeaned: (orderId: number) => void;
	onClearSelection: () => void;
}

/**
 * The selection bar: free calves start a new order or a registered weaning; calves of one weaning
 * order are registered as weaned with it. A mix of both is not acted on — it says why.
 */
export const BirthsSelectionBanner: React.FC<BirthsSelectionBannerProps> = ({
	selectedCount,
	summary,
	selection,
	onWean,
	onRegisterWeaned,
	onClearSelection
}) => {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const active = isDark ? '#60a5fa' : '#0a6ed1';

	if (selectedCount === 0) return null;

	const buttonSx = { textTransform: 'none', fontWeight: 700, borderRadius: '6px', height: 32, px: 2, whiteSpace: 'nowrap' } as const;

	return (
		<Paper
			elevation={0}
			sx={{
				p: 1.25,
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
			<Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
				<Box sx={{ px: 1.25, py: 0.5, borderRadius: '6px', bgcolor: alpha(active, 0.18), color: active, fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
					{selectedCount} {selectedCount === 1 ? 'cría seleccionada' : 'crías seleccionadas'}
				</Box>
				<Typography variant="body2" sx={{ fontWeight: 600 }}>
					{selection.kind === 'mixed' ? 'Elegí crías sin orden, o de una sola orden de destete.' : summary}
				</Typography>
			</Stack>

			<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
				{selection.kind === 'free' && (
					<>
						<Button
							variant="outlined"
							size="small"
							onClick={() => onWean('register')}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:clipboard-document-check</FuseSvgIcon>}
							sx={buttonSx}
						>
							Registrar destete ({selectedCount})
						</Button>
						<Button
							variant="contained"
							size="small"
							disableElevation
							onClick={() => onWean('new')}
							startIcon={<FuseSvgIcon size={16}>heroicons-outline:document-plus</FuseSvgIcon>}
							sx={buttonSx}
						>
							Nueva orden de destete ({selectedCount})
						</Button>
					</>
				)}
				{selection.kind === 'order' && (
					<Button
						variant="contained"
						size="small"
						disableElevation
						onClick={() => onRegisterWeaned(selection.orderId)}
						startIcon={<FuseSvgIcon size={16}>heroicons-outline:check</FuseSvgIcon>}
						sx={buttonSx}
					>
						Registrar destetadas ({selectedCount})
					</Button>
				)}
				<Tooltip title="Limpiar selección">
					<IconButton size="small" onClick={onClearSelection} aria-label="Limpiar selección" sx={{ height: 32, width: 32, color: 'text.secondary' }}>
						<FuseSvgIcon size={18}>heroicons-outline:x-circle</FuseSvgIcon>
					</IconButton>
				</Tooltip>
			</Stack>
		</Paper>
	);
};

export default BirthsSelectionBanner;
