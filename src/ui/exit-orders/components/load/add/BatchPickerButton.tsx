import React, { useState } from 'react';
import { Box, Button, InputAdornment, Popover, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import BatchPickerList, { type BatchOption } from './BatchPickerList';
import { panelPaperSx, softButtonSx } from './addControlStyles';

interface BatchPickerButtonProps {
	options: BatchOption[];
	onToggle: (batch: BatchOption) => void;
}

const normalize = (value: string): string => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * "Agregar lotes": whole batches in their own picker. Several are ticked without it closing; each tick
 * adds or takes out the batch at once, and the footer sums what is in the load.
 */
export const BatchPickerButton: React.FC<BatchPickerButtonProps> = ({ options, onToggle }) => {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const [search, setSearch] = useState('');
	const term = normalize(search.trim());
	const visible = term ? options.filter((option) => normalize(option.name).includes(term)) : options;
	const inLoad = options.filter((option) => option.loaded > 0);
	const heads = inLoad.reduce((sum, option) => sum + option.loaded, 0);
	const open = anchor != null;

	return (
		<>
			<Button
				onClick={(e) => setAnchor(e.currentTarget)}
				aria-haspopup="dialog"
				aria-expanded={open}
				startIcon={<FuseSvgIcon size={18}>heroicons-outline:rectangle-stack</FuseSvgIcon>}
				endIcon={
					<FuseSvgIcon size={14}>
						{open ? 'heroicons-outline:chevron-up' : 'heroicons-outline:chevron-down'}
					</FuseSvgIcon>
				}
				sx={softButtonSx(open)}
			>
				Agregar lotes
			</Button>
			<Popover
				open={open}
				anchorEl={anchor}
				onClose={() => setAnchor(null)}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				slotProps={{ paper: { sx: { ...panelPaperSx, width: 420, maxWidth: 'calc(100vw - 32px)' } } }}
			>
				<Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
					<TextField
						autoFocus
						fullWidth
						size="small"
						placeholder="Buscar lote"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						inputProps={{ 'aria-label': 'Buscar lote' }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<FuseSvgIcon size={16}>heroicons-outline:magnifying-glass</FuseSvgIcon>
								</InputAdornment>
							),
							sx: { borderRadius: '8px', fontSize: '0.84rem' }
						}}
					/>
				</Box>
				<Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
					<BatchPickerList
						options={visible}
						onToggle={onToggle}
					/>
				</Box>
				<Box
					sx={{
						px: 1.75,
						py: 1.25,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: 1.5,
						borderTop: 1,
						borderColor: 'divider',
						bgcolor: 'background.default'
					}}
				>
					<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
						<Box
							component="b"
							sx={{ color: 'text.primary' }}
						>
							{inLoad.length} {inLoad.length === 1 ? 'lote' : 'lotes'}
						</Box>
						{` · ${heads} cabezas`}
					</Typography>
					<Button
						size="small"
						variant="contained"
						onClick={() => setAnchor(null)}
						sx={{
							height: 32,
							px: 2,
							borderRadius: '6px',
							textTransform: 'none',
							fontWeight: 700,
							boxShadow: 'none'
						}}
					>
						Listo
					</Button>
				</Box>
			</Popover>
		</>
	);
};

export default BatchPickerButton;
