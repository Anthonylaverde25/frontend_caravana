import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, Button, Dialog, DialogContent, IconButton, TextField, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Item } from '@/core/items/domain/entities/Item';
import { behaviorInfo } from '@/core/items/domain/rules/itemBehavior';
import { LineRead } from './fiscalEntryState';

interface LinkItemDialogProps {
	open: boolean;
	read: LineRead;
	items: Item[];
	/** The item the row has now, if any. */
	currentItemId: number | null;
	onClose: () => void;
	onLink: (item: Item) => void;
}

/**
 * "Vincular con un ítem existente" (Delivery G, part 05 §2): what the paper says, and which item of the
 * catalog it is. It sets this row only; nothing is remembered for other documents (G2).
 */
export default function LinkItemDialog({ open, read, items, currentItemId, onClose, onLink }: LinkItemDialogProps) {
	const [picked, setPicked] = useState<Item | null>(null);
	const [error, setError] = useState<string | null>(null);
	const suggested = read.suggestedItemId ?? null;

	useEffect(() => {
		if (!open) return;

		setPicked(items.find((i) => i.id === (currentItemId ?? suggested)) ?? null);
		setError(null);
	}, [open, items, currentItemId, suggested]);

	// The AI's candidate first, then the catalog as the selector shows it.
	const options = useMemo(
		() => [...items].sort((a, b) => Number(b.id === suggested) - Number(a.id === suggested)),
		[items, suggested]
	);

	const confirm = () => {
		if (!picked) {
			setError('Elegí el ítem del catálogo.');
			return;
		}

		onLink(picked);
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: { borderRadius: '8px', boxShadow: 1, bgcolor: 'background.paper' }
			}}
		>
			<Box
				sx={{
					p: 2,
					px: 3,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: 1,
					borderColor: 'divider'
				}}
			>
				<Typography
					variant="h6"
					sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}
				>
					Vincular con un ítem existente
				</Typography>
				<IconButton
					onClick={onClose}
					sx={{ color: 'primary.main' }}
				>
					<FuseSvgIcon size={20}>heroicons-outline:x-mark</FuseSvgIcon>
				</IconButton>
			</Box>
			<DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				<Box>
					<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.5 }}>
						El papel dice
					</Typography>
					<Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>«{read.description}»</Typography>
					{(read.code || read.quantity) && (
						<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>
							{[read.code && `cód. ${read.code}`, read.quantity && `cantidad ${read.quantity}`]
								.filter(Boolean)
								.join(' · ')}
						</Typography>
					)}
				</Box>
				<Autocomplete<Item>
					options={options}
					value={picked}
					onChange={(_, item) => {
						setPicked(item);
						setError(null);
					}}
					// The theme raises dialogs to 9999: the list has to open above this one.
					slotProps={{ popper: { sx: { zIndex: 10000 } } }}
					getOptionLabel={(item) => item.name}
					isOptionEqualToValue={(option, value) => option.id === value.id}
					filterOptions={(list, { inputValue }) => {
						const term = inputValue.trim().toLowerCase();
						return term ? list.filter((i) => `${i.code} ${i.name}`.toLowerCase().includes(term)) : list;
					}}
					renderOption={(props, item) => (
						<Box
							component="li"
							{...props}
							key={item.id}
						>
							<Box>
								<Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
									{item.name}
									{item.id === suggested && (
										<Typography
											component="span"
											sx={{
												ml: 1,
												fontSize: '0.7rem',
												color: 'warning.main',
												fontWeight: 700
											}}
										>
											Sugerido por IA
										</Typography>
									)}
								</Typography>
								<Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
									{item.code} · {behaviorInfo(item.behavior).caption} · {item.unit?.symbol}
								</Typography>
							</Box>
						</Box>
					)}
					renderInput={(params) => (
						<TextField
							{...params}
							label="Es este ítem"
							variant="filled"
							fullWidth
							error={!!error}
							helperText={error ?? (read.reason && picked?.id === suggested ? read.reason : ' ')}
							sx={{ '& .MuiFilledInput-root': { bgcolor: 'action.hover' } }}
						/>
					)}
				/>
			</DialogContent>
			<Box
				sx={{
					p: 2,
					px: 3,
					bgcolor: 'background.default',
					borderTop: 1,
					borderColor: 'divider',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}
			>
				<Button
					variant="text"
					onClick={onClose}
					sx={{ fontWeight: 600, color: 'primary.main', textTransform: 'none' }}
				>
					Cancelar
				</Button>
				<Button
					variant="contained"
					onClick={confirm}
					sx={{
						bgcolor: 'primary.main',
						color: 'primary.contrastText',
						px: 3.5,
						fontWeight: 700,
						borderRadius: '6px',
						textTransform: 'none',
						boxShadow: 'none',
						'&:hover': { bgcolor: 'primary.dark' }
					}}
				>
					Vincular
				</Button>
			</Box>
		</Dialog>
	);
}
