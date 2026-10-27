import { Box, Paper, Stack, Typography } from '@mui/material';
import { ItemDetail } from '@/core/items/domain/entities/Item';
import { behaviorInfo } from '@/core/items/domain/rules/itemBehavior';
import SemenProfileCard from '@/ui/semen/components/profile/SemenProfileCard';

/** The item's general data, read-only; "Editar" opens the form dialog. */
export default function ItemGeneralTab({ item }: { item: ItemDetail }) {
	const rows: [string, string][] = [
		['Qué es', `${behaviorInfo(item.behavior).label} · ${behaviorInfo(item.behavior).description}`],
		['Código', item.code],
		['Categoría', item.category?.path ?? 'Sin categoría'],
		['Unidad', item.unit ? `${item.unit.name} (${item.unit.symbol})${item.unit.isConvertible ? '' : ' · no convertible'}` : '—'],
		['Descripción', item.description ?? '—']
	];

	return (
		<Stack spacing={2}>
		<Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', maxWidth: 760 }}>
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, rowGap: 1.5, columnGap: 2 }}>
				{rows.map(([label, value]) => (
					<Box key={label} sx={{ display: 'contents' }}>
						<Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
						<Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{value}</Typography>
					</Box>
				))}
			</Box>
		</Paper>
		{item.semenProfile && <SemenProfileCard itemId={item.id} profile={item.semenProfile} />}
		</Stack>
	);
}
