import React from 'react';
import { Paper, Stack, Box, Typography, Button, IconButton, Tooltip, useTheme, alpha } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

interface SupplierSelectionBannerProps {
	selectedCount: number;
	onExportSelected: () => void;
	onClearSelection: () => void;
}

/**
 * SupplierSelectionBanner
 * Matches canonical Pedigree selection banner from ExternalBatchAssignmentView.
 */
export function SupplierSelectionBanner({
	selectedCount,
	onExportSelected,
	onClearSelection
}: SupplierSelectionBannerProps) {
	const theme = useTheme();
	const isDark = theme.palette.mode === 'dark';
	const active = isDark ? '#60a5fa' : '#0a6ed1';

	if (selectedCount === 0) return null;

	return (
		<Paper
			elevation={0}
			sx={{
				mb: 2,
				p: 1.5,
				borderRadius: '8px',
				border: '1px solid',
				borderColor: alpha(active, isDark ? 0.22 : 0.16),
				bgcolor: alpha(active, isDark ? 0.08 : 0.05),
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				flexWrap: 'wrap',
				gap: 1.5
			}}
		>
			<Stack direction="row" spacing={1.5} alignItems="center">
				<Box
					sx={{
						px: 1.25,
						py: 0.5,
						borderRadius: '6px',
						bgcolor: alpha(active, 0.14),
						color: active,
						fontSize: '0.75rem',
						fontWeight: 700,
						whiteSpace: 'nowrap'
					}}
				>
					{selectedCount} {selectedCount === 1 ? 'proveedor seleccionado' : 'proveedores seleccionados'}
				</Box>
				<Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
					Acciones para los proveedores seleccionados
				</Typography>
			</Stack>

			<Stack direction="row" spacing={1} alignItems="center">
				<Button
					variant="contained"
					size="small"
					onClick={onExportSelected}
					startIcon={<FuseSvgIcon size={16}>heroicons-outline:download</FuseSvgIcon>}
					sx={{
						fontWeight: 700,
						textTransform: 'none',
						px: 2,
						whiteSpace: 'nowrap',
						height: 30
					}}
				>
					Exportar Datos
				</Button>

				<Tooltip title="Limpiar Selección">
					<IconButton
						size="small"
						onClick={onClearSelection}
						sx={{ height: 30, width: 30, color: 'text.secondary' }}
					>
						<FuseSvgIcon size={16}>heroicons-outline:x-circle</FuseSvgIcon>
					</IconButton>
				</Tooltip>
			</Stack>
		</Paper>
	);
}

export default SupplierSelectionBanner;
