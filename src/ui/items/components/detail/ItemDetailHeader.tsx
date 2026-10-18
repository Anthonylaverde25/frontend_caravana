import { Button, Stack, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { ItemDetail } from '@/core/items/domain/entities/Item';
import ItemBehaviorChip from '../ItemBehaviorChip';

interface ItemDetailHeaderProps {
	item: ItemDetail;
	onEdit: () => void;
	onToggleActive: () => void;
}

/** Code, name, behavior, category and unit, with the item's actions. */
export default function ItemDetailHeader({ item, onEdit, onToggleActive }: ItemDetailHeaderProps) {
	return (
		<Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
			<Stack spacing={0.5}>
				<Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
					<Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>{item.code}</Typography>
					<Typography variant="h6" sx={{ fontWeight: 700, color: item.isActive ? 'text.primary' : 'text.disabled' }}>
						{item.name}
					</Typography>
					<ItemBehaviorChip behavior={item.behavior} />
					{!item.isActive && <Typography variant="caption" color="text.secondary">Desactivado</Typography>}
				</Stack>
				<Typography variant="body2" color="text.secondary">
					{item.category?.path ?? 'Sin categoría'} · Unidad: {item.unit ? `${item.unit.name} (${item.unit.symbol})` : '—'}
				</Typography>
			</Stack>
			<Stack direction="row" spacing={1}>
				<Button
					variant="text"
					onClick={onToggleActive}
					sx={{ fontWeight: 600, color: item.isActive ? 'text.secondary' : 'primary.main', textTransform: 'none' }}
				>
					{item.isActive ? 'Desactivar' : 'Reactivar'}
				</Button>
				<Button
					variant="contained"
					startIcon={<FuseSvgIcon size={18}>heroicons-outline:pencil-square</FuseSvgIcon>}
					onClick={onEdit}
					sx={{ borderRadius: '6px', fontWeight: 700, textTransform: 'none', boxShadow: 'none' }}
				>
					Editar
				</Button>
			</Stack>
		</Stack>
	);
}
