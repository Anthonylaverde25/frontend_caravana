import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ITEM_BEHAVIORS, ItemBehavior } from '@/core/items/domain/rules/itemBehavior';

interface ItemBehaviorPickerProps {
	value: ItemBehavior;
	onChange: (value: ItemBehavior) => void;
	/** The item has movements: its behaviour is frozen (plan 4.10). */
	locked?: boolean;
}

/** One control for type and track_stock: the three cases that make sense. */
export default function ItemBehaviorPicker({ value, onChange, locked = false }: ItemBehaviorPickerProps) {
	return (
		<Stack spacing={1}>
			<Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '1px' }}>
				Qué es{locked ? ' · tiene movimientos: no se puede cambiar' : ''}
			</Typography>
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1 }}>
				{ITEM_BEHAVIORS.map((b) => {
					const selected = b.value === value;
					return (
						<ButtonBase
							key={b.value}
							onClick={() => onChange(b.value)}
							disabled={locked && !selected}
							sx={(theme) => ({
								display: 'block',
								textAlign: 'left',
								p: 1.5,
								borderRadius: '6px',
								border: 1,
								borderColor: selected ? 'primary.main' : 'divider',
								bgcolor: selected ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
								boxShadow: selected ? `inset 0 0 0 1px ${theme.palette.primary.main}` : 'none',
								opacity: locked && !selected ? 0.45 : 1
							})}
						>
							<Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: selected ? 'primary.main' : 'text.primary' }}>{b.label}</Typography>
							<Typography variant="caption" color="text.secondary">
								{b.description}
							</Typography>
						</ButtonBase>
					);
				})}
			</Box>
		</Stack>
	);
}
