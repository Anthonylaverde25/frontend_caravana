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
	/** Offers "create" at the end of the list, with what was typed, for an item not in the catalogue. */
	onCreate?: (name: string) => void;
}

/** The "create" entry appended to the options; never a real item. */
type CreateOption = { create: true; name: string };
type Option = Item | CreateOption;

const isCreate = (option: Option): option is CreateOption => 'create' in option;

/** The article or service of a row, searched by code or name; the caption says how it behaves. */
export default function ItemPickerCell({
	items,
	value,
	onChange,
	error,
	placeholder = 'Buscar ítem…',
	onCreate
}: ItemPickerCellProps) {
	const { cellSx, inputSx, errorRing } = useGridCellStyles();
	const selected = items.find((i) => i.id === value) ?? null;

	return (
		<TableCell sx={{ ...cellSx, minWidth: 220, ...(error ? errorRing : {}) }}>
			<Autocomplete<Option>
				size="small"
				options={items}
				value={selected}
				onChange={(_, option) => {
					if (option === null) {
						onChange(null);
						return;
					}

					if (isCreate(option)) {
						onCreate?.(option.name);
						return;
					}

					onChange(option);
				}}
				// The theme raises dialogs to 9999: the list has to open above the full-screen entry.
				slotProps={{ popper: { sx: { zIndex: 10000 } } }}
				getOptionLabel={(option) => option.name}
				isOptionEqualToValue={(option, current) =>
					!isCreate(option) && !isCreate(current) && option.id === current.id
				}
				filterOptions={(options, { inputValue }) => {
					const term = inputValue.trim().toLowerCase();
					const found = term
						? options.filter((o) => !isCreate(o) && `${o.code} ${o.name}`.toLowerCase().includes(term))
						: options;

					return onCreate ? [...found, { create: true, name: inputValue.trim() }] : found;
				}}
				renderOption={(props, option) =>
					isCreate(option) ? (
						<Box
							component="li"
							{...props}
							key="__create"
							sx={{ borderTop: 1, borderColor: 'divider' }}
						>
							<Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'primary.main' }}>
								{option.name ? `+ Crear «${option.name}»…` : '+ Nuevo artículo o servicio…'}
							</Typography>
						</Box>
					) : (
						<Box
							component="li"
							{...props}
							key={option.id}
						>
							<Box>
								<Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{option.name}</Typography>
								<Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
									{option.code} · {behaviorInfo(option.behavior).caption} · {option.unit?.symbol}
								</Typography>
							</Box>
						</Box>
					)
				}
				renderInput={(params) => (
					<TextField
						{...params}
						placeholder={placeholder}
						sx={inputSx}
					/>
				)}
			/>
		</TableCell>
	);
}
