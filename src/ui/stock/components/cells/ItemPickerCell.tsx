import { Autocomplete, Box, TableCell, TextField, Typography } from '@mui/material';
import { useGridCellStyles } from 'src/components/sheet-grid/useGridCellStyles';
import { Item } from '@/core/items/domain/entities/Item';
import { behaviorInfo } from '@/core/items/domain/rules/itemBehavior';

interface ItemPickerCellProps {
	items: Item[];
	value: number | null;
	onChange: (item: Item | null) => void;
	error?: string;
	placeholder?: string;
}

/** The article or service of a row, searched by code or name; the caption says how it behaves. */
export default function ItemPickerCell({ items, value, onChange, error, placeholder = 'Buscar ítem…' }: ItemPickerCellProps) {
	const { cellSx, inputSx, errorRing } = useGridCellStyles();
	const selected = items.find((i) => i.id === value) ?? null;

	return (
		<TableCell sx={{ ...cellSx, minWidth: 220, ...(error ? errorRing : {}) }}>
			<Autocomplete
				size="small"
				options={items}
				value={selected}
				onChange={(_, item) => onChange(item)}
				// The theme raises dialogs to 9999: the list has to open above the full-screen entry.
				slotProps={{ popper: { sx: { zIndex: 10000 } } }}
				getOptionLabel={(item) => item.name}
				filterOptions={(options, { inputValue }) => {
					const term = inputValue.trim().toLowerCase();
					return term ? options.filter((o) => `${o.code} ${o.name}`.toLowerCase().includes(term)) : options;
				}}
				renderOption={(props, item) => (
					<Box component="li" {...props} key={item.id}>
						<Box>
							<Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</Typography>
							<Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
								{item.code} · {behaviorInfo(item.behavior).caption} · {item.unit?.symbol}
							</Typography>
						</Box>
					</Box>
				)}
				renderInput={(params) => <TextField {...params} placeholder={placeholder} sx={inputSx} />}
			/>
		</TableCell>
	);
}
