import { useState } from 'react';
import { IconButton, Tooltip, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Item } from '@/core/items/domain/entities/Item';
import ItemPickerCell from '@/ui/stock/components/cells/ItemPickerCell';
import { FiscalLineState, LineRead } from './fiscalEntryState';
import LinkItemDialog from './LinkItemDialog';

interface FiscalLineItemCellProps {
	line: FiscalLineState;
	items: Item[];
	error?: string;
	/** Chosen in the selector: MANUAL; chosen in the link dialog: LINKED. */
	onPickItem: (item: Item | null, origin?: 'MANUAL' | 'LINKED') => void;
	onCreateItem: (name: string) => void;
}

const SOURCE_HINT: Partial<Record<LineRead['source'], (read: LineRead) => string>> = {
	EXACT: () => 'Coincide con el nombre del ítem',
	LINKED: (read) => `Vinculado a mano: el papel dice «${read.description}»`
};

/**
 * "Artículo o servicio" of a row (Delivery G, part 05 §1). On a row read from the paper: one caption
 * line with what it said, an amber icon when the AI suggested the item, and the link action.
 */
export default function FiscalLineItemCell({ line, items, error, onPickItem, onCreateItem }: FiscalLineItemCellProps) {
	const [linking, setLinking] = useState(false);
	const read = line.read;

	if (!read) {
		return (
			<ItemPickerCell
				items={items}
				value={line.itemId}
				onChange={(item) => onPickItem(item)}
				onCreate={onCreateItem}
				error={error}
			/>
		);
	}

	const suggested = read.source === 'AI';
	const linked = read.source === 'LINKED';
	const hint = SOURCE_HINT[read.source]?.(read);

	return (
		<>
			<ItemPickerCell
				items={items}
				value={line.itemId}
				onChange={(item) => onPickItem(item, 'MANUAL')}
				onCreate={(name) => onCreateItem(name || read.description)}
				error={error}
				endAdornment={
					<>
						{suggested && (
							<Tooltip title={`Sugerido por IA${read.reason ? `: ${read.reason}` : ''}. Revisalo.`}>
								<FuseSvgIcon
									size={16}
									sx={{ color: 'warning.main', mr: 0.25 }}
								>
									heroicons-outline:sparkles
								</FuseSvgIcon>
							</Tooltip>
						)}
						<Tooltip title={hint ?? 'Vincular con un ítem existente'}>
							<IconButton
								size="small"
								aria-label="Vincular con un ítem existente"
								onClick={() => setLinking(true)}
								sx={{
									p: 0.25,
									color: linked ? 'primary.main' : 'text.secondary'
								}}
							>
								<FuseSvgIcon size={16}>
									{linked ? 'heroicons-solid:link' : 'heroicons-outline:link'}
								</FuseSvgIcon>
							</IconButton>
						</Tooltip>
					</>
				}
				caption={
					<Typography
						noWrap
						title={read.description}
						sx={{
							px: 1.5,
							pb: 0.5,
							fontSize: '0.66rem',
							color: 'text.secondary'
						}}
					>
						Leído: {read.description}
						{read.code ? ` · cód. ${read.code}` : ''}
					</Typography>
				}
			/>
			<LinkItemDialog
				open={linking}
				read={read}
				items={items}
				currentItemId={line.itemId}
				onClose={() => setLinking(false)}
				onLink={(item) => {
					onPickItem(item, 'LINKED');
					setLinking(false);
				}}
			/>
		</>
	);
}
