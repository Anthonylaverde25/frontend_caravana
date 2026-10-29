import React, { useState } from 'react';
import { Box, Button, Popover, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { matchPastedCaravans } from '@/ui/transfer-orders/components/register/matchPastedCaravans';
import { panelPaperSx, softButtonSx } from './addControlStyles';

interface PasteListButtonProps {
	caravans: { id: number; identification: string }[];
	onAdd: (ids: number[]) => void;
}

const Dot: React.FC<{ color: string }> = ({ color }) => (
	<Box sx={{ width: 8, height: 8, flex: 'none', borderRadius: '50%', bgcolor: color }} />
);

/**
 * "Pegar lista": the list that came by message or spreadsheet. What it finds and what it does not is
 * read before adding; "Agregar n" adds only the animals that can leave.
 */
export const PasteListButton: React.FC<PasteListButtonProps> = ({ caravans, onAdd }) => {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const [text, setText] = useState('');
	const match = text.trim() ? matchPastedCaravans(text, caravans) : null;
	const found = match?.matchedIds.length ?? 0;
	const open = anchor != null;

	const close = () => setAnchor(null);

	const add = () => {
		if (!match || found === 0) return;

		onAdd(match.matchedIds);
		setText('');
		close();
	};

	return (
		<>
			<Button
				onClick={(e) => setAnchor(e.currentTarget)}
				aria-haspopup="dialog"
				aria-expanded={open}
				startIcon={<FuseSvgIcon size={18}>heroicons-outline:clipboard-document-list</FuseSvgIcon>}
				sx={softButtonSx(open)}
			>
				Pegar lista
			</Button>
			<Popover
				open={open}
				anchorEl={anchor}
				onClose={close}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
				slotProps={{ paper: { sx: { ...panelPaperSx, width: 440, maxWidth: 'calc(100vw - 32px)' } } }}
			>
				<Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
					<TextField
						autoFocus
						multiline
						minRows={3}
						maxRows={8}
						fullWidth
						variant="filled"
						label="Caravanas que salen"
						placeholder="Una por línea, o separadas por coma o espacio"
						value={text}
						onChange={(e) => setText(e.target.value)}
						InputProps={{
							disableUnderline: true,
							sx: {
								borderRadius: '8px',
								bgcolor: 'action.hover',
								fontFamily: 'monospace',
								fontSize: '0.82rem'
							}
						}}
					/>
					{match && (
						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, fontSize: '0.8rem' }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Dot color="primary.main" />
								{found} se agregan a la orden
							</Box>
							{match.notFound.length > 0 && (
								<Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
									<Box sx={{ pt: '5px' }}>
										<Dot color="warning.main" />
									</Box>
									<Box sx={{ minWidth: 0 }}>
										{match.notFound.length} no están en la hacienda o ya no pueden salir:{' '}
										<Typography
											component="span"
											sx={{
												fontFamily: 'monospace',
												fontSize: '0.78rem',
												color: 'warning.dark',
												wordBreak: 'break-word'
											}}
										>
											{match.notFound.join(' · ')}
										</Typography>
									</Box>
								</Box>
							)}
						</Box>
					)}
					<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
						<Button
							size="small"
							onClick={close}
							sx={{ height: 32, textTransform: 'none', fontWeight: 600, color: 'text.primary' }}
						>
							Cancelar
						</Button>
						<Button
							size="small"
							variant="contained"
							onClick={add}
							sx={{
								height: 32,
								px: 2,
								borderRadius: '6px',
								textTransform: 'none',
								fontWeight: 700,
								boxShadow: 'none'
							}}
						>
							{found > 0 ? `Agregar ${found}` : 'Agregar'}
						</Button>
					</Box>
				</Box>
			</Popover>
		</>
	);
};

export default PasteListButton;
