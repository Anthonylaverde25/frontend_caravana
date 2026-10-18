import { Chip } from '@mui/material';
import { ItemBehavior, behaviorInfo } from '@/core/items/domain/rules/itemBehavior';

/** "Artículo con stock", "Artículo sin stock" or "Servicio", with its color. */
export default function ItemBehaviorChip({ behavior }: { behavior: ItemBehavior }) {
	const info = behaviorInfo(behavior);

	return (
		<Chip
			size="small"
			label={info.label}
			color={info.color}
			variant="outlined"
			sx={{ fontWeight: 600, fontSize: '0.72rem', height: 22 }}
		/>
	);
}
