import { useState } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import { SemenProfile } from '@/core/semen/domain/entities/Semen';
import SemenProfileDialog from './SemenProfileDialog';

/** "Ficha del semen" in the item's general tab (plan 4.2): sire and type fixed, straw data editable (P12). */
export default function SemenProfileCard({ itemId, profile }: { itemId: number; profile: SemenProfile }) {
	const navigate = useNavigate();
	const [editing, setEditing] = useState(false);
	const sire = profile.sire;
	const rows: [string, string][] = [
		['Padre', [sire.name ?? `#${sire.id}`, sire.registryCode, sire.breed?.name, sire.caravan ? `toro propio ${sire.caravan.identification}` : null].filter(Boolean).join(' · ')],
		['Tipo', profile.semenType.label],
		['Conservación', profile.preservation.label],
		['Pajuela', [profile.strawSize?.label, profile.strawColor ? `pajuela ${profile.strawColor.label.toLowerCase()}` : null, profile.capColor ? `tapón ${profile.capColor.label.toLowerCase()}` : null].filter(Boolean).join(' · ') || 'Sin completar']
	];

	return (
		<Paper variant="outlined" sx={{ p: 2.5, borderRadius: '8px', maxWidth: 760 }}>
			<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
				<Typography sx={{ fontWeight: 700 }}>Ficha del semen</Typography>
				<Stack direction="row" spacing={1}>
					<Button size="small" onClick={() => navigate('/items/semen')} sx={{ textTransform: 'none', fontWeight: 600 }}>Ver partidas</Button>
					<Button size="small" variant="outlined" onClick={() => setEditing(true)} sx={{ textTransform: 'none', fontWeight: 700 }}>Editar</Button>
				</Stack>
			</Stack>
			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, rowGap: 1.5, columnGap: 2 }}>
				{rows.map(([label, value]) => (
					<Box key={label} sx={{ display: 'contents' }}>
						<Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
						<Typography variant="body2">{value}</Typography>
					</Box>
				))}
			</Box>
			<SemenProfileDialog open={editing} itemId={itemId} profile={profile} onClose={() => setEditing(false)} />
		</Paper>
	);
}
