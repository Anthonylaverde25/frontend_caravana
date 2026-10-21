import { Stack, TextField, Typography } from '@mui/material';

interface TagCalvesContextCardProps {
	batchName: string;
	pending: number;
	taggedAt: string;
	onTaggedAtChange: (value: string) => void;
}

/** The batch and the day the tags were put on: one date for the whole load. */
export function TagCalvesContextCard({ batchName, pending, taggedAt, onTaggedAtChange }: TagCalvesContextCardProps) {
	return (
		<Stack
			direction={{ xs: 'column', sm: 'row' }}
			spacing={2}
			alignItems={{ sm: 'center' }}
			justifyContent="space-between"
		>
			<Stack spacing={0.25}>
				<Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{batchName}</Typography>
				<Typography
					variant="caption"
					color="text.secondary"
				>
					{pending === 1 ? '1 cría sin caravana' : `${pending} crías sin caravana`} · cargá sólo las que
					caravaneaste, el resto sigue pendiente
				</Typography>
			</Stack>
			<TextField
				label="Fecha de caravaneo"
				type="date"
				size="small"
				variant="filled"
				value={taggedAt}
				onChange={(e) => onTaggedAtChange(e.target.value)}
				InputLabelProps={{ shrink: true }}
				sx={{ bgcolor: 'action.hover', minWidth: 190 }}
			/>
		</Stack>
	);
}

export default TagCalvesContextCard;
